'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';

const DashboardPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If the auth check is done and the user is not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show a loading screen while we check for authentication
  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  // If authenticated, show the dashboard
  return (
    <div>
      <Navbar />
      <div style={{ padding: '2rem' }}>
        <h1>Welcome to Your Dashboard</h1>
        <p>This is your main hub. From here you can manage your websites and view analytics.</p>
        <button onClick={() => router.push('/websites')} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
          Manage My Websites
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
