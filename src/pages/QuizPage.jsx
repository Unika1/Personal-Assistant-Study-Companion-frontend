// frontend/src/pages/QuizPage.jsx
// Page where users can take AI-generated quizzes

import React, { useState } from 'react';
import axios from 'axios';

function QuizPage() {
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState('5');
  const [quiz, setQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const generateQuiz = async (e) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');
    setQuiz(null);
    setUserAnswers({});
    setSubmitted(false);

    try {
      // In the future, connect to your backend API
      // const response = await axios.post(
      //   `${API_BASE_URL}/api/study/generate-quiz`,
      //   { topic, count: parseInt(questionCount) }
      // );
      // setQuiz(response.data.quiz);

      // For now, show placeholder
      setQuiz({
        topic,
        questions: [
          {
            id: 1,
            text: 'Sample Question 1 about ' + topic + '?',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correct: 'A',
          },
          {
            id: 2,
            text: 'Sample Question 2 about ' + topic + '?',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correct: 'B',
          },
        ],
      });
    } catch (err) {
      setError(err.message || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: answer,
    });
  };

  const submitQuiz = () => {
    setSubmitted(true);
    // Calculate score
    let correct = 0;
    quiz.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correct) {
        correct++;
      }
    });
    const score = Math.round((correct / quiz.questions.length) * 100);
    alert(`You scored: ${score}% (${correct}/${quiz.questions.length})`);
  };

  return (
    <div className="quiz-page">
      <h1>🎯 Test Your Knowledge</h1>
      <p className="subtitle">Take AI-generated quizzes to check your understanding</p>

      {!quiz ? (
        <div className="form-container">
          <form onSubmit={generateQuiz}>
            <div className="form-group">
              <label htmlFor="topic">Select a topic for the quiz</label>
              <input
                type="text"
                id="topic"
                placeholder="e.g., JavaScript, React, MongoDB..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="count">Number of Questions</label>
              <select
                id="count"
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value)}
                disabled={loading}
              >
                <option value="5">5 Questions</option>
                <option value="10">10 Questions</option>
                <option value="15">15 Questions</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Generating Quiz... ⏳' : 'Start Quiz 🚀'}
            </button>
          </form>
        </div>
      ) : (
        <div className="quiz-container">
          <h2>Quiz: {quiz.topic}</h2>
          <p className="progress">
            Question {Object.keys(userAnswers).length} of {quiz.questions.length}
          </p>

          {quiz.questions.map((question) => (
            <div key={question.id} className="question-card">
              <h3>{question.id}. {question.text}</h3>
              <div className="options">
                {question.options.map((option, index) => {
                  const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
                  return (
                    <label key={index} className="option">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={optionLetter}
                        checked={userAnswers[question.id] === optionLetter}
                        onChange={() => handleAnswerChange(question.id, optionLetter)}
                        disabled={submitted}
                      />
                      <span className="option-text">{optionLetter}. {option}</span>
                      {submitted && optionLetter === question.correct && (
                        <span className="correct-answer"> ✅ Correct</span>
                      )}
                      {submitted &&
                        optionLetter === userAnswers[question.id] &&
                        optionLetter !== question.correct && (
                          <span className="wrong-answer"> ❌ Wrong</span>
                        )}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {!submitted && (
            <button onClick={submitQuiz} className="submit-quiz-btn">
              Submit Quiz 📤
            </button>
          )}

          {submitted && (
            <button
              onClick={() => {
                setQuiz(null);
                setUserAnswers({});
                setSubmitted(false);
              }}
              className="restart-btn"
            >
              Take Another Quiz 🔄
            </button>
          )}
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default QuizPage;
