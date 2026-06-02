import { NextResponse } from 'next/server';
import { pool, initDb } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    // Ensure DB is initialized
    await initDb();

    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const checkUser = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (checkUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email.toLowerCase(), hashedPassword]
    );

    const newUser = result.rows[0];

    return NextResponse.json(
      { message: 'Registration successful', user: newUser },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error during registration: ' + error.message },
      { status: 500 }
    );
  }
}
