import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { quizAPI } from '../services/api';
import {
  colors,
  card,
  pageShell,
  contentWidth,
  primaryButton,
  badgeStyle,
} from '../styles/theme';

// ProgressPage is the student's learning dashboard. It reads the performance
// statistics from the backend (GET /api/quiz/stats) and shows, in plain terms:
//   - an overall summary (topics studied, questions answered, accuracy)
//   - the topics the student is weakest in (their "focus areas")
//   - a per-topic breakdown with an accuracy bar and a mastery label
//
// This page is the visible proof of the project's "personalized evaluation
// according to student performance" goal.

// Turn an accuracy value between 0 and 1 into a whole percentage like 42.
function toPercent(accuracy) {
  return Math.round((accuracy || 0) * 100);
}

function ProgressPage() {
  const [summary, setSummary] = useState(null);
  const [topics, setTopics] = useState([]);
  const [weakTopics, setWeakTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load the statistics once when the page opens.
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await quizAPI.getStats();

        setSummary(response.data?.summary || null);
        setTopics(response.data?.topics || []);
        setWeakTopics(response.data?.weakTopics || []);
      } catch (err) {
        setError(
          err?.response?.data?.error || 'Could not load your progress right now.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  // A small reusable summary card (one number with a label under it).
  const renderStatCard = (value, label) => (
    <div style={{ ...card, textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', fontWeight: 800, color: colors.primary }}>
        {value}
      </div>
      <div style={{ marginTop: 6, color: colors.muted, fontWeight: 700 }}>
        {label}
      </div>
    </div>
  );

  // Decide whether the student has any quiz history yet.
  const hasData = summary && summary.totalAttempts > 0;

  return (
    <div style={pageShell}>
      <div style={{ ...contentWidth, display: 'grid', gap: 20 }}>
        {/* Page header */}
        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: colors.brandGradient,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              flexShrink: 0,
            }}
          >
            📊
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', color: colors.heading }}>
              My Progress
            </h1>
            <p style={{ margin: '6px 0 0', color: colors.muted }}>
              See how you are doing and which topics to focus on next.
            </p>
          </div>
        </div>

        {/* Loading and error states */}
        {loading && (
          <div style={{ ...card, color: colors.muted }}>Loading your progress...</div>
        )}

        {error && !loading && (
          <div
            style={{
              ...card,
              background: colors.dangerBg,
              color: colors.danger,
              border: `1px solid ${colors.danger}`,
            }}
          >
            {error}
          </div>
        )}

        {/* Empty state: the student has not answered any quizzes yet. */}
        {!loading && !error && !hasData && (
          <div style={{ ...card, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🌱</div>
            <h2 style={{ margin: '0 0 8px', color: colors.heading }}>
              No quiz attempts yet
            </h2>
            <p style={{ margin: '0 0 18px', color: colors.muted }}>
              Take your first adaptive quiz and your progress will appear here.
            </p>
            <Link to="/quiz" style={{ ...primaryButton, textDecoration: 'none' }}>
              Start a Quiz
            </Link>
          </div>
        )}

        {/* Main dashboard, only shown once there is data. */}
        {!loading && !error && hasData && (
          <>
            {/* Top summary row: four key numbers. */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 16,
              }}
            >
              {renderStatCard(summary.topicsStudied, 'Topics Studied')}
              {renderStatCard(summary.totalAttempts, 'Questions Answered')}
              {renderStatCard(`${toPercent(summary.overallAccuracy)}%`, 'Overall Accuracy')}
              {renderStatCard(summary.weakTopicCount, 'Weak Topics')}
            </div>

            {/* Focus areas: the weak topics, weakest first. */}
            <div style={card}>
              <h2 style={{ margin: '0 0 14px', fontSize: '1.1rem', color: colors.heading }}>
                Focus Areas
              </h2>

              {weakTopics.length === 0 ? (
                <p style={{ margin: 0, color: colors.muted }}>
                  Great work — no weak topics right now. Keep practising to stay sharp!
                </p>
              ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                  {weakTopics.map((topic) => (
                    <div
                      key={topic.topic}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 14px',
                        borderRadius: 14,
                        background: colors.dangerBg,
                        border: `1px solid ${colors.danger}22`,
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 800,
                          color: colors.heading,
                          textTransform: 'capitalize',
                        }}
                      >
                        {topic.topic}
                      </span>
                      <span style={{ color: colors.danger, fontWeight: 800 }}>
                        {toPercent(topic.accuracy)}% accuracy
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Per-topic breakdown with an accuracy bar and a mastery badge. */}
            <div style={card}>
              <h2 style={{ margin: '0 0 14px', fontSize: '1.1rem', color: colors.heading }}>
                Topic Breakdown
              </h2>

              <div style={{ display: 'grid', gap: 16 }}>
                {topics.map((topic) => {
                  const percent = toPercent(topic.accuracy);

                  return (
                    <div key={topic.topic}>
                      {/* Topic name, mastery badge, and the accuracy number. */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 8,
                          gap: 10,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 800,
                            color: colors.heading,
                            textTransform: 'capitalize',
                          }}
                        >
                          {topic.topic}
                        </span>

                        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={badgeStyle(topic.mastery)}>{topic.mastery}</span>
                          <span style={{ color: colors.muted, fontWeight: 700, fontSize: 13 }}>
                            {topic.correct}/{topic.total} correct
                          </span>
                        </span>
                      </div>

                      {/* The accuracy bar itself. */}
                      <div
                        style={{
                          height: 12,
                          borderRadius: 999,
                          background: '#eef2ff',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${percent}%`,
                            height: '100%',
                            borderRadius: 999,
                            background: topic.isWeak ? colors.danger : colors.brandGradient,
                            transition: 'width 0.4s ease',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
}

export default ProgressPage;
