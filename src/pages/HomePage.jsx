import React from 'react';
import { Link } from 'react-router-dom';

// Meaningful landing page for first-time visitors.
function HomePage() {
  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', padding: '40px 20px 60px' }}>
      <section
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          color: '#ffffff',
          borderRadius: '20px',
          padding: '48px 28px',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '2.2rem', marginBottom: '12px' }}>Welcome to PASC</h1>
        <p style={{ fontSize: '1.05rem', opacity: 0.95, marginBottom: '20px' }}>
          Personal AI Study Companion for tech students in Kathmandu.
        </p>
        <p style={{ fontSize: '1rem', opacity: 0.9, margin: 0 }}>
          Start with an account, then learn step by step with focused study support.
        </p>

        <div style={{ marginTop: '26px', display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Link
            to="/signup"
            style={{
              background: '#ffffff',
              color: '#4338ca',
              padding: '12px 18px',
              borderRadius: '10px',
              fontWeight: 700,
            }}
          >
            Create Account
          </Link>
          <Link
            to="/login"
            style={{
              border: '1px solid rgba(255,255,255,0.6)',
              color: '#ffffff',
              padding: '12px 18px',
              borderRadius: '10px',
              fontWeight: 700,
            }}
          >
            Login
          </Link>
        </div>
      </section>

      <section style={{ marginTop: '28px' }}>
        <h2 style={{ marginBottom: '14px', color: '#1f2937' }}>Why PASC</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '18px' }}>
            <h3 style={{ margin: '0 0 8px', color: '#3730a3' }}>Simple Start</h3>
            <p style={{ margin: 0, color: '#4b5563' }}>Begin with signup and login, then build features one by one.</p>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '18px' }}>
            <h3 style={{ margin: '0 0 8px', color: '#3730a3' }}>Built for Students</h3>
            <p style={{ margin: 0, color: '#4b5563' }}>Designed around real tech student needs and clear workflows.</p>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '18px' }}>
            <h3 style={{ margin: '0 0 8px', color: '#3730a3' }}>MERN Foundation</h3>
            <p style={{ margin: 0, color: '#4b5563' }}>Solid backend and frontend structure ready for next features.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
