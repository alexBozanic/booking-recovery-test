"use client";

import { useState, useEffect } from 'react';

// Define the shape of a Website object for TypeScript
interface Website {
  id: string;
  name: string;
  domain: string;
  trackingId: string;
}

export default function ManageWebsitesPage() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [websiteName, setWebsiteName] = useState('');
  const [websiteDomain, setWebsiteDomain] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to get the auth token from local storage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Function to fetch websites from the backend
  const fetchWebsites = async () => {
    setIsLoading(true);
    setError(null);
    const token = getToken();

    if (!token) {
      setError("Unauthorized. Please sign in again.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/websites', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // <-- THE CRITICAL PART
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch websites');
      }

      const data: Website[] = await response.json();
      setWebsites(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle adding a new website
  const handleAddWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const token = getToken();

    if (!token) {
      setError("Unauthorized. Please sign in again.");
      return;
    }

    try {
      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // <-- THE CRITICAL PART
        },
        body: JSON.stringify({ name: websiteName, domain: websiteDomain }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add website');
      }

      // Clear form and refetch the list to show the new website
      setWebsiteName('');
      setWebsiteDomain('');
      fetchWebsites();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Fetch websites when the component first loads
  useEffect(() => {
    fetchWebsites();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Manage Your Websites</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Add a New Website</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleAddWebsite}>
          <div className="mb-4">
            <label htmlFor="websiteName" className="block text-gray-700 mb-2">Website Name</label>
            <input
              id="websiteName"
              type="text"
              value={websiteName}
              onChange={(e) => setWebsiteName(e.target.value)}
              placeholder="e.g., My Salon Bookings"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="websiteDomain" className="block text-gray-700 mb-2">Website Domain</label>
            <input
              id="websiteDomain"
              type="text"
              value={websiteDomain}
              onChange={(e) => setWebsiteDomain(e.target.value)}
              placeholder="e.g., mysalon.com"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            Add Website & Get Script
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Your Tracked Sites</h2>
        {isLoading ? (
          <p>Loading websites...</p>
        ) : websites.length > 0 ? (
          <ul className="space-y-4">
            {websites.map((site) => (
              <li key={site.id} className="bg-white p-4 rounded-lg shadow-md">
                <p className="font-bold">{site.name}</p>
                <p className="text-gray-600">{site.domain}</p>
                <p className="text-sm text-gray-500 mt-2">Tracking ID: <code>{site.trackingId}</code></p>
              </li>
            ))}
          </ul>
        ) : (
          <p>You haven't added any websites yet. Add one above to get started.</p>
        )}
      </div>
    </div>
  );
}
