import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import apiClient from '../../../services/api.service';

interface Message {
  type: string;
  text?: string;
  name?: string;
  value?: unknown;
  from?: {
    id?: string;
    role?: string;
  };
  showOptions?: boolean;
}

type ConversationStep = 'welcome' | 'coach_email' | 'participant_email' | 'user_prompt' | 'chat' | 'options';

// Email validation regex
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const CopilotChatPowerAutomate: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Multi-step form state
  const [conversationStep, setConversationStep] = useState<ConversationStep>('welcome');
  const [coachEmail, setCoachEmail] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const addBotMessage = useCallback((text: string, showOptions: boolean = false) => {
    const botMessage: Message = {
      type: 'message',
      text,
      from: { id: 'bot', role: 'bot' },
      showOptions,
    };
    setMessages((prev) => [...prev, botMessage]);
  }, []);

  const addUserMessage = useCallback((text: string) => {
    const userMessage: Message = {
      type: 'message',
      text,
      from: { id: 'user', role: 'user' },
    };
    setMessages((prev) => [...prev, userMessage]);
  }, []);

  // Show welcome message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0 && conversationStep === 'welcome') {
      const welcomeMessage: Message = {
        type: 'message',
        text: 'Hello! Welcome to Copilot Assistant. I can help you get information about training plans, career guidance, and more.',
        from: { id: 'bot', role: 'bot' },
      };
      setMessages([welcomeMessage]);
      
      // After welcome, ask for coach email
      setTimeout(() => {
        addBotMessage('Please enter the coach email:');
        setConversationStep('coach_email');
      }, 500);
    }
  }, [isOpen, messages.length, conversationStep, addBotMessage]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendToBackend = useCallback(async (userPrompt: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/api/power-automate/connect', {
        coachEmail,
        participantEmail,
        userPrompt,
      });

      // Handle the API response
      const responseText = typeof response.data === 'string'
        ? response.data
        : response.data?.message || response.data?.text || JSON.stringify(response.data, null, 2);
      
      addBotMessage(responseText);
      
      // After successful response, show options
      setTimeout(() => {
        addBotMessage('What would you like to do next?', true);
        setConversationStep('options');
      }, 500);
      
    } catch (error: any) {
      const errorText = error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';
      addBotMessage(errorText);
      
      // Even on error, show options to retry or change
      setTimeout(() => {
        addBotMessage('What would you like to do next?', true);
        setConversationStep('options');
      }, 500);
    } finally {
      setIsLoading(false);
    }
  }, [coachEmail, participantEmail, addBotMessage]);

  // Handle option button clicks
  const handleOptionClick = useCallback((option: 'ask_more' | 'change_participant') => {
    if (option === 'ask_more') {
      addUserMessage('Ask more about this participant');
      setTimeout(() => {
        addBotMessage(`Great! What else would you like to know about ${participantEmail}?`);
        setConversationStep('chat');
      }, 300);
    } else if (option === 'change_participant') {
      addUserMessage('Change participant');
      // Only reset participant email, keep coach email
      setParticipantEmail('');
      setTimeout(() => {
        addBotMessage('Sure! Please enter the new participant email:');
        setConversationStep('participant_email');
      }, 300);
    }
  }, [addUserMessage, addBotMessage, participantEmail]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userInput = input.trim();
    addUserMessage(userInput);
    setInput('');

    switch (conversationStep) {
      case 'coach_email':
        // Validate email
        if (!isValidEmail(userInput)) {
          setTimeout(() => {
            addBotMessage('Please enter a valid email address (e.g., coach@example.com):');
          }, 300);
          return;
        }
        setCoachEmail(userInput);
        setConversationStep('participant_email');
        setTimeout(() => {
          addBotMessage('Thank you! Now please enter the participant email:');
        }, 300);
        break;

      case 'participant_email':
        // Validate email
        if (!isValidEmail(userInput)) {
          setTimeout(() => {
            addBotMessage('Please enter a valid email address (e.g., participant@example.com):');
          }, 300);
          return;
        }
        setParticipantEmail(userInput);
        setConversationStep('user_prompt');
        setTimeout(() => {
          addBotMessage('Great! What information would you like to get for this participant? (e.g., training plan, career guidance, progress report)');
        }, 300);
        break;

      case 'user_prompt':
      case 'chat':
        // Validate prompt is not too short
        if (userInput.length < 3) {
          setTimeout(() => {
            addBotMessage('Please enter a more detailed question or request:');
          }, 300);
          return;
        }
        await sendToBackend(userInput);
        break;

      case 'options':
        // If user types instead of clicking buttons
        const lowerInput = userInput.toLowerCase();
        if (lowerInput.includes('more') || lowerInput.includes('same') || lowerInput.includes('ask')) {
          handleOptionClick('ask_more');
        } else if (lowerInput.includes('change') || lowerInput.includes('new') || lowerInput.includes('different')) {
          handleOptionClick('change_participant');
        } else {
          // Treat as a new question for same participant
          setConversationStep('chat');
          await sendToBackend(userInput);
        }
        break;

      default:
        break;
    }
  }, [input, isLoading, conversationStep, addUserMessage, addBotMessage, sendToBackend, handleOptionClick]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const getPlaceholder = useCallback(() => {
    switch (conversationStep) {
      case 'welcome':
        return 'Please wait...';
      case 'coach_email':
        return 'Enter coach email...';
      case 'participant_email':
        return 'Enter participant email...';
      case 'user_prompt':
        return 'e.g., Give me training plan...';
      case 'chat':
        return 'Type your question...';
      case 'options':
        return 'Choose an option or type your question...';
      default:
        return 'Type a message...';
    }
  }, [conversationStep]);

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

  const optionButtonStyle = useMemo(
    () => ({
      padding: '10px 16px',
      margin: '4px',
      border: '1px solid #0078d4',
      borderRadius: '20px',
      background: 'white',
      color: '#0078d4',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: 500,
      transition: 'all 0.2s ease',
    }),
    []
  );

  const isInputDisabled = conversationStep === 'welcome' || isLoading;

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
        <div style={chatWindowStyle} role="dialog" aria-label="Power Automate Chat">
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
            {messages.map((msg, i) => (
              <div key={`${msg.type}-${i}`}>
                <div
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
                      whiteSpace: 'pre-wrap' as const,
                    }}
                  >
                    {msg.text || msg.name || (typeof msg.value === 'string' ? msg.value : JSON.stringify(msg.value))}
                  </div>
                </div>
                
                {/* Show option buttons */}
                {msg.showOptions && conversationStep === 'options' && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginTop: '8px',
                      marginBottom: '8px',
                    }}
                  >
                    <button
                      onClick={() => handleOptionClick('ask_more')}
                      style={optionButtonStyle}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#0078d4';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.color = '#0078d4';
                      }}
                    >
                      🔄 Ask more about this participant
                    </button>
                    <button
                      onClick={() => handleOptionClick('change_participant')}
                      style={optionButtonStyle}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#0078d4';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.color = '#0078d4';
                      }}
                    >
                      👤 Change participant
                    </button>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div
                style={{
                  margin: '8px 0',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    padding: '8px 12px',
                    borderRadius: '18px',
                    background: '#f1f1f1',
                    color: '#666',
                  }}
                >
                  Typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '12px', borderTop: '1px solid #eee', display: 'flex' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={getPlaceholder()}
              disabled={isInputDisabled}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '20px',
                marginRight: '8px',
                outline: 'none',
                opacity: isInputDisabled ? 0.7 : 1,
              }}
              aria-label="Message input"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isInputDisabled}
              style={{
                padding: '8px 16px',
                background: input.trim() && !isInputDisabled ? '#0078d4' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: input.trim() && !isInputDisabled ? 'pointer' : 'not-allowed',
              }}
              aria-label="Send message"
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
