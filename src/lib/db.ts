import { Pool } from 'pg';

const connectionString = 'postgresql://neondb_owner:npg_v7GXbfslJ0qA@ep-silent-meadow-afxcjpgq-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require';

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Neon serverless connections
  }
});

// Self-healing database initialization
export async function initDb() {
  const client = await pool.connect();
  try {
    // Create Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Kuries table
    await client.query(`
      CREATE TABLE IF NOT EXISTS kuries (
        id VARCHAR(50) PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        total_value NUMERIC(12, 2) NOT NULL,
        duration_months INTEGER NOT NULL,
        installment_amount NUMERIC(12, 2) NOT NULL,
        foreman_commission_percent NUMERIC(4, 2) NOT NULL,
        start_date VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        current_month INTEGER NOT NULL DEFAULT 1
      );
    `);

    // Create Kuri Subscribers (link between Kuri and registered users/members)
    await client.query(`
      CREATE TABLE IF NOT EXISTS kuri_subscribers (
        id SERIAL PRIMARY KEY,
        kuri_id VARCHAR(50) NOT NULL REFERENCES kuries(id) ON DELETE CASCADE,
        subscriber_id VARCHAR(50) NOT NULL,
        ticket_number INTEGER NOT NULL,
        is_prized BOOLEAN NOT NULL DEFAULT FALSE,
        prized_month INTEGER,
        prized_amount NUMERIC(12, 2)
      );
    `);

    // Create Subscribers Registry table (Global contacts per user)
    await client.query(`
      CREATE TABLE IF NOT EXISTS global_subscribers (
        id VARCHAR(50) PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(100)
      );
    `);

    // Create Auctions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS auctions (
        id VARCHAR(50) PRIMARY KEY,
        kuri_id VARCHAR(50) NOT NULL REFERENCES kuries(id) ON DELETE CASCADE,
        month INTEGER NOT NULL,
        date VARCHAR(20) NOT NULL,
        winning_subscriber_id VARCHAR(50) NOT NULL,
        winning_bid NUMERIC(12, 2) NOT NULL,
        discount NUMERIC(12, 2) NOT NULL,
        commission NUMERIC(12, 2) NOT NULL,
        dividend_per_member NUMERIC(12, 2) NOT NULL,
        net_installment NUMERIC(12, 2) NOT NULL
      );
    `);

    // Create Payments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(50) PRIMARY KEY,
        kuri_id VARCHAR(50) NOT NULL REFERENCES kuries(id) ON DELETE CASCADE,
        subscriber_id VARCHAR(50) NOT NULL,
        month INTEGER NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        date VARCHAR(20),
        status VARCHAR(20) NOT NULL DEFAULT 'pending'
      );
    `);

    console.log('PostgreSQL database schemas successfully initialized or verified.');
  } catch (error) {
    console.error('Error during database initialization:', error);
  } finally {
    client.release();
  }
}
