'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <Link href="/">
        Home
      </Link>
      <div>
        {isAuthenticated ? (
          <button onClick={logout}>Sign Out</button>
        ) : (
          <Link href="/login">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
