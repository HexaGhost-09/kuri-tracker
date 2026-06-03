import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool, initDb } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'kuriflow_auth_secret_token_key_1199';

// GET: Fetch join requests for admin's kuries OR member's own requests
export async function GET() {
  try {
    await initDb();
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('kuri_auth_token');

    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(tokenCookie.value, JWT_SECRET) as { userId: number };
    const userId = decoded.userId;

    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const role = userResult.rows[0].role;

    if (role === 'admin') {
      // Return pending/approved requests for Schemes owned by this admin
      const result = await pool.query(
        `SELECT sjr.id, sjr.status, sjr.requested_at as "requestedAt",
                u.name as "userName", u.email as "userEmail", u.uuid as "userUuid",
                k.id as "kuriId", k.name as "kuriName", k.installment_amount as "installmentAmount"
         FROM scheme_join_requests sjr
         INNER JOIN users u ON sjr.user_id = u.id
         INNER JOIN kuries k ON sjr.kuri_id = k.id
         WHERE k.user_id = $1
         ORDER BY sjr.requested_at DESC`,
        [userId]
      );
      return NextResponse.json({ requests: result.rows });
    } else {
      // Return member's own requests
      const result = await pool.query(
        `SELECT sjr.id, sjr.status, sjr.requested_at as "requestedAt",
                k.id as "kuriId", k.name as "kuriName", k.installment_amount as "installmentAmount"
         FROM scheme_join_requests sjr
         INNER JOIN kuries k ON sjr.kuri_id = k.id
         WHERE sjr.user_id = $1
         ORDER BY sjr.requested_at DESC`,
        [userId]
      );
      return NextResponse.json({ requests: result.rows });
    }
  } catch (error: any) {
    console.error('Error fetching join requests:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
  }
}

// POST: Submit a join request by schemeUuid (for members)
export async function POST(request: Request) {
  try {
    await initDb();
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('kuri_auth_token');

    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(tokenCookie.value, JWT_SECRET) as { userId: number };
    const userId = decoded.userId;

    const { schemeUuid } = await request.json();
    if (!schemeUuid) {
      return NextResponse.json({ error: 'schemeUuid is required' }, { status: 400 });
    }

    // Find the scheme by its UUID
    const schemeResult = await pool.query('SELECT id FROM kuries WHERE scheme_uuid = $1', [schemeUuid]);
    if (schemeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Scheme not found' }, { status: 404 });
    }
    const kuriId = schemeResult.rows[0].id;

    // Check if request already exists
    const checkResult = await pool.query(
      'SELECT id, status FROM scheme_join_requests WHERE user_id = $1 AND kuri_id = $2',
      [userId, kuriId]
    );

    if (checkResult.rows.length > 0) {
      const status = checkResult.rows[0].status;
      return NextResponse.json({ 
        error: `You have already submitted a join request for this scheme. Status: ${status}` 
      }, { status: 400 });
    }

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

// PUT: Approve or reject join request (for admin)
export async function PUT(request: Request) {
  const client = await pool.connect();
  try {
    await initDb();
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('kuri_auth_token');

    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(tokenCookie.value, JWT_SECRET) as { userId: number };
    const adminId = decoded.userId;

    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [adminId]);
    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can approve/reject join requests' }, { status: 403 });
    }

    const { requestId, status } = await request.json();
    if (!requestId || !status || (status !== 'approved' && status !== 'rejected')) {
      return NextResponse.json({ error: 'requestId and status (approved/rejected) are required' }, { status: 400 });
    }

    // Get the request details to verify admin ownership
    const requestDetails = await pool.query(
      `SELECT sjr.user_id, sjr.kuri_id, k.name as kuri_name, k.installment_amount, k.current_month, u.name as user_name, u.email as user_email, u.uuid as user_uuid
       FROM scheme_join_requests sjr
       INNER JOIN kuries k ON sjr.kuri_id = k.id
       INNER JOIN users u ON sjr.user_id = u.id
       WHERE sjr.id = $1 AND k.user_id = $2`,
      [requestId, adminId]
    );

    if (requestDetails.rows.length === 0) {
      return NextResponse.json({ error: 'Join request not found or unauthorized' }, { status: 404 });
    }

    const reqRow = requestDetails.rows[0];

    await client.query('BEGIN');

    // Update status
    await client.query(
      `UPDATE scheme_join_requests 
       SET status = $1, approved_at = CASE WHEN $1 = 'approved' THEN CURRENT_TIMESTAMP ELSE NULL END
       WHERE id = $2`,
      [status, requestId]
    );

    if (status === 'approved') {
      // We must automatically enroll this member as a subscriber in the Kuri
      // 1. Ensure a global subscriber exists for this member under this admin
      let subId = '';
      const existingSub = await client.query(
        `SELECT id FROM global_subscribers WHERE user_id = $1 AND member_uuid = $2`,
        [adminId, reqRow.user_uuid]
      );

      if (existingSub.rows.length > 0) {
        subId = existingSub.rows[0].id;
      } else {
        // Create subscriber card for this user under the admin
        subId = `sub-${Date.now()}`;
        await client.query(
          `INSERT INTO global_subscribers (id, user_id, name, phone, email, member_uuid) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [subId, adminId, reqRow.user_name, '+91 99999 00000', reqRow.user_email, reqRow.user_uuid]
        );
      }

      // 2. Check if already enrolled in the Kuri subscriber list
      const enrolledCheck = await client.query(
        `SELECT id FROM kuri_subscribers WHERE kuri_id = $1 AND subscriber_id = $2`,
        [reqRow.kuri_id, subId]
      );

      if (enrolledCheck.rows.length === 0) {
        // Find next ticket number
        const countResult = await client.query(
          `SELECT COUNT(*) as count FROM kuri_subscribers WHERE kuri_id = $1`,
          [reqRow.kuri_id]
        );
        const ticketNumber = Number(countResult.rows[0].count) + 1;

        // Insert enrolled subscriber
        await client.query(
          `INSERT INTO kuri_subscribers (kuri_id, subscriber_id, ticket_number, is_prized)
           VALUES ($1, $2, $3, FALSE)`,
          [reqRow.kuri_id, subId, ticketNumber]
        );

        // Add payment for current month
        const payId = `pay-${Date.now()}-${subId}`;
        await client.query(
          `INSERT INTO payments (id, kuri_id, subscriber_id, month, amount, status)
           VALUES ($1, $2, $3, $4, $5, 'pending')`,
          [payId, reqRow.kuri_id, subId, reqRow.current_month, reqRow.installment_amount]
        );
      }
    }

    await client.query('COMMIT');
    return NextResponse.json({ message: `Join request successfully ${status}` });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error updating join request:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
