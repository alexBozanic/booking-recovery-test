'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

// Define a type for the website data
interface Website {
  id: string;
  name: string;
  domain: string;
  trackingId: string;
}

// --- NEW: A component to display the tracking script ---
const TrackingScript = ({ trackingId }: { trackingId: string }) => {
  const script = `
(function() {
    const TRACKING_ID = '${trackingId}'; 
    const API_ENDPOINT = 'https://booking-recovery-test.vercel.app/api/track';
    let lastCapturedData = {};
    function captureFormData( ) {
        const inputs = document.querySelectorAll('input, select, textarea');
        const data = {};
        let email = null;
        inputs.forEach(input => {
            if (input.type === 'email' || input.name.toLowerCase().includes('email')) {
                email = input.value;
            }
            if (input.name) { data[input.name] = input.value; }
        });
        if (email && JSON.stringify(data) !== JSON.stringify(lastCapturedData)) {
            lastCapturedData = data;
            navigator.sendBeacon(API_ENDPOINT, JSON.stringify({
                trackingId: TRACKING_ID,
                bookingData: data,
                clientInfo: { userAgent: navigator.userAgent, url: window.location.href }
            }));
        }
    }
    document.addEventListener('input', captureFormData, true);
})();
  `;

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    alert('Script copied to clipboard!');
  };

  return (
    <div style={{ marginTop: '1rem', border: '1px solid #eee', padding: '1rem', borderRadius: '5px' }}>
      <h4>Your Tracking Script</h4>
      <p>Copy this script and paste it into the &lt;head&gt; or &lt;body&gt; section of your website's HTML, or use your website builder's "Custom Code" feature.</p>
      {/* We will link to a real guide later */}
      <a href="#" style={{fontSize: '0.9rem'}}>Need help? Read our deployment guide.</a>
      <pre style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '1rem', 
        borderRadius: '5px', 
        whiteSpace: 'pre-wrap', 
        wordBreak: 'break-all',
        marginTop: '1rem'
      }}>
        <code>{script}</code>
      </pre>
      <button onClick={handleCopy} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>Copy Script</button>
    </div>
  );
};


const WebsitesPage = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteDomain, setNewSiteDomain] = useState('');

  const fetchWebsites = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) { throw new Error('Authentication token not found.'); }

      const response = await fetch('/api/websites', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch websites');
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
    if (isAuthenticated) {
      fetchWebsites();
    }
  }, [isAuthenticated]);

  const handleAddWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) { throw new Error('Authentication token not found. Please log in again.'); }

      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: newSiteName, domain: newSiteDomain }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add website');
      }
      setNewSiteName('');
      setNewSiteDomain('');
      fetchWebsites();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isAuthLoading) { return <div>Loading...</div>; }

  if (!isAuthenticated) {
    return (
      <div>
        <Navbar />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Access Denied</h1>
          <p>Please log in to manage your websites.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Manage Your Websites</h1>
        
        <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee', marginBottom: '2rem' }}>
          <h2>Add a New Website</h2>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <form onSubmit={handleAddWebsite}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Website Name</label>
              <input
                type="text"
                placeholder="e.g., My Salon Bookings"
                value={newSiteName}
                onChange={(e) => setNewSiteName(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Website Domain</label>
              <input
                type="text"
                placeholder="e.g., mysalon.com"
                value={newSiteDomain}
                onChange={(e) => setNewSiteDomain(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
            <button type="submit" style={{ padding: '0.75rem 1.5rem' }}>Add Website & Get Script</button>
          </form>
        </div>

        <h2>Your Tracked Sites</h2>
        {isLoading ? (
          <p>Loading websites...</p>
        ) : websites.length > 0 ? (
          <div>
            {websites.map((site) => (
              <div key={site.id} style={{ border: '1px solid #ccc', padding: '1.5rem', margin: '1rem 0', borderRadius: '8px' }}>
                <h3>{site.name} <span style={{ color: '#555', fontSize: '1rem' }}>({site.domain})</span></h3>
                {/* --- NEW: Display the script component --- */}
                <TrackingScript trackingId={site.trackingId} />
              </div>
            ))}
          </div>
        ) : (
          <p>You haven't added any websites yet. Add one above to get started.</p>
        )}
      </div>
    </div>
  );
};

export default WebsitesPage;
