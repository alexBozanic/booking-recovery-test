'use client';

import Navbar from '@/components/Navbar';

const GuidePage = () => {
  return (
    <div>
      <Navbar />
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1>Installation Guide</h1>
          <p style={{ fontSize: '1.2rem', color: '#555' }}>
            How to install your tracking script on popular platforms.
          </p>
        </header>

        <section style={{ marginBottom: '2rem' }}>
          <h2>General Instructions (For Most Platforms)</h2>
          <p>
            Most modern website builders (like Squarespace, Wix, etc.) have a feature to add custom code or tracking scripts. This is the easiest way to install your script.
          </p>
          <ol style={{ lineHeight: '1.6' }}>
            <li>Log in to your website builder's admin panel.</li>
            <li>Navigate to the settings area. Look for sections named <strong>"Advanced"</strong>, <strong>"Code Injection"</strong>, <strong>"Custom Code"</strong>, or <strong>"Tracking Tools"</strong>.</li>
            <li>Find the input box for the <strong>"Header"</strong> or <strong>"Body"</strong> of your site. The body is usually preferred.</li>
            <li>Go back to your <a href="/websites">Websites Dashboard</a> to copy your unique tracking script.</li>
            <li>Paste the entire script into the input box.</li>
            <li>Save your changes and publish your site.</li>
          </ol>
          <p>
            That's it! Your tracking script is now active and will start monitoring for abandoned bookings.
          </p>
        </section>

        {/* We will add more sections for specific platforms like WordPress, Calendly, etc. later */}

      </div>
    </div>
  );
};

export default GuidePage;
