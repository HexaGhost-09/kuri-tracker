import { NextResponse } from 'next/server';
import { pool, initDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    await initDb();
    // Truncate all tables while preserving schema
    await pool.query(`
      TRUNCATE TABLE 
        users,
        kuries,
        kuri_subscribers,
        global_subscribers,
        scheme_join_requests,
        auctions,
        payments,
        reminders
      RESTART IDENTITY CASCADE;
    `);
    return NextResponse.json({ message: 'All data cleared successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Clear data error:', error);
    return NextResponse.json({ error: 'Failed to clear data: ' + error.message }, { status: 500 });
  }
}
