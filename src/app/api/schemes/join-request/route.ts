import { NextResponse } from 'next/server';
import { pool, initDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    await initDb();
    const { userId, schemeUuid } = await request.json();
    if (!userId || !schemeUuid) {
      return NextResponse.json({ error: 'userId and schemeUuid are required' }, { status: 400 });
    }
    // Find the scheme by its UUID
    const schemeResult = await pool.query('SELECT id FROM kuries WHERE scheme_uuid = $1', [schemeUuid]);
    if (schemeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Scheme not found' }, { status: 404 });
    }
    const kuriId = schemeResult.rows[0].id;
    // Insert join request
    await pool.query(
      `INSERT INTO scheme_join_requests (user_id, kuri_id, status) VALUES ($1, $2, 'pending')`,
      [userId, kuriId]
    );
    return NextResponse.json({ message: 'Join request submitted for approval' });
  } catch (error: any) {
    console.error('Error creating join request:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
  }
}
