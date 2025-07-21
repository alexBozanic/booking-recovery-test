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

// A simple placeholder component
const WebsitesPage = () => {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This function now safely uses browser-only APIs like localStorage
    const fetchWebsites = async () => {
      try {
        // Example of using a browser-only API that would cause the error
        const token = localStorage.getItem('authToken');

        if (!token) {
          // Handle not being logged in
          setError('You are not logged in.');
          setIsLoading(false);
          return;
        }

        // In a real app, you would fetch this from your API
        // For now, we'll use mock data
        const mockWebsites: Website[] = [
          {
            id: 'client_1',
            name: 'My Test Website',
            domain: 'example.com',
            trackingId: 'track_123456789',
            createdAt: new Date().toISOString(),
          },
        ];
        
        setWebsites(mockWebsites);

      } catch (err) {
        setError('Failed to fetch websites.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWebsites();
  }, []);

  if (isLoading) {
    return <div>Loading your websites...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Your Websites</h1>
      {websites.length > 0 ? (
        <ul>
          {websites.map((site) => (
            <li key={site.id}>
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
