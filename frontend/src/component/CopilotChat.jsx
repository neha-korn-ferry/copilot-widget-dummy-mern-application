import React, { useEffect, useRef, useState } from 'react';
import { DirectLine } from 'botframework-directlinejs';
import { useDirectLineToken } from '../context/DirectLineTokenContext';

const CopilotChat = ({ userId }) => {
  const { getTokenAndMeta } = useDirectLineToken();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const directLineRef = useRef(null);
  const activitySubscriptionRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };
  // CopilotChat.jsx  (only the useEffect part)
  useEffect(() => {
    let isMounted = true;

    const connect = async () => {
      const data = await getTokenAndMeta();   // <-- MUST return { token, meta? }
      if (!data || !isMounted) return;

      const { token, meta = {} } = data;      // meta will be {} for now

      const dl = new DirectLine({ token });
      directLineRef.current = dl;

      // ---- 1. Subscribe to incoming activities
      activitySubscriptionRef.current = dl.activity$.subscribe(act => {
        if (act.type === 'message' && act.from?.role === 'bot') {
          setMessages(m => [...m, act]);
        }
      });

      // ---- 2. SEND THE EVENT *after* the connection is open
      // (DirectLine guarantees the activity is sent only when the stream is ready)
      const sendEvent = (name, value) => {
        dl.postActivity({
          type: 'event',
          name,
          value,
          from: { id: userId, role: 'user' },
        }).subscribe(
          id => console.log(`Event ${name} sent, id=${id}`),
          err => console.error(`Event ${name} failed`, err)
        );
      };

      // Give the stream a tiny moment to open (optional but safe)
      setTimeout(() => {
        sendEvent('appSession', { userId, ...meta });
        sendEvent('startConversation', { userId });
      }, 300);
    };

    connect();

    return () => {
      isMounted = false;
      activitySubscriptionRef.current?.unsubscribe();
      directLineRef.current = null;
    };
  }, [getTokenAndMeta, userId]);

  const sendMessage = () => {
    if (!input.trim() || !directLineRef.current) return;

    const activity = {
      type: 'message',
      text: input,
      from: { id: userId, role: 'user' }
    };

    directLineRef.current.postActivity(activity).subscribe();
    setMessages(prev => [...prev, activity]);
    setInput('');
  };

  return (<>
    <button
      onClick={toggleChat}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        backgroundColor: "#0b111d ",
        color: "white",
        border: "none",
        fontSize: "30px",
        cursor: "pointer",
        boxShadow: "rgba(197, 136, 71, 0.2) 2px 7px 20px",
      }}
    >
      💬
    </button>

    {isOpen && (
      <div style={{
        background: 'white',
        border: '1px solid #ccc',
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Segoe UI, sans-serif',
        position: "fixed",
        bottom: "5px",
        right: "20px",
        width: 400,
        height: 500,
        backgroundColor: "white",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        borderRadius: "10px",
        overflow: "hidden",
      }}>
        <div
          style={{
            padding: 12,
            background: '#0078d4',
            color: 'white',
            borderRadius: '12px 12px 0 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <strong>Copilot Assistant</strong>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: 18,
                marginLeft: 8,
              }}
              onClick={() => setIsOpen(false)}
            >
              ×
            </span>
          </div>
        </div>


        <div style={{ flex: 1, padding: 12, overflowY: 'auto' }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                margin: '8px 0',
                textAlign: msg.from?.role === 'user' ? 'right' : 'left'
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  maxWidth: '80%',
                  padding: '8px 12px',
                  borderRadius: 18,
                  background: msg.from?.role === 'user' ? '#0078d4' : '#f1f1f1',
                  color: msg.from?.role === 'user' ? 'white' : 'black'
                }}
              >
                {msg.text || msg.name || JSON.stringify(msg.value)}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: 12, borderTop: '1px solid #eee', display: 'flex' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: 20,
              marginRight: 8
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              padding: '8px 16px',
              background: '#0078d4',
              color: 'white',
              border: 'none',
              borderRadius: 20,
              cursor: 'pointer'
            }}
          >
            Send
          </button>
        </div>
      </div>
    )}
  </>
  );
};

export default CopilotChat;
