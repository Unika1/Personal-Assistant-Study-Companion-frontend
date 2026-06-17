import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studyAPI, SUGGESTED_TOPICS, addRecentTopic } from '../services/api';
import RichText from '../components/RichText';
import {
  colors,
  card,
  pageShell,
  contentWidth,
  primaryButton,
  input,
} from '../styles/theme';

// StudyMaterialPage lets a student enter a topic and a difficulty level and
// get a clear AI-generated explanation. It talks to POST /api/study/explain.
// This is the "personalized explanations" part of the project, kept separate
// from the quiz and chat features so each feature has a clear purpose.

function StudyMaterialPage() {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('beginner');
  const [explanation, setExplanation] = useState('');
  const [studiedTopic, setStudiedTopic] = useState(''); // the topic actually explained
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lets us jump to the Quiz page seeded with the topic just studied.
  const navigate = useNavigate();

  // Ask the backend to explain the topic.
  const handleGenerate = async (event) => {
    event.preventDefault();

    if (!topic.trim()) {
      setError('Please enter a topic to study.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setExplanation('');

      const cleanTopic = topic.trim();
      const response = await studyAPI.explainTopic(cleanTopic, level);
      setExplanation(response.data?.explanation || '');

      // Remember what was just studied so the quiz can be specific to it, and
      // record it in the recent-topics list shared with the Quiz page.
      setStudiedTopic(cleanTopic);
      addRecentTopic(cleanTopic);
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not generate the explanation.');
    } finally {
      setLoading(false);
    }
  };

  // Send the student to the Quiz page with the topic they just studied so the
  // quiz is about that exact topic (not a generic question).
  const handleQuizOnThis = () => {
    if (!studiedTopic) return;
    navigate(`/quiz?topic=${encodeURIComponent(studiedTopic)}`);
  };

  return (
    <div style={pageShell}>
      <div style={{ ...contentWidth, display: 'grid', gap: 20 }}>
        {/* Header */}
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
            📖
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', color: colors.heading }}>
              Study a Topic
            </h1>
            <p style={{ margin: '6px 0 0', color: colors.muted }}>
              Get a clear, beginner-friendly explanation of any tech topic.
            </p>
          </div>
        </div>

        {/* Input form */}
        <div style={card}>
          <form onSubmit={handleGenerate} style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'grid', gap: 8 }}>
              <label htmlFor="topic" style={{ fontWeight: 700, color: colors.body }}>
                What do you want to learn?
              </label>
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. pointers, recursion, SQL joins, Big-O notation..."
                style={input}
                disabled={loading}
              />

              {/* Topic selection: click a chip to fill the topic instantly. */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                {SUGGESTED_TOPICS.map((suggested) => (
                  <button
                    key={suggested}
                    type="button"
                    onClick={() => setTopic(suggested)}
                    disabled={loading}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 999,
                      border: `1px solid ${colors.border}`,
                      background: topic === suggested ? '#f5f0ff' : '#fff',
                      color: topic === suggested ? colors.primary : colors.body,
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: loading ? 'default' : 'pointer',
                    }}
                  >
                    {suggested}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gap: 8 }}>
              <label htmlFor="level" style={{ fontWeight: 700, color: colors.body }}>
                Difficulty level
              </label>
              <select
                id="level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                style={input}
                disabled={loading}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <button
              type="submit"
              style={{ ...primaryButton, opacity: loading ? 0.6 : 1 }}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Explain This Topic'}
            </button>
          </form>
        </div>

        {/* Error message */}
        {error && (
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

        {/* The explanation output */}
        {explanation && (
          <div style={card}>
            <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', color: colors.heading }}>
              Explanation
            </h2>
            {/* RichText turns the AI text into clean headings, bullets and
                paragraphs instead of showing raw markdown symbols. */}
            <RichText text={explanation} />

            {/* Turn studying into practice: quiz the student on the exact topic
                they just read, so the quiz is specific rather than generic. */}
            {studiedTopic && (
              <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <button type="button" onClick={handleQuizOnThis} style={primaryButton}>
                  📝 Quiz me on {studiedTopic}
                </button>
                <span style={{ color: colors.muted, fontSize: 13 }}>
                  Test what you just studied.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudyMaterialPage;
