import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { DirectLine } from 'botframework-directlinejs';
import { useDirectLineToken } from '../../../context/DirectLineTokenContext';

interface CopilotChatProps {
  userId: string;
}

interface Message {
  type: string;
  text?: string;
  name?: string;
  value?: unknown;
  from?: {
    id?: string;
    role?: string;
  };
}

export const CopilotChat: React.FC<CopilotChatProps> = ({ userId }) => {
  const { getTokenAndMeta } = useDirectLineToken();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const directLineRef = useRef<DirectLine | null>(null);
  const activitySubscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    let isMounted = true;

    const connect = async () => {
      const data = await getTokenAndMeta();
      if (!data || !isMounted) return;

      const { token, meta = {} } = data;

      const dl = new DirectLine({ token });
      directLineRef.current = dl;

      // Subscribe to incoming activities
      activitySubscriptionRef.current = dl.activity$.subscribe((act: any) => {
        if (act.type === 'message' && act.from?.role === 'bot' && isMounted) {
          setMessages((m) => [...m, act]);
        }
      });

      // Send events after connection is ready
      const sendEvent = (name: string, value: Record<string, unknown>) => {
        dl.postActivity({
          type: 'event',
          name,
          value,
          from: { id: userId, role: 'user' },
        }).subscribe(
          (id: string) => console.log(`Event ${name} sent, id=${id}`),
          (err: Error) => console.error(`Event ${name} failed`, err)
        );
      };

      const param1 = token;
      // Give the stream a moment to open
      setTimeout(() => {
        if (isMounted) {
          sendEvent('appSession', { userId, ...meta });
          sendEvent('startConversation', { userId, param1 });
        }
      }, 300);
    };

    connect();

    return () => {
      isMounted = false;
      // activitySubscriptionRef.current?.unsubscribe();
      // if (directLineRef.current) {
      //   try {
      //     directLineRef.current.end();
      //   } catch (error) {
      //     console.error('Error ending DirectLine connection:', error);
      //   }
      //   directLineRef.current = null;
      // }
      activitySubscriptionRef.current?.unsubscribe();
      directLineRef.current = null;
    };
  }, [getTokenAndMeta, userId]);

  const sendMessage = useCallback(() => {
    if (!input.trim() || !directLineRef.current) return;

    const activity: any = {
      type: 'message',
      text: input.trim(),
      from: { id: userId, role: 'user' }
    };

    directLineRef.current.postActivity(activity).subscribe();

    // Add user message to local state for immediate UI update
    const userMessage: Message = {
      type: 'message',
      text: input.trim(),
      from: { id: userId, role: 'user' },
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
  }, [input, userId]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  const chatButtonStyle = useMemo(
    () => ({
      position: 'fixed' as const,
      bottom: '20px',
      right: '20px',
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: '#0b111d',
      color: 'white',
      border: 'none',
      fontSize: '30px',
      cursor: 'pointer',
      boxShadow: 'rgba(197, 136, 71, 0.2) 2px 7px 20px',
      zIndex: 1000,
    }),
    []
  );

  const chatWindowStyle = useMemo(
    () => ({
      background: 'white',
      border: '1px solid #ccc',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column' as const,
      fontFamily: 'Segoe UI, sans-serif',
      position: 'fixed' as const,
      bottom: '5px',
      right: '20px',
      width: '400px',
      height: '500px',
      zIndex: 1001,
      overflow: 'hidden' as const,
    }),
    []
  );

  return (
    <>
      <button
        onClick={toggleChat}
        style={chatButtonStyle}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        aria-expanded={isOpen}
      >
        💬
      </button>

      {isOpen && (
        <div style={chatWindowStyle} role="dialog" aria-label="Copilot Chat">
          <div
            style={{
              padding: '12px',
              background: '#0078d4',
              color: 'white',
              borderRadius: '12px 12px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <strong>Copilot Assistant</strong>
            <button
              onClick={toggleChat}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '0 8px',
                lineHeight: '1',
              }}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
                Start a conversation...
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={`${msg.type}-${i}-${Date.now()}`}
                  style={{
                    margin: '8px 0',
                    textAlign: msg.from?.role === 'user' ? 'right' : 'left',
                  }}
                >
                  <div
                    style={{
                      display: 'inline-block',
                      maxWidth: '80%',
                      padding: '8px 12px',
                      borderRadius: '18px',
                      background: msg.from?.role === 'user' ? '#0078d4' : '#f1f1f1',
                      color: msg.from?.role === 'user' ? 'white' : 'black',
                      wordWrap: 'break-word' as const,
                    }}
                  >
                    {msg.text || msg.name || (typeof msg.value === 'string' ? msg.value : JSON.stringify(msg.value))}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '12px', borderTop: '1px solid #eee', display: 'flex' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '20px',
                marginRight: '8px',
                outline: 'none',
              }}
              aria-label="Message input"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              style={{
                padding: '8px 16px',
                background: input.trim() ? '#0078d4' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
              }}
              aria-label="Send message"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

