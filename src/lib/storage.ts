// Simple localStorage-backed mock store for the SIMS frontend.
// Replace these helpers with real API calls when wiring backend.

export type Role = "admin" | "manager" | "cashier";

export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // mock only
  role: Role;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image?: string;
  supplierId?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  address: string;
}

export interface Sale {
  id: string;
  customerId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  date: string;
  cashier: string;
}

const KEYS = {
  users: "sims_users",
  customers: "sims_customers",
  products: "sims_products",
  suppliers: "sims_suppliers",
  sales: "sims_sales",
  session: "sims_session",
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const uid = () => Math.random().toString(36).slice(2, 10);

// Seed default admin on first run
export function seed() {
  const users = read<User[]>(KEYS.users, []);
  if (users.length === 0) {
    write<User[]>(KEYS.users, [
      {
        id: uid(),
        username: "admin",
        email: "admin@tuzamurane.rw",
        password: "admin123",
        role: "admin",
      },
    ]);
  }
}

// Users / Auth
export const usersStore = {
  all: () => read<User[]>(KEYS.users, []),
  add: (u: Omit<User, "id">) => {
    const list = read<User[]>(KEYS.users, []);
    const user: User = { ...u, id: uid() };
    write(KEYS.users, [...list, user]);
    return user;
  },
};

export const session = {
  get: () => read<{ userId: string; token: string } | null>(KEYS.session, null),
  set: (userId: string) => write(KEYS.session, { userId, token: btoa(`${userId}:${Date.now()}`) }),
  clear: () => localStorage.removeItem(KEYS.session),
  currentUser: (): User | null => {
    const s = read<{ userId: string } | null>(KEYS.session, null);
    if (!s) return null;
    return usersStore.all().find((u) => u.id === s.userId) ?? null;
  },
};

function crud<T extends { id: string }>(key: string) {
  return {
    all: () => read<T[]>(key, []),
    add: (item: Omit<T, "id">) => {
      const list = read<T[]>(key, []);
      const created = { ...(item as object), id: uid() } as T;
      write(key, [...list, created]);
      return created;
    },
    update: (id: string, patch: Partial<T>) => {
      const list = read<T[]>(key, []);
      const next = list.map((x) => (x.id === id ? { ...x, ...patch } : x));
      write(key, next);
    },
    remove: (id: string) => {
      const list = read<T[]>(key, []);
      write(
        key,
        list.filter((x) => x.id !== id),
      );
    },
  };
}

export const customersStore = crud<Customer>(KEYS.customers);
export const productsStore = crud<Product>(KEYS.products);
export const suppliersStore = crud<Supplier>(KEYS.suppliers);
export const salesStore = crud<Sale>(KEYS.sales);
