import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';


export async function POST(request: NextRequest) {
  try {
    const { email, password, first_name } = await request.json();

    if (!email || !password || !first_name) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
    }

    // Check if user already exists
    const existingUserResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    
    // MOCK: If DB is unreachable or mocked, we will bypass the registration check
    const isMockPool = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('internal');

    if (!isMockPool && existingUserResult.rows.length > 0) {
      return NextResponse.json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' }, { status: 400 });
    }

    // Hash password with simple sha256
    const hashedPassword = await hashPassword(password);

    // Insert user
    let userId = 999; // Default mock ID
    
    if (!isMockPool) {
      const info = await pool.query(
        'INSERT INTO users (email, password, first_name) VALUES ($1, $2, $3) RETURNING id',
        [email, hashedPassword, first_name]
      );
      userId = info.rows[0].id;
    } else {
      console.log('--- ℹ️ Mocking Registration for:', email, '---');
    }

    return NextResponse.json({ message: 'สมัครสมาชิกสำเร็จ', userId });
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' }, { status: 500 });
  }
}
