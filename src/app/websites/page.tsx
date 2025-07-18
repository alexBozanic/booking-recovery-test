'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function WebsitesPage() {
  const [websites, setWebsites] = useState([
    {
      id: '1',
      name: 'My Booking Site',
      domain: 'mybookingsite.com',
      trackingId: 'track_abc123',
      status: 'active'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newWebsite, setNewWebsite] = useState({
    name: '',
    domain: ''
  });

  const handleAddWebsite = () => {
    if (newWebsite.name && newWebsite.domain) {
      const trackingId = `track_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      setWebsites([...websites, {
        id: Date.now().toString(),
        name: newWebsite.name,
        domain: newWebsite.domain,
        trackingId,
        status: 'active'
      }]);
      
      setNewWebsite({ name: '', domain: '' });
      setShowAddForm(false);
    }
  };

  const generateSnippet = (trackingId: string) => {
    return `<script>
(function() {
  var script = document.createElement('script');
  script.src = '${window.location.origin}/tracking.js?id=${trackingId}';
  script.async = true;
  document.head.appendChild(script);
})();
</script>`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-500">
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">My Websites</h1>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Add New Website
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Add Website Form */}
        {showAddForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Website</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="My Booking Site"
                  value={newWebsite.name}
                  onChange={(e) => setNewWebsite({...newWebsite, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="mybookingsite.com"
                  value={newWebsite.domain}
                  onChange={(e) => setNewWebsite({...newWebsite, domain: e.target.value})}
                />
              </div>
            </div>
            <div className="mt-4 flex space-x-3">
              <button
                onClick={handleAddWebsite}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Add Website
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Websites List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Your Websites</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {websites.map((website) => (
              <div key={website.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{website.name}</h3>
                    <p className="text-sm text-gray-500">{website.domain}</p>
                    <p className="text-xs text-gray-400 mt-1">Tracking ID: {website.trackingId}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {website.status}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generateSnippet(website.trackingId));
                        alert('Tracking code copied to clipboard!');
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Copy Tracking Code
                    </button>
                  </div>
                </div>
                
                {/* Tracking Code Preview */}
                <div className="mt-4 bg-gray-50 rounded-md p-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Tracking Code:</p>
                  <code className="text-xs text-gray-600 bg-white p-2 rounded border block overflow-x-auto">
                    {generateSnippet(website.trackingId)}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
