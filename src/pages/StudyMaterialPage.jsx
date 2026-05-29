// frontend/src/pages/StudyMaterialPage.jsx
// Page where users can generate study materials on any topic

import React, { useState } from 'react';
import axios from 'axios';

function StudyMaterialPage() {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('beginner');
  const [material, setMaterial] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const generateMaterial = async (e) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');
    setMaterial('');

    try {
      // In the future, connect to your backend API
      // const response = await axios.post(
      //   `${API_BASE_URL}/api/study/generate-material`,
      //   { topic, level }
      // );
      // setMaterial(response.data.material);

      // For now, show placeholder
      setMaterial(
        `✨ Generated Study Material for: ${topic} (${level})\n\n` +
        `This is a placeholder. When you connect to the backend, ` +
        `the Gemini API will generate real study content here!\n\n` +
        `The AI will provide:\n` +
        `- Clear definitions\n` +
        `- Real-world examples\n` +
        `- Key concepts\n` +
        `- Practice exercises`
      );
    } catch (err) {
      setError(err.message || 'Failed to generate material');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="study-material-page">
      <h1>📖 Generate Study Materials</h1>
      <p className="subtitle">Learn any topic with AI-powered explanations</p>

      <div className="form-container">
        <form onSubmit={generateMaterial}>
          <div className="form-group">
            <label htmlFor="topic">What do you want to learn?</label>
            <input
              type="text"
              id="topic"
              placeholder="e.g., React Hooks, MongoDB Aggregation, Python Decorators..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="level">Difficulty Level</label>
            <select
              id="level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              disabled={loading}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Generating... ⏳' : 'Generate Material 🚀'}
          </button>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}

      {material && (
        <div className="material-output">
          <h2>Study Material Generated! ✨</h2>
          <div className="material-content">
            {material.split('\n').map((line, index) => (
              <p key={index}>{line || <br />}</p>
            ))}
          </div>
          <button className="download-btn">📥 Download as PDF</button>
        </div>
      )}
    </div>
  );
}

export default StudyMaterialPage;
