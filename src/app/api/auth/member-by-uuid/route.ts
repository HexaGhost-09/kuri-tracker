import { NextResponse } from 'next/server';
import { pool, initDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    await initDb();
    
    const { searchParams } = new URL(request.url);
    const uuid = searchParams.get('uuid');
    
    if (!uuid) {
      return NextResponse.json({ error: 'UUID parameter is required' }, { status: 400 });
    }
    
    const result = await pool.query(
      'SELECT name, email, uuid FROM users WHERE uuid = $1 AND role = \'member\'',
      [uuid]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'No registered member found with this UUID' }, { status: 404 });
    }
    
    return NextResponse.json({ member: result.rows[0] });
  } catch (error: any) {
    console.error('Error fetching member by UUID:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
  }
}
