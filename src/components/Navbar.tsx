'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleManageWebsites = () => {
    router.push('/websites');
  };

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '1rem 2rem', 
      borderBottom: '1px solid #eee',
      backgroundColor: '#fff'
    }}>
      <div>
        {/* This link now correctly points to the user's dashboard */}
        <Link href="/dashboard" style={{ fontWeight: 'bold', textDecoration: 'none', color: '#000' }}>
          My Dashboard
        </Link>
      </div>
      <div>
        {isAuthenticated ? (
          <>
            <button 
              onClick={handleManageWebsites} 
              style={{ marginRight: '1rem', padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer' }}
            >
              Manage Websites
            </button>
            <button 
              onClick={logout}
              style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '5px', backgroundColor: '#f44336', color: 'white', cursor: 'pointer' }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <Link href="/login" style={{ textDecoration: 'none', color: '#0070f3' }}>
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
