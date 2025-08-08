"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  console.log("LoginPage component is rendering."); // Log 1: Check if component renders

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    console.log("handleLogin function called."); // Log 2: Check if the click handler runs
    setIsLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Email and password are required.");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Attempting to fetch /api/auth/login..."); // Log 3: Before the API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log("Fetch response received. Status:", response.status); // Log 4: After the API call

      const data = await response.json();
      console.log("Response data:", data); // Log 5: The data from the API

      if (!response.ok) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      if (data.token) {
        console.log("Token found in response. Saving to localStorage..."); // Log 6: Before saving token
        localStorage.setItem('token', data.token);
        console.log("Token saved. Redirecting to dashboard..."); // Log 7: Before redirect
        router.push('/dashboard');
      } else {
        throw new Error("Login successful, but no token was provided by the server.");
      }

    } catch (err: any) {
      console.error("An error occurred in handleLogin:", err); // Log 8: Catch any error
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        
        {/* We are not using a <form> element to eliminate it as a variable */}
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your password"
            />
          </div>
          <button 
            onClick={handleLogin} 
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>

        <p className="text-center mt-4">
          Don't have an account?{' '}
          <Link href="/signup" className="text-indigo-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
