import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { pool, initDb } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'kuriflow_auth_secret_token_key_1199';

// GET: Fetch user's data from Postgres
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

    // Check role and uuid
    const roleCheck = await pool.query('SELECT role, uuid FROM users WHERE id = $1', [userId]);
    if (roleCheck.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userRole = roleCheck.rows[0].role;
    const userUuid = roleCheck.rows[0].uuid;

    let subscribers = [];
    let kuriesList = [];
    let auctions = [];
    let payments = [];

    if (userRole === 'member') {
      // --- GROUP MEMBER READ-ONLY DASHBOARD PULL ---
      // 1. Fetch Global Subscribers involved in their enrolled Kuries
      const subsResult = await pool.query(
        `SELECT DISTINCT gs.id, gs.name, gs.phone, gs.email, gs.member_uuid as "memberUuid" 
         FROM global_subscribers gs
         INNER JOIN kuri_subscribers ks ON gs.id = ks.subscriber_id
         WHERE ks.kuri_id IN (
           SELECT DISTINCT ks2.kuri_id FROM kuri_subscribers ks2
           INNER JOIN global_subscribers gs2 ON ks2.subscriber_id = gs2.id
           WHERE gs2.member_uuid = $1
         )`,
        [userUuid]
      );
      subscribers = subsResult.rows;

      // 2. Fetch enrolled Kuries
      const kuriesResult = await pool.query(
        `SELECT DISTINCT k.id, k.name, k.total_value as "totalValue", k.duration_months as "durationMonths", 
                         k.installment_amount as "installmentAmount", k.foreman_commission_percent as "foremanCommissionPercent", 
                         k.start_date as "startDate", k.status, k.current_month as "currentMonth"
         FROM kuries k
         INNER JOIN kuri_subscribers ks ON k.id = ks.kuri_id
         INNER JOIN global_subscribers gs ON ks.subscriber_id = gs.id
         WHERE gs.member_uuid = $1`,
        [userUuid]
      );
      
      for (const k of kuriesResult.rows) {
        const ksResult = await pool.query(
          `SELECT subscriber_id as "subscriberId", ticket_number as "ticketNumber", 
                  is_prized as "isPrized", prized_month as "prizedMonth", prized_amount as "prizedAmount" 
           FROM kuri_subscribers WHERE kuri_id = $1`,
          [k.id]
        );
        
        kuriesList.push({
          ...k,
          totalValue: Number(k.totalValue),
          installmentAmount: Number(k.installmentAmount),
          foremanCommissionPercent: Number(k.foremanCommissionPercent),
          currentMonth: Number(k.currentMonth),
          durationMonths: Number(k.durationMonths),
          subscribers: ksResult.rows.map(sub => ({
            ...sub,
            isPrized: Boolean(sub.isPrized),
            ticketNumber: Number(sub.ticketNumber),
            prizedMonth: sub.prizedMonth ? Number(sub.prizedMonth) : undefined,
            prizedAmount: sub.prizedAmount ? Number(sub.prizedAmount) : undefined
          }))
        });
      }

      // 3. Fetch Auctions
      const auctionsResult = await pool.query(
        `SELECT DISTINCT a.id, a.kuri_id as "kuriId", a.month, a.date, a.winning_subscriber_id as "winningSubscriberId", 
                         a.winning_bid as "winningBid", a.discount, a.commission, a.dividend_per_member as "dividendPerMember", 
                         a.net_installment as "netInstallment"
         FROM auctions a
         WHERE a.kuri_id IN (
           SELECT DISTINCT ks.kuri_id FROM kuri_subscribers ks
           INNER JOIN global_subscribers gs ON ks.subscriber_id = gs.id
           WHERE gs.member_uuid = $1
         )`,
        [userUuid]
      );

      auctions = auctionsResult.rows.map(a => ({
        ...a,
        month: Number(a.month),
        winningBid: Number(a.winningBid),
        discount: Number(a.discount),
        commission: Number(a.commission),
        dividendPerMember: Number(a.dividendPerMember),
        netInstallment: Number(a.netInstallment)
      }));

      // 4. Fetch Payments
      const paymentsResult = await pool.query(
        `SELECT DISTINCT p.id, p.kuri_id as "kuriId", p.subscriber_id as "subscriberId", p.month, p.amount, p.date, p.status
         FROM payments p
         WHERE p.kuri_id IN (
           SELECT DISTINCT ks.kuri_id FROM kuri_subscribers ks
           INNER JOIN global_subscribers gs ON ks.subscriber_id = gs.id
           WHERE gs.member_uuid = $1
         )`,
        [userUuid]
      );

      payments = paymentsResult.rows.map(p => ({
        ...p,
        month: Number(p.month),
        amount: Number(p.amount)
      }));

    } else {
      // --- PERSONAL TRACKER OR GROUP ADMIN STANDARD PULL ---
      // 1. Fetch Global Subscribers
      const subsResult = await pool.query(
        'SELECT id, name, phone, email, member_uuid as "memberUuid" FROM global_subscribers WHERE user_id = $1',
        [userId]
      );
      subscribers = subsResult.rows;

      // 2. Fetch Kuries
      const kuriesResult = await pool.query(
        'SELECT id, name, total_value as "totalValue", duration_months as "durationMonths", installment_amount as "installmentAmount", foreman_commission_percent as "foremanCommissionPercent", start_date as "startDate", status, current_month as "currentMonth" FROM kuries WHERE user_id = $1',
        [userId]
      );
      
      for (const k of kuriesResult.rows) {
        const ksResult = await pool.query(
          'SELECT subscriber_id as "subscriberId", ticket_number as "ticketNumber", is_prized as "isPrized", prized_month as "prizedMonth", prized_amount as "prizedAmount" FROM kuri_subscribers WHERE kuri_id = $1',
          [k.id]
        );
        
        kuriesList.push({
          ...k,
          totalValue: Number(k.totalValue),
          installmentAmount: Number(k.installmentAmount),
          foremanCommissionPercent: Number(k.foremanCommissionPercent),
          currentMonth: Number(k.currentMonth),
          durationMonths: Number(k.durationMonths),
          subscribers: ksResult.rows.map(sub => ({
            ...sub,
            isPrized: Boolean(sub.isPrized),
            ticketNumber: Number(sub.ticketNumber),
            prizedMonth: sub.prizedMonth ? Number(sub.prizedMonth) : undefined,
            prizedAmount: sub.prizedAmount ? Number(sub.prizedAmount) : undefined
          }))
        });
      }

      // 3. Fetch Auctions
      const auctionsResult = await pool.query(
        `SELECT a.id, a.kuri_id as "kuriId", a.month, a.date, a.winning_subscriber_id as "winningSubscriberId", 
                a.winning_bid as "winningBid", a.discount, a.commission, a.dividend_per_member as "dividendPerMember", 
                a.net_installment as "netInstallment"
         FROM auctions a
         INNER JOIN kuries k ON a.kuri_id = k.id
         WHERE k.user_id = $1`,
        [userId]
      );

      auctions = auctionsResult.rows.map(a => ({
        ...a,
        month: Number(a.month),
        winningBid: Number(a.winningBid),
        discount: Number(a.discount),
        commission: Number(a.commission),
        dividendPerMember: Number(a.dividendPerMember),
        netInstallment: Number(a.netInstallment)
      }));

      // 4. Fetch Payments
      const paymentsResult = await pool.query(
        `SELECT p.id, p.kuri_id as "kuriId", p.subscriber_id as "subscriberId", p.month, p.amount, p.date, p.status
         FROM payments p
         INNER JOIN kuries k ON p.kuri_id = k.id
         WHERE k.user_id = $1`,
        [userId]
      );

      payments = paymentsResult.rows.map(p => ({
        ...p,
        month: Number(p.month),
        amount: Number(p.amount)
      }));
    }

    return NextResponse.json({
      subscribers,
      kuries: kuriesList,
      auctions,
      payments
    });
  } catch (error: any) {
    console.error('Data pull error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error during data fetch: ' + error.message },
      { status: 500 }
    );
  }
}

