import React, { useState } from 'react';
import { studyAPI } from '../services/api';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

      const response = await studyAPI.explainTopic(topic.trim(), level);
      setExplanation(response.data?.explanation || '');
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not generate the explanation.');
    } finally {
      setLoading(false);
    }
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
            {/* Split the AI text into paragraphs so it is easy to read. */}
            <div style={{ color: colors.body, lineHeight: 1.7 }}>
              {explanation
                .split('\n')
                .filter((line) => line.trim() !== '')
                .map((line, index) => (
                  <p key={index} style={{ margin: '0 0 10px' }}>
                    {line}
                  </p>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudyMaterialPage;
