'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext'; // Import the useAuth hook
import Link from 'next/link';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth(); // Get the login function from our context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to log in');
      }

      // --- THIS IS THE CRITICAL FIX ---
      // Use the context's login function to save the token and redirect
      if (data.token) {
        login(data.token);
      } else {
        throw new Error('Login successful, but no token received.');
      }
      // --- END OF FIX ---

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '5rem auto', padding: '2rem', border: '1px solid #ccc' }}>
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ margin: '1rem 0' }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ margin: '1rem 0' }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '0.75rem' }}>
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        Don&apos;t have an account? <Link href="/signup">Sign Up</Link>
      </p>
    </div>
  );
};

export default LoginPage;
