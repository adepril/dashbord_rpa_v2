'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Dashboard from '../../components/Dashboard';


export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  return (
    <main className="bx-100">
      <div className="text-left mb-4">
        {/* Space keeper */}
      </div>
      <Dashboard />
    </main>
  );
}