// POST: Save user's data to Postgres via transactional overwrite
export async function POST(request: Request) {
  const client = await pool.connect();
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('kuri_auth_token');

    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(tokenCookie.value, JWT_SECRET) as { userId: number };
    const userId = decoded.userId;

    // Check role (Members are read-only!)
    const roleCheck = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (roleCheck.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userRole = roleCheck.rows[0].role;

    if (userRole === 'member') {
      return NextResponse.json({ message: 'Read-only subscriber dashboard. Saves bypassed.' }, { status: 200 });
    }

    const { subscribers, kuries, auctions, payments } = await request.json();

    // Start database transaction
    await client.query('BEGIN');

    // 1. Delete existing records for this user (cascades automatically for kuries -> child tables)
    await client.query('DELETE FROM global_subscribers WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM kuries WHERE user_id = $1', [userId]);

    // 2. Insert new Global Subscribers
    if (subscribers && subscribers.length > 0) {
      for (const sub of subscribers) {
        await client.query(
          'INSERT INTO global_subscribers (id, user_id, name, phone, email, member_uuid) VALUES ($1, $2, $3, $4, $5, $6)',
          [sub.id, userId, sub.name, sub.phone, sub.email, sub.memberUuid || null]
        );
      }
    }

    // 3. Insert Kuries
    if (kuries && kuries.length > 0) {
      for (const k of kuries) {
        await client.query(
          `INSERT INTO kuries (id, user_id, name, total_value, duration_months, installment_amount, foreman_commission_percent, start_date, status, current_month) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            k.id,
            userId,
            k.name,
            k.totalValue,
            k.durationMonths,
            k.installmentAmount,
            k.foremanCommissionPercent,
            k.startDate,
            k.status || 'active',
            k.currentMonth || 1
          ]
        );

        // Insert enrolled subscribers for this Kuri
        if (k.subscribers && k.subscribers.length > 0) {
          for (const sub of k.subscribers) {
            await client.query(
              `INSERT INTO kuri_subscribers (kuri_id, subscriber_id, ticket_number, is_prized, prized_month, prized_amount) 
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [
                k.id,
                sub.subscriberId,
                sub.ticketNumber,
                sub.isPrized || false,
                sub.prizedMonth || null,
                sub.prizedAmount || null
              ]
            );
          }
        }
      }
    }

    // 4. Insert Auctions
    if (auctions && auctions.length > 0) {
      for (const a of auctions) {
        await client.query(
          `INSERT INTO auctions (id, kuri_id, month, date, winning_subscriber_id, winning_bid, discount, commission, dividend_per_member, net_installment) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            a.id,
            a.kuriId,
            a.month,
            a.date,
            a.winningSubscriberId,
            a.winningBid,
            a.discount,
            a.commission,
            a.dividendPerMember,
            a.netInstallment
          ]
        );
      }
    }

    // 5. Insert Payments
    if (payments && payments.length > 0) {
      for (const p of payments) {
        await client.query(
          `INSERT INTO payments (id, kuri_id, subscriber_id, month, amount, date, status) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            p.id,
            p.kuriId,
            p.subscriberId,
            p.month,
            p.amount,
            p.date || null,
            p.status || 'pending'
          ]
        );
      }
    }

    // Commit transaction
    await client.query('COMMIT');

    return NextResponse.json({ message: 'Database state successfully synchronized' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Data push/sync error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error during data sync: ' + error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
