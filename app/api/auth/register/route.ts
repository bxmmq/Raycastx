import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword } from '@/lib/auth';


export async function POST(request: NextRequest) {
  try {
    const { email, password, first_name } = await request.json();

    if (!email || !password || !first_name) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return NextResponse.json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' }, { status: 400 });
    }

    // Hash password with simple sha256
    const hashedPassword = await hashPassword(password);

    // Insert user
    const info = db.prepare('INSERT INTO users (email, password, first_name) VALUES (?, ?, ?)').run(email, hashedPassword, first_name);

    return NextResponse.json({ message: 'สมัครสมาชิกสำเร็จ', userId: info.lastInsertRowid });
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' }, { status: 500 });
  }
}
