import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

// ChatPage: simple chat UI where student asks questions and PASC answers.
function ChatPage() {
  // Store the list of messages. Each message has { sender: 'user'|'pasc', text }.
  const [messages, setMessages] = useState([]);

  // The text the user is currently typing.
  const [input, setInput] = useState('');

  // Whether we are waiting for the AI to respond.
  const [thinking, setThinking] = useState(false);

  // Ref to the scrollable messages container so we can scroll to bottom.
  const scrollRef = useRef(null);

  // Scroll to bottom whenever messages change.
  useEffect(() => {
    try {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    } catch (e) {
      // ignore scroll errors
    }
  }, [messages, thinking]);

  // Helper to send the user's message to the backend and get PASC's reply.
  const sendMessage = async () => {
    // Trim the input so messages with just spaces are ignored.
    const text = String(input || '').trim();
    if (!text) return; // do nothing for empty messages

    // Add the user's message to the local chat immediately.
    setMessages((prev) => [...prev, { sender: 'user', text }] );

    // Clear the input box and set thinking state.
    setInput('');
    setThinking(true);

    try {
      // Build a simple history array for the backend: just the text of previous messages.
      const history = messages.map((m) => m.text);

      // Call the backend chat endpoint. We send cookies by using withCredentials.
      const res = await axios.post('http://localhost:5000/api/chat', { message: text, history }, { withCredentials: true });

      // Read the AI response text from the backend.
      const aiText = res?.data?.response || 'No response from PASC';

      // Add the AI response to the message list.
      setMessages((prev) => [...prev, { sender: 'pasc', text: aiText }]);
    } catch (err) {
      // If anything goes wrong, show a friendly error from PASC.
      setMessages((prev) => [...prev, { sender: 'pasc', text: 'PASC could not respond. Please try again.' }]);
    } finally {
      // Done waiting for AI.
      setThinking(false);
    }
  };

  // Handle key presses in the input. Enter sends the message (no Shift+Enter support).
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Basic inline styles to keep the page self-contained and simple.
  const styles = {
    page: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f3f4f6', padding: 16, alignItems: 'center' },
    header: { fontSize: 20, fontWeight: 600, marginBottom: 12, textAlign: 'center' },
    container: { display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 720, height: '70vh', borderRadius: 10, overflow: 'hidden', boxShadow: '0 6px 24px rgba(16,24,40,0.08)', background: '#ffffff' },
    messages: { flex: 1, padding: 20, overflowY: 'auto', background: '#f7fafc' },
    messageRow: { display: 'flex', marginBottom: 12 },
    userBubble: { marginLeft: 'auto', background: '#6d28d9', color: '#fff', padding: '12px 16px', borderRadius: '18px 18px 6px 18px', maxWidth: '78%', boxShadow: '0 2px 8px rgba(109,40,217,0.12)' },
    pascBubble: { marginRight: 'auto', background: '#eef2ff', color: '#0f172a', padding: '12px 16px', borderRadius: '18px 18px 18px 6px', maxWidth: '78%', boxShadow: '0 2px 8px rgba(2,6,23,0.04)' },
    pascLabel: { fontSize: 12, color: '#6b7280', marginBottom: 6, marginLeft: 6 },
    inputArea: { display: 'flex', padding: 12, borderTop: '1px solid #e6e6e6', background: '#ffffff', position: 'sticky', bottom: 0 },
    input: { flex: 1, padding: '12px 14px', borderRadius: 10, border: '1px solid #d1d5db', marginRight: 8, fontSize: 14, resize: 'none' },
    sendButton: { background: 'linear-gradient(90deg,#7c3aed,#6d28d9)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 10, cursor: 'pointer', minWidth: 80 },
    thinking: { fontStyle: 'italic', color: '#6b7280', padding: 8, textAlign: 'center' }
  };

  // Render the chat UI.
  return (
    <div style={styles.page}>
      {/* Page header */}
      <div style={{ maxWidth: 800, margin: '0 auto', width: '100%' }}>
        <h2 style={styles.header}>PASC Chat</h2>
      </div>

      {/* Main chat container */}
      <div style={styles.container}>
        {/* Messages area (scrollable) */}
        <div style={styles.messages} ref={scrollRef}>
          {messages.map((m, idx) => (
            <div key={idx} style={styles.messageRow}>
              {m.sender === 'pasc' ? (
                <div>
                  {/* Small label showing this is from PASC */}
                  <div style={styles.pascLabel}>PASC</div>
                  {/* PASC bubble */}
                  <div style={styles.pascBubble}>{m.text}</div>
                </div>
              ) : (
                <div style={styles.userBubble}>{m.text}</div>
              )}
            </div>
          ))}

          {/* Show thinking indicator when waiting for AI */}
          {thinking && <div style={styles.thinking}>PASC is thinking...</div>}
        </div>

        {/* Input area fixed at bottom */}
        <div style={styles.inputArea}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question here..."
            style={styles.input}
            rows={2}
          />
          <button type="button" onClick={sendMessage} style={styles.sendButton}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
