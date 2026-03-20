import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'holicven_db',
  user: process.env.DB_USER || 'holicven_admin',
  password: process.env.DB_PASSWORD || 'holicven_pass_2026',
});

export interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  product_name: string;
  product_price: number;
  quantity: number;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  active: boolean;
  created_at: Date;
}

export async function getOrders(): Promise<Order[]> {
  const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
  return result.rows;
}

export async function getProducts(): Promise<Product[]> {
  const result = await pool.query('SELECT * FROM products ORDER BY name');
  return result.rows;
}

export async function createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
  const result = await pool.query(
    `INSERT INTO orders (customer_name, customer_email, customer_phone, product_name, product_price, quantity, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [order.customer_name, order.customer_email, order.customer_phone, order.product_name, order.product_price, order.quantity, order.status]
  );
  return result.rows[0];
}

export async function updateOrderStatus(id: number, status: string): Promise<void> {
  await pool.query('UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [status, id]);
}

export default pool;
