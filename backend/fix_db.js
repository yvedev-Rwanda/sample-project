const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tuzamurane_sims'
});

db.connect(err => {
    if (err) {
        console.error('Connection error:', err.message);
        process.exit(1);
    }
    console.log('Connected to DB.');
    
    db.query("SHOW COLUMNS FROM customers LIKE 'email'", (err, results) => {
        if (err) {
            console.error('Error checking columns:', err.message);
            process.exit(1);
        }
        
        if (results.length === 0) {
            console.log('Adding email column to customers table...');
            db.query("ALTER TABLE customers ADD COLUMN email VARCHAR(100) AFTER name", (err) => {
                if (err) {
                    console.error('Error adding column:', err.message);
                } else {
                    console.log('Column added successfully!');
                }
                db.end();
            });
        } else {
            console.log('Email column already exists.');
            db.end();
        }
    });
});
