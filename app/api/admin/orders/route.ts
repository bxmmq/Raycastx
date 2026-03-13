import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function PUT(req: Request) {
  try {
    const { id, action, duration_days, password } = await req.json();

    if (action === 'activate') {
      const startTime = new Date().toISOString();
      const endTime = new Date(Date.now() + duration_days * 24 * 60 * 60 * 1000).toISOString();
      
      if (id < 0) {
        // Create new order for a user who hasn't ordered yet
        const user = db.prepare('SELECT email FROM users WHERE id = ?').get(-id) as { email: string } | undefined;
        if (!user) return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 });

        const stmt = db.prepare(`
          INSERT INTO orders (email, duration_days, status, start_time, end_time, password)
          VALUES (?, ?, 'active', ?, ?, ?)
        `);
        const result = stmt.run(user.email, duration_days, startTime, endTime, password || null);
        return NextResponse.json({ success: true, id: result.lastInsertRowid, start_time: startTime, end_time: endTime });
      }

      const stmt = db.prepare(`
        UPDATE orders 
        SET status = 'active', start_time = ?, end_time = ?, password = COALESCE(?, password)
        WHERE id = ?
      `);
      stmt.run(startTime, endTime, password || null, id);

      return NextResponse.json({ success: true, start_time: startTime, end_time: endTime });
    }

    if (action === 'save_password') {
      const orderId = Number(id);
      
      const stmt = db.prepare(`
        UPDATE orders 
        SET password = ?
        WHERE id = ?
      `);
      const result = stmt.run(password, orderId);
      
      if (result.changes === 0) {
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
        const user = db.prepare('SELECT email FROM users WHERE id = ?').get(-id) as { email: string } | undefined;
        if (!user) return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 });
        userEmail = user.email;
      } else {
        // Look up by order id
        const order = db.prepare('SELECT email FROM orders WHERE id = ?').get(id) as { email: string } | undefined;
        if (!order) {
          return NextResponse.json({ error: 'ไม่พบคำสั่งซื้อนี้' }, { status: 404 });
        }
        userEmail = order.email;
      }

      const hashedPassword = await hashPassword(password);
      const result = db.prepare('UPDATE users SET password = ? WHERE email = ?').run(hashedPassword, userEmail);

      if (result.changes === 0) {
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
      const user = db.prepare('SELECT email FROM users WHERE id = ?').get(-id) as { email: string } | undefined;
      if (user) email = user.email;
    } else {
      // It's a real order ID
      const order = db.prepare('SELECT email FROM orders WHERE id = ?').get(id) as { email: string } | undefined;
      if (order) email = order.email;
    }

    if (email) {
      if (action === 'delete_package') {
        if (id > 0) {
          db.prepare('DELETE FROM orders WHERE id = ?').run(id);
        } else {
          db.prepare('DELETE FROM orders WHERE email = ?').run(email);
        }
      } else {
        // Delete user and ALL their orders to ensure they don't reappear
        db.prepare('DELETE FROM users WHERE email = ?').run(email);
        db.prepare('DELETE FROM orders WHERE email = ?').run(email);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin Order Delete Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
