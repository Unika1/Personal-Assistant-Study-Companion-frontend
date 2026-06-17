import React from 'react';
import { Link } from 'react-router-dom';
import {
  colors,
  card,
  contentWidth,
  primaryButton,
  secondaryButton,
} from '../styles/theme';

// HomePage is the landing page. It introduces PASC in terms a student cares
// about (clear explanations, adaptive quizzes, progress tracking) and links
// straight into the real features. The content changes depending on whether
// the student is logged in.

// The four things PASC actually does. Each card maps to a real page so the
// homepage doubles as a launcher once the student is logged in.
const features = [
  {
    icon: '📖',
    title: 'Clear Explanations',
    text: 'Get any programming or computer-science topic explained simply, at beginner, intermediate, or advanced level.',
    route: '/study',
  },
  {
    icon: '📝',
    title: 'Adaptive Quizzes',
    text: 'Practice with quizzes that get harder as you improve and easier when you struggle, so you are always challenged at the right level.',
    route: '/quiz',
  },
  {
    icon: '📊',
    title: 'Progress Tracking',
    text: 'See your accuracy for every topic, watch your mastery grow, and find out exactly which areas need more work.',
    route: '/progress',
  },
  {
    icon: '💬',
    title: 'Ask PASC Anytime',
    text: 'Chat with a friendly AI study companion that answers your tech questions and keeps you focused on learning.',
    route: '/chat',
  },
];

// The simple three-step journey, shown to everyone.
const steps = [
  { number: '1', title: 'Study a topic', text: 'Read a clear explanation at your level.' },
  { number: '2', title: 'Take a quiz', text: 'Answer adaptive questions that match your ability.' },
  { number: '3', title: 'Track progress', text: 'Review your weak topics and improve over time.' },
];

function HomePage() {
  // Simple client-side check for login state using the token from LoginPage.
  const isLoggedIn = Boolean(
    typeof window !== 'undefined' && localStorage.getItem('token')
  );

  // Logged-in students go straight to a feature; visitors are sent to signup.
  const linkFor = (route) => (isLoggedIn ? route : '/signup');

  return (
    <div style={{ ...contentWidth, maxWidth: 1080, padding: '40px 20px 60px' }}>
      {/* Small hover effect for the feature cards. */}
      <style>{`
        .pasc-feature-card {
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .pasc-feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 22px 50px rgba(16, 24, 40, 0.14);
        }
      `}</style>

      {/* Hero */}
      <section
        style={{
          background: colors.brandGradient,
          color: '#ffffff',
          borderRadius: 24,
          padding: '52px 28px',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(108, 63, 197, 0.25)',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            padding: '6px 14px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.18)',
            fontWeight: 700,
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          Personal AI Study Companion
        </span>

        <h1 style={{ fontSize: '2.4rem', margin: '0 0 12px' }}>
          Study smarter with PASC
        </h1>

        <p style={{ fontSize: '1.1rem', opacity: 0.95, margin: '0 auto 8px', maxWidth: 640 }}>
          Clear explanations, quizzes that adapt to you, and progress tracking —
          built for technology students in Kathmandu.
        </p>

        <div style={{ marginTop: 26, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          {!isLoggedIn ? (
            <>
              <Link
                to="/signup"
                style={{ ...primaryButton, background: '#ffffff', color: colors.primary, textDecoration: 'none' }}
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                style={{
                  border: '1px solid rgba(255,255,255,0.7)',
                  color: '#ffffff',
                  padding: '12px 18px',
                  borderRadius: 12,
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Login
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/quiz"
                style={{ ...primaryButton, background: '#ffffff', color: colors.primary, textDecoration: 'none' }}
              >
                Start a Quiz
              </Link>
              <Link
                to="/study"
                style={{
                  border: '1px solid rgba(255,255,255,0.7)',
                  color: '#ffffff',
                  padding: '12px 18px',
                  borderRadius: 12,
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Study a Topic
              </Link>
            </>
          )}
        </div>
      </section>

      {/* What PASC does */}
      <section style={{ marginTop: 36 }}>
        <h2 style={{ margin: '0 0 6px', color: colors.heading, fontSize: '1.6rem' }}>
          What PASC does for you
        </h2>
        <p style={{ margin: '0 0 20px', color: colors.muted }}>
          Everything you need to learn a topic, test yourself, and see how you are improving.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 18,
          }}
        >
          {features.map((feature) => (
            <Link
              key={feature.title}
              to={linkFor(feature.route)}
              className="pasc-feature-card"
              style={{ ...card, textDecoration: 'none', display: 'block' }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: '#f5f0ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  marginBottom: 14,
                }}
              >
                {feature.icon}
              </div>
              <h3 style={{ margin: '0 0 8px', color: colors.primary }}>{feature.title}</h3>
              <p style={{ margin: 0, color: colors.body, lineHeight: 1.6 }}>{feature.text}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ ...card, marginTop: 28 }}>
        <h2 style={{ margin: '0 0 20px', color: colors.heading, fontSize: '1.4rem' }}>
          How it works
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
          }}
        >
          {steps.map((step) => (
            <div key={step.number} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: colors.brandGradient,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {step.number}
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px', color: colors.heading, fontSize: '1.05rem' }}>
                  {step.title}
                </h3>
                <p style={{ margin: 0, color: colors.muted, lineHeight: 1.6 }}>{step.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* A closing call to action for logged-in students. */}
        {isLoggedIn && (
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Link to="/progress" style={{ ...secondaryButton, textDecoration: 'none' }}>
              View My Progress
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

export default HomePage;
