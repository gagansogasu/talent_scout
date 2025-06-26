import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Welcome = () => {
  const { user } = useAuth();

  const container = {
    fontFamily: "'Segoe UI', sans-serif",
    color: '#333',
    background: '#f9f9ff',
    margin: 0,
    padding: 0,
  };

  const heroSection = {
    background: 'linear-gradient(to right, #dbeafe, #ede9fe)',
    padding: '80px 20px',
    textAlign: 'center',
  };

  const heroTitle = {
    fontSize: '3rem',
    fontWeight: '800',
    marginBottom: '20px',
  };

  const gradientText = {
    background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontSize: '3.2rem',
  };

  const heroSubtitle = {
    fontSize: '1.2rem',
    maxWidth: '700px',
    margin: '0 auto 30px',
    color: '#555',
  };

  const heroButtons = {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  };

  const btn = {
    padding: '12px 24px',
    borderRadius: '30px',
    fontWeight: '600',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'all 0.3s ease',
  };

  const primaryBtn = {
    ...btn,
    background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
    color: 'white',
    border: 'none',
  };

  const secondaryBtn = {
    ...btn,
    backgroundColor: 'white',
    border: '2px solid #3b82f6',
    color: '#3b82f6',
  };

  const featuresSection = {
    padding: '60px 20px',
    background: 'white',
    textAlign: 'center',
  };

  const featuresHeading = {
    fontSize: '2rem',
    marginBottom: '10px',
  };

  const featuresSubtitle = {
    fontSize: '1rem',
    color: '#666',
    marginBottom: '40px',
  };

  const featuresGrid = {
    display: 'grid',
    gap: '24px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    maxWidth: '1000px',
    margin: '0 auto',
  };

  const featureCard = {
    background: '#f1f5f9',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  };

  const ctaSection = {
    background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
    color: 'white',
    padding: '60px 20px',
    textAlign: 'center',
  };

  const ctaTitle = {
    fontSize: '2rem',
    marginBottom: '20px',
  };

  const ctaText = {
    fontSize: '1rem',
    marginBottom: '30px',
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto',
  };

  const whiteBtn = {
    background: 'white',
    color: '#3b82f6',
    padding: '12px 24px',
    borderRadius: '30px',
    fontWeight: '600',
    textDecoration: 'none',
    display: 'inline-block',
  };

  return (
    <div style={container}>
      {/* Hero Section */}
      <section style={heroSection}>
        <div>
          <h1 style={heroTitle}>
            <span>Find the Perfect</span><br />
            <span style={gradientText}>Talent for Your Project</span>
          </h1>
          <p style={heroSubtitle}>
            Connect with skilled professionals and build your dream team. Whether you're looking for talent or seeking opportunities, Talent Scout is your platform.
          </p>
          <div style={heroButtons}>
            {user ? (
              <Link to="/dashboard" style={primaryBtn}>Go to Dashboard</Link>
            ) : (
              <>
                <Link to="/register" style={primaryBtn}>Get Started</Link>
                <Link to="/login" style={secondaryBtn}>Sign In</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={featuresSection}>
        <h2 style={featuresHeading}>Everything You Need to Succeed</h2>
        <p style={featuresSubtitle}>
          Our platform provides all the tools and features you need to connect with the right talent or find your next opportunity.
        </p>
        <div style={featuresGrid}>
          <div style={featureCard}>
            <h3>Smart Matching</h3>
            <p>AI-powered system matches you with the perfect talent or opportunity based on your profile.</p>
          </div>
          <div style={featureCard}>
            <h3>Quick Booking</h3>
            <p>Streamlined booking process that saves time and ensures smooth collaboration.</p>
          </div>
          <div style={featureCard}>
            <h3>Verified Profiles</h3>
            <p>All profiles are verified to ensure quality and trust in our community.</p>
          </div>
          <div style={featureCard}>
            <h3>Real-time Updates</h3>
            <p>Stay informed with instant notifications and real-time updates.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={ctaSection}>
        <h2 style={ctaTitle}>Ready to get started?<br />Join Talent Scout today.</h2>
        <p style={ctaText}>Start your journey to find the perfect talent or showcase your skills to potential clients.</p>
        {!user && (
          <Link to="/register" style={whiteBtn}>Sign Up for Free</Link>
        )}
      </section>
    </div>
  );
};

export default Welcome;
