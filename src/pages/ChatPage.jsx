import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

// ChatPage: two-column chat UI with sessions sidebar and chat window.
function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 800);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    try {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    } catch (e) {}
  }, [messages, thinking]);

  const sendMessage = async () => {
    const text = String(input || '').trim();
    if (!text) return;
    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setInput('');
    setThinking(true);

    try {
      const history = messages.map((m) => m.text);
      const res = await axios.post('http://localhost:5000/api/chat', { message: text, history }, { withCredentials: true });
      const aiText = res?.data?.response || 'No response from PASC';
      setMessages((prev) => [...prev, { sender: 'pasc', text: aiText }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'pasc', text: 'PASC could not respond. Please try again.' }]);
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

  // Layout styles
  const layout = {
    page: { minHeight: '100vh', background: '#f3f4f6', padding: 20, boxSizing: 'border-box' },
    header: { maxWidth: 1200, margin: '0 auto 18px', fontSize: 20, fontWeight: 700, color: '#111827' },
    holder: { maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 20, height: 'calc(100vh - 140px)' },
    sidebar: { width: 280, background: '#ffffff', borderRadius: 14, padding: 16, boxShadow: '0 8px 30px rgba(16,24,40,0.06)', overflowY: 'auto' },
    newChatBtn: { display: 'block', width: '100%', padding: '10px 12px', background: 'linear-gradient(90deg,#6C3FC5,#4A90D9)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', marginBottom: 12 },
    sessionItem: { padding: '10px 12px', borderRadius: 10, background: '#f8fafc', marginBottom: 8, cursor: 'pointer', color: '#111827', fontWeight: 600 },
    main: { flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 14, overflow: 'hidden', boxShadow: '0 8px 30px rgba(16,24,40,0.06)', background: '#fff' },
    messagesWrap: { flex: 1, padding: 20, overflowY: 'auto', background: '#f7fafc' },
    messageRow: { display: 'flex', marginBottom: 12, alignItems: 'flex-end' },
    pascAvatar: { width: 36, height: 36, borderRadius: 10, background: '#fff', border: '1px solid #e6e6f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#6C3FC5', marginRight: 10, boxShadow: '0 6px 18px rgba(108,63,197,0.06)' },
    pascBubble: { background: '#ffffff', color: '#0f172a', padding: '12px 14px', borderRadius: '12px 12px 12px 4px', boxShadow: '0 6px 18px rgba(2,6,23,0.04)', maxWidth: '78%' },
    userBubble: { marginLeft: 'auto', background: 'linear-gradient(90deg,#6C3FC5,#4A90D9)', color: '#fff', padding: '12px 14px', borderRadius: '12px 12px 4px 12px', boxShadow: '0 6px 18px rgba(108,63,197,0.12)', maxWidth: '78%' },
    inputBar: { display: 'flex', gap: 12, padding: 14, borderTop: '1px solid #eef2ff', background: '#fff' },
    input: { flex: 1, padding: '12px 14px', borderRadius: 12, border: '1px solid #e6e6ef', resize: 'none', fontSize: 14, background: '#fafafa' },
    sendBtn: { padding: '10px 16px', borderRadius: 12, border: 'none', background: 'linear-gradient(90deg,#6C3FC5,#4A90D9)', color: '#fff', fontWeight: 700, cursor: 'pointer' },
    typing: { display: 'inline-flex', gap: 6, alignItems: 'center', padding: '8px 12px', color: '#6b7280', fontStyle: 'italic' }
  };

  return (
    <div style={layout.page}>
      <div style={layout.header}>PASC Chat</div>

      <div style={layout.holder}>
        {/* Sidebar */}
        {!isMobile && (
          <aside style={layout.sidebar}>
            <button style={layout.newChatBtn} onClick={() => setMessages([])}>+ New Chat</button>
            <div style={{ marginBottom: 8, color: '#6b7280', fontWeight: 700 }}>Recent Sessions</div>
            {/* Simple visual list; full session management is out of scope for styling-only change */}
            <div style={layout.sessionItem}>Current Session</div>
            <div style={layout.sessionItem}>Session: Arrays & Loops</div>
            <div style={layout.sessionItem}>Session: HTTP & APIs</div>
            <div style={{ marginTop: 12, color: '#9ca3af', fontSize: 13 }}>Sessions are visual only in this view.</div>
          </aside>
        )}

        {/* Main chat area */}
        <main style={layout.main}>
          <div style={layout.messagesWrap} ref={scrollRef}>
            {messages.map((m, idx) => (
              <div key={idx} style={layout.messageRow}>
                {m.sender === 'pasc' ? (
                  <>
                    <div style={layout.pascAvatar}>P</div>
                    <div style={layout.pascBubble}>{m.text}</div>
                  </>
                ) : (
                  <div style={layout.userBubble}>{m.text}</div>
                )}
              </div>
            ))}

            {thinking && (
              <div style={{ padding: 12 }}>
                <div style={layout.typing}>
                  <div className="typing-dots" style={{ display: 'flex', gap: 6 }}>
                    <span className="dot" style={{ width: 8, height: 8, background: '#c7c7d9', borderRadius: '50%', display: 'inline-block' }}></span>
                    <span className="dot" style={{ width: 8, height: 8, background: '#c7c7d9', borderRadius: '50%', display: 'inline-block' }}></span>
                    <span className="dot" style={{ width: 8, height: 8, background: '#c7c7d9', borderRadius: '50%', display: 'inline-block' }}></span>
                  </div>
                  <span style={{ marginLeft: 8 }}>PASC is thinking...</span>
                </div>
              </div>
            )}
          </div>

          <div style={layout.inputBar}>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask PASC a question..." style={layout.input} rows={2} />
            <button onClick={sendMessage} style={layout.sendBtn}>Send</button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ChatPage;
