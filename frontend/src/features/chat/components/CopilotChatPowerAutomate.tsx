import React, { useEffect, useRef, useState, useCallback } from 'react';
import apiClient from '../../../services/api.service';
import './CopilotChat.css';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

type ConversationStep = 'welcome' | 'coach_email' | 'participant_email' | 'chat';

// Email validation regex
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Format time
const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// SVG Icons as components
const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="chat-toggle-icon">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
    <path d="M7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z"/>
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

export const CopilotChatPowerAutomate: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Multi-step form state
  const [conversationStep, setConversationStep] = useState<ConversationStep>('welcome');
  const [coachEmail, setCoachEmail] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);

  const toggleChat = useCallback(() => {
    if (isOpen) {
      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
      }, 300);
    } else {
      setIsOpen(true);
    }
  }, [isOpen]);

  const addMessage = useCallback((type: 'user' | 'bot', text: string) => {
    const newMessage: Message = {
      id: generateId(),
      type,
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  // Show welcome message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0 && conversationStep === 'welcome') {
      setTimeout(() => {
        addMessage('bot', '👋 Welcome to Copilot Assistant!\n\nI can help you with training plans, career guidance, and participant insights.');
        setTimeout(() => {
          addMessage('bot', '📧 Please enter the coach email to get started:');
          setConversationStep('coach_email');
        }, 800);
      }, 300);
    }
  }, [isOpen, messages.length, conversationStep, addMessage]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const sendToBackend = useCallback(async (userPrompt: string) => {
    setIsLoading(true);
    setShowQuickActions(false);
    
    try {
      const response = await apiClient.post('/api/power-automate/connect', {
        coachEmail,
        participantEmail,
        userPrompt,
      });

      const responseText = response?.data?.data?.reply || response?.data?.message || 'Response received successfully.';
      addMessage('bot', responseText);
      
      setTimeout(() => {
        setShowQuickActions(true);
      }, 500);

    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorText = err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.';
      addMessage('bot', `❌ ${errorText}`);
      
      setTimeout(() => {
        setShowQuickActions(true);
      }, 500);
    } finally {
      setIsLoading(false);
    }
  }, [coachEmail, participantEmail, addMessage]);

  const handleChangeParticipant = useCallback(() => {
    addMessage('user', 'Change participant');
    setParticipantEmail('');
    setShowQuickActions(false);
    setTimeout(() => {
      addMessage('bot', '👤 Sure! Please enter the new participant email:');
      setConversationStep('participant_email');
    }, 300);
  }, [addMessage]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userInput = input.trim();
    addMessage('user', userInput);
    setInput('');
    setShowQuickActions(false);

    switch (conversationStep) {
      case 'coach_email':
        if (!isValidEmail(userInput)) {
          setTimeout(() => {
            addMessage('bot', '⚠️ Please enter a valid email address.\n\nExample: coach@example.com');
          }, 300);
          return;
        }
        setCoachEmail(userInput);
        setConversationStep('participant_email');
        setTimeout(() => {
          addMessage('bot', '✅ Great! Now please enter the participant email:');
        }, 300);
        break;

      case 'participant_email':
        if (!isValidEmail(userInput)) {
          setTimeout(() => {
            addMessage('bot', '⚠️ Please enter a valid email address.\n\nExample: participant@example.com');
          }, 300);
          return;
        }
        setParticipantEmail(userInput);
        setConversationStep('chat');
        setTimeout(() => {
          addMessage('bot', '🎉 Great! I found the participant. Here are some things you can ask about (availability may vary):\n\n👤 Profile & Background\n• Basic info, position, company\n• Bio & education\n• LinkedIn profile\n• Location & timezone\n\n📄 Documents\n• Resume details\n• Assessment reports (KF360, Learning Agility, etc.)\n\n🎯 Goals & Development\n• Current goals\n• Career needs & timeline\n\n📅 Appointments\n• Upcoming & past sessions\n• Appointment status\n\n🚀 Onboarding & Program\n• Program status & phase\n• Start/end dates\n• Coaching status\n• Onboarding questionnaires\n\n📊 Activity\n• Recent activities\n• Account & registration info\n\n💡 Just ask naturally - I\'ll share what\'s available!');
        }, 300);
        break;

      case 'chat':
        if (userInput.length < 3) {
          setTimeout(() => {
            addMessage('bot', '💡 Please enter a more detailed question or request.');
          }, 300);
          return;
        }
        await sendToBackend(userInput);
        break;

      default:
        break;
    }
  }, [input, isLoading, conversationStep, addMessage, sendToBackend]);

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
      case 'chat':
        return 'Ask me anything...';
      default:
        return 'Type a message...';
    }
  }, [conversationStep]);

  const isInputDisabled = conversationStep === 'welcome' || isLoading;

  // Get current step number for indicator
  const getStepNumber = () => {
    switch (conversationStep) {
      case 'welcome': return 0;
      case 'coach_email': return 1;
      case 'participant_email': return 2;
      case 'chat': return 3;
      default: return 0;
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={toggleChat}
        className={`chat-toggle-btn ${isOpen ? 'open' : ''}`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        aria-expanded={isOpen}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`chat-window ${isClosing ? 'closing' : ''}`} 
          role="dialog" 
          aria-label="Copilot Assistant"
        >
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">🤖</div>
              <div className="chat-header-text">
                <span className="chat-header-title">Copilot Assistant</span>
                <div className="chat-header-status">
                  <span className="status-dot"></span>
                  <span>Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="chat-close-btn"
              aria-label="Close chat"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Step Indicator */}
          {conversationStep !== 'chat' && (
            <div className="step-indicator">
              <div className={`step-dot ${getStepNumber() >= 1 ? 'active' : ''} ${getStepNumber() > 1 ? 'completed' : ''}`}></div>
              <div className={`step-dot ${getStepNumber() >= 2 ? 'active' : ''} ${getStepNumber() > 2 ? 'completed' : ''}`}></div>
              <div className={`step-dot ${getStepNumber() >= 3 ? 'active' : ''}`}></div>
            </div>
          )}

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-wrapper ${msg.type}`}>
                <div className={`message-bubble ${msg.type}`}>
                  {msg.text}
                </div>
                <span className="message-time">{formatTime(msg.timestamp)}</span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="message-wrapper bot">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {showQuickActions && conversationStep === 'chat' && (
              <div className="quick-actions">
                <button
                  onClick={handleChangeParticipant}
                  className="quick-action-btn"
                >
                  <UserIcon />
                  Change Participant
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chat-input-area">
            <div className="chat-input-container">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={getPlaceholder()}
                disabled={isInputDisabled}
                className="chat-input"
                aria-label="Message input"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isInputDisabled}
                className="chat-send-btn"
                aria-label="Send message"
              >
                <SendIcon />
              </button>
            </div>
          </div>

          {/* Branding */}
          <div className="chat-branding">
            Powered by <a href="#">Power Automate</a>
          </div>
        </div>
      )}
    </>
  );
};
