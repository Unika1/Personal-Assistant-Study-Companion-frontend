import React, { useEffect, useRef, useState } from 'react';
import apiClient from '../services/api';

// Get the student's name from localStorage so we can show it above their messages.
function getStudentName() {
  const storedFirstName = localStorage.getItem('firstName');
  if (storedFirstName && String(storedFirstName).trim()) {
    return String(storedFirstName).trim();
  }

  const storedName = localStorage.getItem('name');
  if (storedName && String(storedName).trim()) {
    return String(storedName).trim().split(' ')[0];
  }

  return 'Student';
}

// Turn a date into a small human-friendly time string like 2:30 PM.
function formatTime(date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

// Create one message object so user and PASC messages have the same shape.
function createMessage(sender, text) {
  return {
    kind: 'text',
    sender,
    text,
    time: formatTime(new Date()),
  };
}

// Convert text into something that can be copied to the clipboard.
function getPlainText(text) {
  return String(text || '').replace(/\r\n/g, '\n');
}

// Render simple markdown-style text like **bold** and `code`.
function renderInlineText(text, prefix = 'inline') {
  const parts = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  const segments = String(text || '').split(regex);

  segments.forEach((segment, index) => {
    if (!segment) return;

    if (segment.startsWith('`') && segment.endsWith('`')) {
      parts.push(
        <code key={`${prefix}-code-${index}`} className="chat-inline-code">
          {segment.slice(1, -1)}
        </code>
      );
      return;
    }

    if (segment.startsWith('**') && segment.endsWith('**')) {
      parts.push(
        <strong key={`${prefix}-bold-${index}`}>
          {segment.slice(2, -2)}
        </strong>
      );
      return;
    }

    parts.push(<React.Fragment key={`${prefix}-text-${index}`}>{segment}</React.Fragment>);
  });

  return parts;
}

// Break a response into paragraphs, lists, and code blocks.
function renderResponseContent(rawText, messageIndex) {
  const normalized = String(rawText || '').replace(/\r\n/g, '\n').trim();
  const blocks = normalized.split(/\n\s*\n/);
  const nodes = [];

  blocks.forEach((block, blockIndex) => {
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
    const numberedLines = lines.length > 0 && lines.every((line) => /^\d+\.\s+/.test(line));

    // If the block is a numbered list, show it as a real ordered list.
    if (numberedLines) {
      nodes.push(
        <ol key={`resp-${messageIndex}-ol-${blockIndex}`} className="chat-ordered-list">
          {lines.map((line, lineIndex) => {
            const itemText = line.replace(/^\d+\.\s+/, '');
            return (
              <li key={`resp-${messageIndex}-li-${blockIndex}-${lineIndex}`}>
                {renderInlineText(itemText, `resp-${messageIndex}-li-${blockIndex}-${lineIndex}`)}
              </li>
            );
          })}
        </ol>
      );
      return;
    }

    // If the block is a fenced code block, render it in a grey code panel.
    if (block.startsWith('```') && block.endsWith('```')) {
      const codeText = block.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '');
      nodes.push(
        <pre key={`resp-${messageIndex}-code-${blockIndex}`} className="chat-code-block">
          <code>{codeText}</code>
        </pre>
      );
      return;
    }

    // Normal text becomes a paragraph with line breaks preserved.
    nodes.push(
      <p key={`resp-${messageIndex}-p-${blockIndex}`} className="chat-paragraph">
        {renderInlineText(block, `resp-${messageIndex}-p-${blockIndex}`)}
      </p>
    );
  });

  return nodes;
}

// Turn the backend response into either a text reply or a quiz object.
function parseBackendResponse(response) {
  if (!response) return null;

  if (typeof response === 'object') {
    return response;
  }

  if (typeof response !== 'string') {
    return null;
  }

  try {
    return JSON.parse(response);
  } catch (error) {
    return response;
  }
}

// Turn one saved session message into the format ChatPage uses on screen.
function convertSessionMessage(message) {
  const messageTime = message?.timestamp ? formatTime(new Date(message.timestamp)) : formatTime(new Date());
  const savedContent = String(message?.content || '');

  try {
    const parsedContent = JSON.parse(savedContent);

    if (parsedContent && parsedContent.type === 'quiz') {
      return {
        kind: 'quiz',
        sender: message?.role === 'pasc' ? 'pasc' : 'user',
        text: String(parsedContent.question || ''),
        question: String(parsedContent.question || ''),
        options: parsedContent.options || {},
        correct: String(parsedContent.correct || ''),
        explanation: String(parsedContent.explanation || ''),
        selectedOption: '',
        answered: false,
        isCorrect: null,
        time: messageTime,
      };
    }
  } catch (error) {
    // If the saved message is not JSON, just treat it like normal text.
  }

  return {
    kind: 'text',
    sender: message?.role === 'pasc' ? 'pasc' : 'user',
    text: savedContent,
    time: messageTime,
  };
}

