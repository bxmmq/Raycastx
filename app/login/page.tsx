'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (data: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[var(--background)] relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-primary)]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--color-primary)]/5 rounded-full blur-[100px] pointer-events-none" />
      
      <AuthForm 
        type="login" 
        onSubmit={handleLogin} 
        loading={loading} 
        error={error} 
      />

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 text-gray-500 text-sm">
        <a href="/" className="hover:text-white transition-colors">&larr; กลับหน้าตัวแทนจำหน่าย</a>
      </div>
    </main>
  );
}
