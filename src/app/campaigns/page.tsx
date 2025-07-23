'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

// Define a type for the campaign data
interface Campaign {
  id: string;
  subject: string;
  body: string;
  delayMinutes: number;
  isActive: boolean;
}

const CampaignsPage = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for the form inputs
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [delay, setDelay] = useState(60); // Default to 60 minutes

  // We will build this function out in the next steps
  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    alert('Saving campaign... (This feature is under construction)');
    // In the future, this will save the subject, body, and delay to the database.
  };

  // This is a placeholder. In the future, it will fetch the user's saved campaign.
  useEffect(() => {
    if (isAuthenticated) {
      // Simulate fetching an existing campaign
      // For now, we'll just set some default values
      setSubject('Did you forget something?');
      setBody('Hi there, it looks like you started a booking but didn\'t finish. Click here to complete your reservation!');
      setDelay(60);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  if (isAuthLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div>
        <Navbar />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Access Denied</h1>
          <p>Please log in to manage your campaigns.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Email Campaign</h1>
        <p>Design the recovery email that will be sent to users who abandon a booking.</p>

        <form onSubmit={handleSaveCampaign} style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee', marginTop: '2rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={8}
              style={{ width: '100%', padding: '0.5rem', resize: 'vertical' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Send After (in minutes)</label>
            <input
              type="number"
              value={delay}
              onChange={(e) => setDelay(parseInt(e.target.value, 10))}
              required
              min="1"
              style={{ width: '100px', padding: '0.5rem' }}
            />
          </div>

          <button type="submit" style={{ padding: '0.75rem 1.5rem' }}>Save Campaign</button>
        </form>
      </div>
    </div>
  );
};

export default CampaignsPage;
