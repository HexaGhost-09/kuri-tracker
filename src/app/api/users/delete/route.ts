import { NextResponse } from 'next/server';
import { pool, initDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    await initDb();
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    // Soft delete the user by setting deleted_at
    await pool.query('UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [userId]);
    return NextResponse.json({ message: 'Account deleted (soft)' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
  }
}
