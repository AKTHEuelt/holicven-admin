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

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image_url: string;
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

export async function getEvents(): Promise<Event[]> {
  const result = await pool.query('SELECT * FROM events ORDER BY date ASC');
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

export async function createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
  const result = await pool.query(
    `INSERT INTO products (name, description, price, category, active)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [product.name, product.description, product.price, product.category, product.active]
  );
  return result.rows[0];
}

export async function updateProduct(id: number, updates: Partial<Product>): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(updates.name);
  }
  if (updates.description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(updates.description);
  }
  if (updates.price !== undefined) {
    fields.push(`price = $${paramIndex++}`);
    values.push(updates.price);
  }
  if (updates.category !== undefined) {
    fields.push(`category = $${paramIndex++}`);
    values.push(updates.category);
  }
  if (updates.active !== undefined) {
    fields.push(`active = $${paramIndex++}`);
    values.push(updates.active);
  }

  if (fields.length > 0) {
    values.push(id);
    await pool.query(`UPDATE products SET ${fields.join(', ')} WHERE id = $${paramIndex}`, values);
  }
}

export async function deleteProduct(id: number): Promise<void> {
  await pool.query('DELETE FROM products WHERE id = $1', [id]);
}

export async function createEvent(event: Omit<Event, 'id' | 'created_at'>): Promise<Event> {
  const result = await pool.query(
    `INSERT INTO events (title, description, date, time, location, image_url, active)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [event.title, event.description, event.date, event.time, event.location, event.image_url, event.active]
  );
  return result.rows[0];
}

export async function updateEvent(id: number, updates: Partial<Event>): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.title !== undefined) {
    fields.push(`title = $${paramIndex++}`);
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(updates.description);
  }
  if (updates.date !== undefined) {
    fields.push(`date = $${paramIndex++}`);
    values.push(updates.date);
  }
  if (updates.time !== undefined) {
    fields.push(`time = $${paramIndex++}`);
    values.push(updates.time);
  }
  if (updates.location !== undefined) {
    fields.push(`location = $${paramIndex++}`);
    values.push(updates.location);
  }
  if (updates.image_url !== undefined) {
    fields.push(`image_url = $${paramIndex++}`);
    values.push(updates.image_url);
  }
  if (updates.active !== undefined) {
    fields.push(`active = $${paramIndex++}`);
    values.push(updates.active);
  }

  if (fields.length > 0) {
    values.push(id);
    await pool.query(`UPDATE events SET ${fields.join(', ')} WHERE id = $${paramIndex}`, values);
  }
}

export async function deleteEvent(id: number): Promise<void> {
  await pool.query('DELETE FROM events WHERE id = $1', [id]);
}

export default pool;
