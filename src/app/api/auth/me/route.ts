import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool, initDb } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'kuriflow_auth_secret_token_key_1199';

export async function GET() {
  try {
    await initDb();
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('kuri_auth_token');

    if (!tokenCookie) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const decoded = jwt.verify(tokenCookie.value, JWT_SECRET) as { userId: number };
    
    const result = await pool.query('SELECT id, name, email, role, uuid FROM users WHERE id = $1', [decoded.userId]);
    if (result.rows.length === 0) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = result.rows[0];
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Session verify error:', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