// ChatPage: two-column chat UI with rich response formatting and improved message display.
function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState('');
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });
  const [activeSessionId, setActiveSessionId] = useState('');
  const [activeSessionTitle, setActiveSessionTitle] = useState('Current Session');
  const scrollRef = useRef(null);
  const studentName = getStudentName();

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 800);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Load the saved sessions for the sidebar when the page opens.
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setSessionsLoading(true);

        const response = await apiClient.get('/sessions');
        const sessionList = response.data?.data || [];

        setSessions(sessionList);
      } catch (error) {
        setSessions([]);
      } finally {
        setSessionsLoading(false);
      }
    };

    loadSessions();
  }, []);

  // Smoothly scroll to the latest message whenever the conversation changes.
  useEffect(() => {
    try {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }
    } catch (e) {}
  }, [messages, thinking]);

  // Copy a formatted response to the clipboard.
  const handleCopy = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageIndex(index);
      window.setTimeout(() => setCopiedMessageIndex(null), 1200);
    } catch (e) {
      // Ignore clipboard failures in older browsers.
    }
  };

  // Open one saved session and show its messages in the chat area.
  const handleOpenSession = async (sessionId, sessionTitle) => {
    try {
      setThinking(false);
      setActiveQuiz(null);
      setSelectedQuizOption('');
      setQuizAnswered(false);
      setQuizScore({ correct: 0, total: 0 });

      const response = await apiClient.get(`/sessions/${sessionId}`);
      const sessionData = response.data?.data;
      const savedMessages = Array.isArray(sessionData?.messages) ? sessionData.messages : [];

      setMessages(savedMessages.map(convertSessionMessage));
      setActiveSessionId(sessionId);
      setActiveSessionTitle(sessionTitle || sessionData?.title || 'Session');
    } catch (error) {
      setMessages([]);
      setActiveSessionId('');
      setActiveSessionTitle('Current Session');
    }
  };

  // Delete one saved session from MongoDB and refresh the sidebar.
  const handleDeleteSession = async (sessionId) => {
    try {
      await apiClient.delete(`/sessions/${sessionId}`);
      setSessions((prev) => prev.filter((session) => session._id !== sessionId));

      if (activeSessionId === sessionId) {
        setMessages([]);
        setActiveSessionId('');
        setActiveSessionTitle('Current Session');
      }
    } catch (error) {
      // Keep the UI simple for now.
    }
  };

  // Start a brand new chat session on the screen.
  const handleNewChat = () => {
    setMessages([]);
    setInput('');
    setActiveQuiz(null);
    setSelectedQuizOption('');
    setQuizAnswered(false);
    setQuizScore({ correct: 0, total: 0 });
    setActiveSessionId('');
    setActiveSessionTitle('Current Session');
  };

  // Save the chosen option and show whether it was correct.
  const handleQuizOptionClick = (optionKey) => {
    if (!activeQuiz || quizAnswered) return;

    const isCorrectAnswer = String(optionKey).trim() === String(activeQuiz.correct || '').trim();

    setSelectedQuizOption(optionKey);
    setQuizAnswered(true);
    setQuizScore({
      correct: isCorrectAnswer ? 1 : 0,
      total: 1,
    });
  };

  // Finish the quiz card and show a short score summary in the chat.
  const handleNextQuestion = () => {
    const scoreText = `${quizScore.correct}/${quizScore.total}`;

    setMessages((prev) => [
      ...prev,
      createMessage('pasc', `Quiz complete! Your score is ${scoreText}.`),
    ]);

    setActiveQuiz(null);
    setSelectedQuizOption('');
    setQuizAnswered(false);
    setQuizScore({ correct: 0, total: 0 });
  };

  // Send the current question to the backend and add both messages to the screen.
  const sendMessage = async () => {
    const text = String(input || '').trim();
    if (!text) return;

    setMessages((prev) => [...prev, createMessage('user', text)]);
    setInput('');
    setThinking(true);

    try {
      const history = messages.map((m) => m.text);
      const payload = {
        message: text,
        history,
      };

      if (activeSessionId) {
        payload.sessionId = activeSessionId;
      }

      const res = await apiClient.post('/chat', payload);
      const backendResponse = parseBackendResponse(res?.data?.response);

      // If PASC returns a quiz, show the quiz card instead of a normal text message.
      if (backendResponse && backendResponse.type === 'quiz') {
        setActiveQuiz(backendResponse);
        setSelectedQuizOption('');
        setQuizAnswered(false);
        setQuizScore({ correct: 0, total: 1 });

        if (res?.data?.sessionId) {
          setActiveSessionId(res.data.sessionId);
        }

        if (res?.data?.sessionTitle) {
          setActiveSessionTitle(res.data.sessionTitle);
        }

        const sessionsResponse = await apiClient.get('/sessions');
        setSessions(sessionsResponse.data?.data || []);
        return;
      }

      const aiText = typeof backendResponse === 'string' ? backendResponse : 'No response from PASC';
      setMessages((prev) => [...prev, createMessage('pasc', aiText)]);

      if (res?.data?.sessionId) {
        setActiveSessionId(res.data.sessionId);
      }

      if (res?.data?.sessionTitle) {
        setActiveSessionTitle(res.data.sessionTitle);
      }

      const sessionsResponse = await apiClient.get('/sessions');
      setSessions(sessionsResponse.data?.data || []);
    } catch (err) {
      setMessages((prev) => [...prev, createMessage('pasc', 'PASC could not respond. Please try again.')]);
    } finally {
      setThinking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Inline CSS keeps this change self-contained inside ChatPage.jsx, per request.
  const layout = {
    page: { minHeight: '100vh', background: '#f3f4f6', padding: 20, boxSizing: 'border-box' },
    header: { maxWidth: 1200, margin: '0 auto 18px', fontSize: 20, fontWeight: 700, color: '#111827' },
    holder: { maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 20, height: 'calc(100vh - 140px)' },
    sidebar: { width: 280, background: '#ffffff', borderRadius: 14, padding: 16, boxShadow: '0 8px 30px rgba(16,24,40,0.06)', overflowY: 'auto' },
    newChatBtn: { display: 'block', width: '100%', padding: '10px 12px', background: 'linear-gradient(90deg,#6C3FC5,#4A90D9)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', marginBottom: 12 },
    sessionItem: { padding: '10px 12px', borderRadius: 10, background: '#f8fafc', marginBottom: 8, cursor: 'pointer', color: '#111827', fontWeight: 600 },
    main: { flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 14, overflow: 'hidden', boxShadow: '0 8px 30px rgba(16,24,40,0.06)', background: '#fff' },
    messagesWrap: { flex: 1, padding: 20, overflowY: 'auto', background: '#f7fafc', scrollBehavior: 'smooth' },
    messageRow: { display: 'flex', marginBottom: 14, alignItems: 'flex-end' },
    userRow: { marginLeft: 'auto', maxWidth: '75%' },
    pascRow: { marginRight: 'auto', maxWidth: '75%' },
    pascAvatar: { width: 36, height: 36, borderRadius: 12, background: '#fff', border: '1px solid #e6e6f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#6C3FC5', marginRight: 10, boxShadow: '0 6px 18px rgba(108,63,197,0.06)', flexShrink: 0 },
    pascBubble: { background: '#ffffff', color: '#0f172a', padding: '16px 18px', borderRadius: 18, boxShadow: '0 10px 24px rgba(2,6,23,0.06)', width: 'fit-content' },
    userBubble: { background: 'linear-gradient(90deg,#6C3FC5,#4A90D9)', color: '#fff', padding: '16px 18px', borderRadius: 18, boxShadow: '0 10px 24px rgba(108,63,197,0.15)', width: 'fit-content', marginLeft: 'auto' },
    inputBar: { display: 'flex', gap: 12, padding: 14, borderTop: '1px solid #eef2ff', background: '#fff' },
    input: { flex: 1, padding: '12px 14px', borderRadius: 12, border: '1px solid #e6e6ef', resize: 'none', fontSize: 14, background: '#fafafa' },
    sendBtn: { padding: '10px 16px', borderRadius: 12, border: 'none', background: 'linear-gradient(90deg,#6C3FC5,#4A90D9)', color: '#fff', fontWeight: 700, cursor: 'pointer' },
    quizCard: { marginTop: 8, background: '#ffffff', borderRadius: 18, border: '1px solid #e5e7eb', boxShadow: '0 10px 24px rgba(2,6,23,0.06)', padding: 18, maxWidth: '75%' },
    quizHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: '#6b7280', fontWeight: 700, fontSize: 13 },
    quizQuestion: { fontSize: 18, fontWeight: 700, color: '#111827', lineHeight: 1.5, marginBottom: 14 },
    quizGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 },
    quizOption: { textAlign: 'left', padding: '12px 14px', borderRadius: 14, border: '2px solid #e5e7eb', background: '#fafafa', cursor: 'pointer', fontWeight: 700, color: '#111827' },
    quizOptionLetter: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '999px', marginRight: 10, background: '#ede9fe', color: '#6C3FC5', fontWeight: 800 },
    quizSelected: { borderColor: '#6C3FC5', background: '#f5f0ff' },
    quizCorrect: { borderColor: '#16a34a', background: '#ecfdf5' },
    quizWrong: { borderColor: '#dc2626', background: '#fef2f2' },
    quizFooter: { marginTop: 14, display: 'grid', gap: 10 },
    quizExplanation: { padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e5e7eb', color: '#334155', lineHeight: 1.6 },
    quizScore: { fontWeight: 800, color: '#111827' },
    quizNextBtn: { alignSelf: 'start', padding: '10px 16px', borderRadius: 12, border: 'none', background: 'linear-gradient(90deg,#6C3FC5,#4A90D9)', color: '#fff', fontWeight: 700, cursor: 'pointer' },
  };

  return (
    <div style={layout.page}>
      <style>{`
        .chat-page-shell { min-height: 100vh; }
        .message-group { position: relative; }
        .pasc-message {
          opacity: 0;
          animation: responseFadeIn 0.35s ease forwards;
        }
        .message-label {
          font-size: 12px;
          font-weight: 700;
          color: #6b7280;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .message-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
          font-size: 12px;
          color: rgba(55, 65, 81, 0.8);
        }
        .copy-button {
          opacity: 0;
          pointer-events: none;
          border: 1px solid #e5e7eb;
          background: #fff;
          border-radius: 8px;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.15s ease, transform 0.15s ease, background 0.15s ease;
        }
        .pasc-message:hover .copy-button {
          opacity: 1;
          pointer-events: auto;
        }
        .copy-button:hover { background: #f9fafb; transform: translateY(-1px); }
        .chat-paragraph {
          margin: 0 0 10px;
          line-height: 1.65;
          white-space: pre-wrap;
        }
        .chat-paragraph:last-child { margin-bottom: 0; }
        .chat-inline-code {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 6px;
          background: #eef2f7;
          color: #1f2937;
          font-family: 'Consolas', 'Courier New', monospace;
          font-size: 0.92em;
        }
        .chat-code-block {
          margin: 10px 0;
          padding: 14px 16px;
          border-radius: 14px;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          color: #111827;
          font-family: 'Consolas', 'Courier New', monospace;
          overflow-x: auto;
          white-space: pre-wrap;
        }
        .chat-ordered-list {
          margin: 0 0 10px 20px;
          padding: 0;
          line-height: 1.65;
        }
        .chat-ordered-list li { margin-bottom: 8px; }
        .chat-ordered-list li:last-child { margin-bottom: 0; }
        .typing-wrap {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          padding: 4px 0 0;
        }
        .typing-dots-wrap {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 12px;
          background: #fff;
          border-radius: 999px;
          box-shadow: 0 10px 24px rgba(2,6,23,0.06);
        }
        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #6C3FC5;
          animation: bounceDot 0.9s infinite ease-in-out;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.15s; }
        .typing-dot:nth-child(3) { animation-delay: 0.3s; }
        .typing-text {
          font-size: 13px;
          color: #6b7280;
          margin-left: 4px;
        }
        @keyframes responseFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounceDot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.55; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>

      <div style={layout.header}>{activeSessionTitle}</div>

      <div style={layout.holder}>
        {/* Sidebar remains as a visual session list for the full-screen layout. */}
        {!isMobile && (
          <aside style={layout.sidebar}>
            <button style={layout.newChatBtn} onClick={handleNewChat}>+ New Chat</button>
            <div style={{ marginBottom: 8, color: '#6b7280', fontWeight: 700 }}>Recent Sessions</div>

            {sessionsLoading ? (
              <div style={{ color: '#9ca3af', fontSize: 13 }}>Loading sessions...</div>
            ) : sessions.length > 0 ? (
              sessions.map((session) => {
                const isActive = session._id === activeSessionId;

                return (
                  <div
                    key={session._id}
                    style={{
                      ...layout.sessionItem,
                      border: isActive ? '1px solid #6C3FC5' : '1px solid transparent',
                      background: isActive ? '#f5f0ff' : '#f8fafc',
                    }}
                    onClick={() => handleOpenSession(session._id, session.title)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, color: '#111827', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {session.title}
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                          {session.messages?.length || 0} messages
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDeleteSession(session._id);
                        }}
                        style={{
                          border: 'none',
                          background: '#fee2e2',
                          color: '#b91c1c',
                          borderRadius: 8,
                          padding: '6px 8px',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ marginTop: 10, color: '#9ca3af', fontSize: 13 }}>No saved sessions yet.</div>
            )}
          </aside>
        )}

        {/* Main chat area holds the conversation and the fixed input bar. */}
        <main style={layout.main}>
          <div style={layout.messagesWrap} ref={scrollRef}>
            {messages.map((m, idx) => {
              const isPasc = m.sender === 'pasc';

              return (
                <div key={idx} style={layout.messageRow} className="message-group">
                  {isPasc ? (
                    <div style={layout.pascRow} className="pasc-message">
                      {/* PASC message header with robot label for quick recognition. */}
                      <div className="message-label">
                        <span>🤖 PASC</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <div style={layout.pascAvatar}>P</div>

                        <div style={layout.pascBubble}>
                          {renderResponseContent(m.text, idx)}

                          <div className="message-meta">
                            <span>{m.time}</span>
                            <button
                              type="button"
                              className="copy-button"
                              onClick={() => handleCopy(getPlainText(m.text), idx)}
                            >
                              {copiedMessageIndex === idx ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={layout.userRow}>
                      {/* Show the student's first name above the message bubble. */}
                      <div className="message-label" style={{ justifyContent: 'flex-end' }}>
                        <span>{studentName}</span>
                      </div>

                      <div style={layout.userBubble}>
                        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>{m.text}</div>
                        <div className="message-meta" style={{ color: 'rgba(255,255,255,0.82)' }}>
                          <span>{m.time}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Animated typing indicator appears while PASC is generating a reply. */}
            {thinking && (
              <div className="typing-wrap">
                <div className="typing-dots-wrap" aria-label="PASC is thinking">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
                <div className="typing-text">PASC is thinking...</div>
              </div>
            )}

            {/* Quiz card appears here when PASC sends back quiz JSON. */}
            {activeQuiz && (
              <div style={layout.quizCard}>
                <div style={layout.quizHeader}>
                  <span>📝 Quiz</span>
                </div>

                <div style={layout.quizQuestion}>{activeQuiz.question}</div>

                <div style={layout.quizGrid}>
                  {Object.entries(activeQuiz.options || {}).map(([optionKey, optionText]) => {
                    const isSelected = selectedQuizOption === optionKey;
                    const isCorrectOption = String(activeQuiz.correct || '').trim() === optionKey;
                    const shouldShowCorrect = quizAnswered && isCorrectOption;
                    const shouldShowWrong = quizAnswered && isSelected && !isCorrectOption;

                    let optionStyle = { ...layout.quizOption };

                    if (isSelected && !quizAnswered) {
                      optionStyle = { ...optionStyle, ...layout.quizSelected };
                    }

                    if (shouldShowCorrect) {
                      optionStyle = { ...optionStyle, ...layout.quizCorrect };
                    }

                    if (shouldShowWrong) {
                      optionStyle = { ...optionStyle, ...layout.quizWrong };
                    }

                    return (
                      <button
                        key={optionKey}
                        type="button"
                        style={optionStyle}
                        onClick={() => handleQuizOptionClick(optionKey)}
                        disabled={quizAnswered}
                      >
                        <span style={layout.quizOptionLetter}>{optionKey}</span>
                        {optionText}
                      </button>
                    );
                  })}
                </div>

                {quizAnswered && (
                  <div style={layout.quizFooter}>
                    <div style={layout.quizExplanation}>
                      {activeQuiz.explanation}
                    </div>

                    <div style={layout.quizScore}>
                      Score: {quizScore.correct}/{quizScore.total}
                    </div>

                    <button type="button" style={layout.quizNextBtn} onClick={handleNextQuestion}>
                      Next Question
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input bar stays fixed to the bottom of the chat window. */}
          <div style={layout.inputBar}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask PASC a question..."
              style={layout.input}
              rows={2}
            />
            <button onClick={sendMessage} style={layout.sendBtn}>Send</button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ChatPage;
