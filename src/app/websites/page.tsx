'use client';

import { useState, useEffect } from 'react';

// Define a type for the website data
interface Website {
  id: string;
  name: string;
  domain: string;
  trackingId: string;
  createdAt: string;
}

const WebsitesPage = () => {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteDomain, setNewSiteDomain] = useState('');

  const fetchWebsites = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('You are not logged in.');
        setIsLoading(false);
        return;
      }

      // Replace with your actual API endpoint
      const response = await fetch('/api/websites', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch websites');
      }

      const data = await response.json();
      setWebsites(data.websites || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  const handleAddWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newSiteName, domain: newSiteDomain }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add website');
      }

      // Refresh the list of websites after adding a new one
      setNewSiteName('');
      setNewSiteDomain('');
      fetchWebsites();

    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return <div>Loading your websites...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Your Websites</h1>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleAddWebsite} style={{ margin: '2rem 0' }}>
        <h2>Add a New Website</h2>
        <input
          type="text"
          placeholder="Website Name (e.g., My Salon)"
          value={newSiteName}
          onChange={(e) => setNewSiteName(e.target.value)}
          required
          style={{ display: 'block', margin: '0.5rem 0', padding: '0.5rem' }}
        />
        <input
          type="text"
          placeholder="Domain (e.g., mysalon.com)"
          value={newSiteDomain}
          onChange={(e) => setNewSiteDomain(e.target.value)}
          required
          style={{ display: 'block', margin: '0.5rem 0', padding: '0.5rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>Add Website</button>
      </form>

      <h2>Your Tracked Sites</h2>
      {websites.length > 0 ? (
        <ul>
          {websites.map((site) => (
            <li key={site.id} style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem 0' }}>
              <strong>{site.name}</strong> ({site.domain})
              <br />
              <small>Tracking ID: <code>{site.trackingId}</code></small>
            </li>
          ))}
        </ul>
      ) : (
        <p>You haven't added any websites yet.</p>
      )}
    </div>
  );
};

export default WebsitesPage;
