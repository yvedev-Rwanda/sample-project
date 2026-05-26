const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'tuzamurane_secret_key_2025';

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tuzamurane_sims',
    multipleStatements: true
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err.message);
        return;
    }
    console.log('Connected to MySQL Database.');
});

// Middleware for authentication
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token.' });
        req.user = user;
        next();
    });
};

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.query('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)', 
        [username, email, hashedPassword, role || 'cashier'], (err) => {
            if (err) return res.status(500).json({ message: err.message });
            res.status(201).json({ message: 'User registered successfully' });
        });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) return res.status(500).json({ message: err.message });
        if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

        const user = results[0];
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, username: user.username, role: user.role, email: user.email } });
    });
});

// --- CATEGORY ROUTES ---
app.get('/api/categories', authenticateToken, (req, res) => {
    db.query('SELECT * FROM categories', (err, results) => {
        if (err) res.status(500).send(err);
        else res.json(results);
    });
});

// --- CUSTOMER ROUTES ---
app.get('/api/customers', authenticateToken, (req, res) => {
    db.query('SELECT * FROM customers ORDER BY created_at DESC', (err, results) => {
        if (err) res.status(500).send(err);
        else res.json(results);
    });
});

app.post('/api/customers', authenticateToken, (req, res) => {
    const { name, phone, address } = req.body;
    db.query('INSERT INTO customers (name, phone, address) VALUES (?, ?, ?)', [name, phone, address], (err, result) => {
        if (err) res.status(500).send(err);
        else res.status(201).json({ id: result.insertId, ...req.body });
    });
});

// --- PRODUCT ROUTES ---
app.get('/api/products', authenticateToken, (req, res) => {
    db.query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC', (err, results) => {
        if (err) res.status(500).send(err);
        else res.json(results);
    });
});

app.post('/api/products', authenticateToken, (req, res) => {
    const { name, category_id, price, stock, unit, image, supplier_id } = req.body;
    db.query('INSERT INTO products (name, category_id, price, stock, unit, image, supplier_id) VALUES (?, ?, ?, ?, ?, ?, ?)', 
    [name, category_id, price, stock, unit, image, supplier_id], (err, result) => {
        if (err) res.status(500).send(err);
        else res.status(201).json({ id: result.insertId, ...req.body });
    });
});

// --- SALES ROUTES (Transaction) ---
app.post('/api/sales', authenticateToken, (req, res) => {
    const { customer_id, items } = req.body; // Expect items array: [{product_id, quantity, unit_price}]
    const cashier_id = req.user.id;
    const total_amount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    db.beginTransaction(err => {
        if (err) return res.status(500).send(err);

        // 1. Insert into sales (header)
        db.query('INSERT INTO sales (customer_id, cashier_id, total_amount) VALUES (?, ?, ?)', 
        [customer_id, cashier_id, total_amount], (err, result) => {
            if (err) return db.rollback(() => res.status(500).send(err));
            
            const sale_id = result.insertId;
            
            // 2. Insert items and update stock for each
            const itemQueries = items.map(item => {
                return new Promise((resolve, reject) => {
                    const subtotal = item.quantity * item.unit_price;
                    db.query('INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
                    [sale_id, item.product_id, item.quantity, item.unit_price, subtotal], (err) => {
                        if (err) return reject(err);
                        db.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id], (err) => {
                            if (err) return reject(err);
                            resolve();
                        });
                    });
                });
            });

            Promise.all(itemQueries)
                .then(() => {
                    db.commit(err => {
                        if (err) return db.rollback(() => res.status(500).send(err));
                        res.status(201).json({ id: sale_id, message: 'Sale completed successfully' });
                    });
                })
                .catch(err => db.rollback(() => res.status(500).send(err)));
        });
    });
});

app.get('/api/sales', authenticateToken, (req, res) => {
    db.query(`
        SELECT s.*, c.name as customer_name, u.username as cashier_name 
        FROM sales s 
        LEFT JOIN customers c ON s.customer_id = c.id 
        LEFT JOIN users u ON s.cashier_id = u.id 
        ORDER BY s.date DESC`, (err, results) => {
        if (err) res.status(500).send(err);
        else res.json(results);
    });
});

// --- SUPPLIER ROUTES ---
app.get('/api/suppliers', authenticateToken, (req, res) => {
    db.query('SELECT * FROM suppliers ORDER BY name ASC', (err, results) => {
        if (err) res.status(500).send(err);
        else res.json(results);
    });
});

// --- REPORT ROUTES ---
app.get('/api/reports/detailed', authenticateToken, (req, res) => {
    const query = `
        SELECT si.*, p.name as product_name, s.date, c.name as customer_name, u.username as cashier_name
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        JOIN sales s ON si.sale_id = s.id
        LEFT JOIN customers c ON s.customer_id = c.id
        LEFT JOIN users u ON s.cashier_id = u.id
        ORDER BY s.date DESC
    `;
    db.query(query, (err, results) => {
        if (err) res.status(500).send(err);
        else res.json(results);
    });
});

app.post('/api/suppliers', authenticateToken, (req, res) => {
    const { name, contact, email, address } = req.body;
    db.query('INSERT INTO suppliers (name, contact, email, address) VALUES (?, ?, ?, ?)', 
    [name, contact, email, address], (err, result) => {
        if (err) res.status(500).send(err);
        else res.status(201).json({ id: result.insertId, ...req.body });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
