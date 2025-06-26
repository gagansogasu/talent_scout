import React from 'react';
import { Link } from 'react-router-dom';

const NewDashboard = () => {
  const domains = [
    {
      id: 1,
      title: 'Showbizz',
      description: 'Actors, musicians, dancers, and models can showcase their skills and find opportunities.',
      icon: '🎭',
      bgColor: '#fef3c7',
    },
    {
      id: 2,
      title: 'Household',
      description: 'From professional chefs, plumbers, and electricians, this domain connects experts with households needing their services.',
      icon: '🏡',
      bgColor: '#d1fae5',
    },
    {
      id: 3,
      title: 'Technical',
      description: 'Engineers, coders, and testers can find jobs or freelance opportunities.',
      icon: '⚙️',
      bgColor: '#e0e7ff',
    },
  ];
  

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section
        style={{
          padding: '5rem 1rem',
          background: 'linear-gradient(to right, #ebf4ff, #eef2ff)',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '3rem', fontWeight: '800', color: '#1f2937', marginBottom: '1.5rem' }}>
          Connect with Top Talent
        </h1>
        <p
          style={{
            fontSize: '1.25rem',
            color: '#4b5563',
            marginBottom: '2.5rem',
            maxWidth: '700px',
            margin: '0 auto 2.5rem',
          }}
        >
          Find the perfect professionals for your next project or showcase your skills to the world.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <Link
            to="/talent/register"
            style={{
              padding: '0.75rem 2.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '0.5rem',
              color: 'white',
              backgroundColor: '#2563eb',
              textDecoration: 'none',
              transition: '0.3s',
            }}
            onMouseOver={e => (e.target.style.backgroundColor = '#1e40af')}
            onMouseOut={e => (e.target.style.backgroundColor = '#2563eb')}
          >
            Join as Talent
          </Link>
          <Link
            to="/explore"
            style={{
              padding: '0.75rem 2.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '0.5rem',
              backgroundColor: '#dbeafe',
              color: '#1e3a8a',
              textDecoration: 'none',
              transition: '0.3s',
            }}
            onMouseOver={e => (e.target.style.backgroundColor = '#bfdbfe')}
            onMouseOut={e => (e.target.style.backgroundColor = '#dbeafe')}
          >
            Explore Talent
          </Link>
        </div>
      </section>

      {/* Domains Section */}
      <section style={{ backgroundColor: 'white', padding: '4rem 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#111827' }}>Browse by Domain</h2>
          <p style={{ marginTop: '1rem', fontSize: '1.25rem', color: '#6b7280' }}>
            Find professionals across various industries and specialties
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          {domains.map((domain) => (
            <div
              key={domain.id}
              style={{
                backgroundColor: domain.bgColor,
                borderRadius: '1rem',
                boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                padding: '1.5rem',
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 20px 30px rgba(0,0,0,0.1)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{domain.icon}</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
                {domain.title}
              </h3>
              <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>{domain.description}</p>

            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ backgroundColor: '#4338ca', color: 'white', padding: '4rem 1rem' }}>
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
        </div>
      </section>
    </div>
  );
};

export default NewDashboard;
