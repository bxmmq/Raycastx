import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function PUT(req: Request) {
  try {
    const { id, action, duration_days, password } = await req.json();

    if (action === 'activate') {
      const startTime = new Date().toISOString();
      const endTime = new Date(Date.now() + duration_days * 24 * 60 * 60 * 1000).toISOString();
      
      if (id < 0) {
        // Create new order for a user who hasn't ordered yet
        const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [-id]);
        const user = userResult.rows[0];
        if (!user) return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 });

        const result = await pool.query(`
          INSERT INTO orders (email, duration_days, status, start_time, end_time, password)
          VALUES ($1, $2, 'active', $3, $4, $5)
          RETURNING id
        `, [user.email, duration_days, startTime, endTime, password || null]);
        
        return NextResponse.json({ success: true, id: result.rows[0].id, start_time: startTime, end_time: endTime });
      }

      await pool.query(`
        UPDATE orders 
        SET status = 'active', start_time = $1, end_time = $2, password = COALESCE($3, password)
        WHERE id = $4
      `, [startTime, endTime, password || null, id]);

      return NextResponse.json({ success: true, start_time: startTime, end_time: endTime });
    }

    if (action === 'save_password') {
      const orderId = Number(id);
      
      const result = await pool.query(`
        UPDATE orders 
        SET password = $1
        WHERE id = $2
      `, [password, orderId]);
      
      if (result.rowCount === 0) {
        return NextResponse.json({ error: 'ไม่พบคำสั่งซื้อนี้ในระบบ' }, { status: 404 });
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'reset_account_password') {
      if (!password) {
        return NextResponse.json({ error: 'กรุณากรอกรหัสผ่านใหม่' }, { status: 400 });
      }

      let userEmail = '';
      if (id < 0) {
        // Look up by user id
        const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [-id]);
        const user = userResult.rows[0];
        if (!user) return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 });
        userEmail = user.email;
      } else {
        // Look up by order id
        const orderResult = await pool.query('SELECT email FROM orders WHERE id = $1', [id]);
        const order = orderResult.rows[0];
        if (!order) {
          return NextResponse.json({ error: 'ไม่พบคำสั่งซื้อนี้' }, { status: 404 });
        }
        userEmail = order.email;
      }

      const hashedPassword = await hashPassword(password);
      const result = await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, userEmail]);

      if (result.rowCount === 0) {
        return NextResponse.json({ error: 'ไม่พบผู้ใช้นี้ในระบบ' }, { status: 404 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin Order Update Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id, action } = await req.json();

    let email = null;
    if (id < 0) {
      // It's a user ID (negative in our mapping)
      const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [-id]);
      if (userResult.rows[0]) email = userResult.rows[0].email;
    } else {
      // It's a real order ID
      const orderResult = await pool.query('SELECT email FROM orders WHERE id = $1', [id]);
      if (orderResult.rows[0]) email = orderResult.rows[0].email;
    }

    if (email) {
      if (action === 'delete_package') {
        if (id > 0) {
          await pool.query('DELETE FROM orders WHERE id = $1', [id]);
        } else {
          await pool.query('DELETE FROM orders WHERE email = $1', [email]);
        }
      } else {
        // Delete user and ALL their orders to ensure they don't reappear
        await pool.query('DELETE FROM users WHERE email = $1', [email]);
        await pool.query('DELETE FROM orders WHERE email = $1', [email]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin Order Delete Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

