import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { quizAPI } from '../services/api';
import {
  colors,
  card,
  pageShell,
  contentWidth,
  primaryButton,
  secondaryButton,
  input,
  badgeStyle,
} from '../styles/theme';

// QuizPage is the dedicated, adaptive quiz feature (separate from chat).
//
// The flow:
//   1. The student optionally types a topic and clicks "Generate Question".
//   2. The backend builds ONE adaptive question from their performance.
//   3. The student picks an option and submits it.
//   4. We record the answer, show whether it was right, and explain it.
//   5. The student clicks "Next Question" to continue. The next question
//      automatically adapts because every answer is saved to the database.

function QuizPage() {
  // The topic the student wants (optional; empty means "let PASC choose").
  const [topic, setTopic] = useState('');

  // The current quiz question object from the backend.
  const [quiz, setQuiz] = useState(null);

  // The option letter the student has selected (e.g. "B").
  const [selectedOption, setSelectedOption] = useState('');

  // The graded result from the backend after submitting.
  const [result, setResult] = useState(null);

  // A running tally for this practice session.
  const [score, setScore] = useState({ correct: 0, total: 0 });

  // UI state flags.
  const [loading, setLoading] = useState(false);   // generating a question
  const [submitting, setSubmitting] = useState(false); // sending an answer
  const [error, setError] = useState('');

  // Ask the backend for one adaptive question.
  const generateQuestion = async () => {
    try {
      setLoading(true);
      setError('');
      setQuiz(null);
      setSelectedOption('');
      setResult(null);

      const response = await quizAPI.generateQuiz(topic.trim());
      const newQuiz = response.data?.quiz;

      // Make sure we actually received a usable quiz question.
      if (!newQuiz || !newQuiz.question) {
        setError('PASC could not create a question. Please try again.');
        return;
      }

      setQuiz(newQuiz);
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not generate a question.');
    } finally {
      setLoading(false);
    }
  };

  // Send the chosen answer to the backend to be graded and recorded.
  const submitAnswer = async () => {
    if (!quiz || !selectedOption) return;

    try {
      setSubmitting(true);
      setError('');

      // Send back the question details plus the student's chosen letter.
      const response = await quizAPI.submitAnswer({
        topic: quiz.topic,
        question: quiz.question,
        correct: quiz.correct,
        studentAnswer: selectedOption,
        difficulty: quiz.difficulty,
        explanation: quiz.explanation,
      });

      const gradedResult = response.data;
      setResult(gradedResult);

      // Update the running score for this session.
      setScore((prev) => ({
        correct: prev.correct + (gradedResult.isCorrect ? 1 : 0),
        total: prev.total + 1,
      }));
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not submit your answer.');
    } finally {
      setSubmitting(false);
    }
  };

  // Work out the colour for each option button after the answer is graded.
  const getOptionStyle = (optionKey) => {
    const base = {
      textAlign: 'left',
      padding: '14px 16px',
      borderRadius: 14,
      border: `2px solid ${colors.border}`,
      background: '#fafafa',
      cursor: result ? 'default' : 'pointer',
      fontWeight: 700,
      color: colors.heading,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      width: '100%',
    };

    const isSelected = selectedOption === optionKey;
    const isCorrectOption = result && String(result.correctAnswer) === optionKey;
    const isWrongChoice = result && isSelected && !result.isCorrect;

    // Before grading: highlight the student's current selection.
    if (isSelected && !result) {
      return { ...base, borderColor: colors.primary, background: '#f5f0ff' };
    }
    // After grading: always show the correct answer in green.
    if (isCorrectOption) {
      return { ...base, borderColor: colors.success, background: colors.successBg };
    }
    // After grading: show the student's wrong choice in red.
    if (isWrongChoice) {
      return { ...base, borderColor: colors.danger, background: colors.dangerBg };
    }

    return base;
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
            📝
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: '1.8rem', color: colors.heading }}>
              Adaptive Quiz
            </h1>
            <p style={{ margin: '6px 0 0', color: colors.muted }}>
              Questions get harder as you improve and easier when you struggle.
            </p>
          </div>

          {/* Live session score */}
          {score.total > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: colors.primary }}>
                {score.correct}/{score.total}
              </div>
              <div style={{ color: colors.muted, fontWeight: 700, fontSize: 13 }}>
                This session
              </div>
            </div>
          )}
        </div>

        {/* Topic chooser */}
        <div style={card}>
          <label style={{ display: 'block', fontWeight: 700, color: colors.body, marginBottom: 8 }}>
            Topic (optional)
          </label>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. pointers, recursion, arrays... or leave blank"
              style={{ ...input, flex: 1, minWidth: 220 }}
              disabled={loading}
            />
            <button
              type="button"
              onClick={generateQuestion}
              style={{ ...primaryButton, opacity: loading ? 0.6 : 1 }}
              disabled={loading}
            >
              {loading ? 'Generating...' : quiz ? 'New Question' : 'Generate Question'}
            </button>
          </div>
          <p style={{ margin: '10px 0 0', color: colors.muted, fontSize: 13 }}>
            Leave the topic blank and PASC will pick the area you most need to practise.
          </p>
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

        {/* The question card */}
        {quiz && (
          <div style={card}>
            {/* Topic + difficulty labels above the question */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              {quiz.topic ? (
                <span style={badgeStyle('strong')} >{quiz.topic}</span>
              ) : null}
              {quiz.difficulty ? (
                <span style={badgeStyle(quiz.difficulty)}>{quiz.difficulty}</span>
              ) : null}
            </div>

            <div style={{ fontSize: 18, fontWeight: 700, color: colors.heading, lineHeight: 1.5, marginBottom: 16 }}>
              {quiz.question}
            </div>

            {/* The four options */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 12,
              }}
            >
              {Object.entries(quiz.options || {}).map(([optionKey, optionText]) => (
                <button
                  key={optionKey}
                  type="button"
                  style={getOptionStyle(optionKey)}
                  onClick={() => !result && setSelectedOption(optionKey)}
                  disabled={Boolean(result)}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      background: '#ede9fe',
                      color: colors.primary,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {optionKey}
                  </span>
                  {optionText}
                </button>
              ))}
            </div>

            {/* Submit button (before grading) */}
            {!result && (
              <button
                type="button"
                onClick={submitAnswer}
                style={{
                  ...primaryButton,
                  marginTop: 16,
                  opacity: selectedOption && !submitting ? 1 : 0.6,
                }}
                disabled={!selectedOption || submitting}
              >
                {submitting ? 'Checking...' : 'Submit Answer'}
              </button>
            )}

            {/* Feedback (after grading) */}
            {result && (
              <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 12,
                    fontWeight: 800,
                    background: result.isCorrect ? colors.successBg : colors.dangerBg,
                    color: result.isCorrect ? colors.success : colors.danger,
                  }}
                >
                  {result.isCorrect
                    ? '✅ Correct!'
                    : `❌ Not quite — the correct answer is ${result.correctAnswer}.`}
                </div>

                {result.explanation && (
                  <div
                    style={{
                      padding: 14,
                      borderRadius: 12,
                      background: colors.softBg,
                      border: `1px solid ${colors.border}`,
                      color: colors.body,
                      lineHeight: 1.6,
                    }}
                  >
                    <strong>Explanation: </strong>
                    {result.explanation}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button type="button" onClick={generateQuestion} style={primaryButton}>
                    Next Question
                  </button>
                  <Link to="/progress" style={{ ...secondaryButton, textDecoration: 'none' }}>
                    View Progress
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* First-time hint when nothing has been generated yet */}
        {!quiz && !loading && !error && (
          <div style={{ ...card, textAlign: 'center', color: colors.muted }}>
            Choose a topic (or leave it blank) and press <strong>Generate Question</strong> to begin.
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizPage;
