'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-xl font-medium text-gray-600">
        Loading...
      </div>
    </main>
  );
}