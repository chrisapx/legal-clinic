import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { chatAPI, conversationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Chat.css';

function Chat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Feature currently unavailable
  return (
    <div className="chat-container">
      <div className="chat-auth-required">
        <div className="auth-prompt">
          <div className="unavailable-icon">💬</div>
          <h1>Chat Feature Currently Unavailable</h1>
          <p>We're working hard to bring you our AI-powered legal chat assistant.</p>
          <p>This feature will be available soon!</p>
          <div className="auth-buttons">
            <Link to="/blog" className="btn btn-primary">
              Browse Articles
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  // Require authentication
  if (!user) {
    return (
      <div className="chat-container">
        <div className="chat-auth-required">
          <div className="auth-prompt">
            <h1>🔒 Authentication Required</h1>
            <p>Please log in to access the Legal Chat Assistant</p>
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-primary">Log In</Link>
              <Link to="/register" className="btn btn-secondary">Sign Up</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const userId = user.id;

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation.id);
    }
  }, [currentConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const response = await conversationAPI.getUserConversations(userId, false);
      setConversations(response.data || []);
    } catch (err) {
      console.error('Error loading conversations:', err);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await conversationAPI.getConversationMessages(conversationId, userId);
      setMessages(response.data || []);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError(null);

    // Optimistically add user message to UI
    const tempMessage = {
      id: Date.now(),
      userMessage: message,
      aiResponse: '',
      createdAt: new Date().toISOString(),
      isLoading: true
    };
    setMessages(prev => [...prev, tempMessage]);
    const sentMessage = message;
    setMessage('');

    try {
      const response = await chatAPI.sendMessage(
        sentMessage,
        userId,
        currentConversation?.id,
        null
      );

      // Replace temporary message with actual response
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      setMessages(prev => [...prev, response.data]);

      // If this was a new conversation, update the conversation list
      if (!currentConversation && response.data.conversationId) {
        await loadConversations();
        const newConv = conversations.find(c => c.id === response.data.conversationId);
        if (!newConv) {
          // Reload to get the new conversation
          setTimeout(async () => {
            await loadConversations();
            const response2 = await conversationAPI.getUserConversations(userId, false);
            const newConversation = response2.data?.[0];
            if (newConversation) {
              setCurrentConversation(newConversation);
            }
          }, 500);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      setMessage(sentMessage); // Restore the message
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentConversation(null);
    setMessages([]);
    setError(null);
  };

  const handleSelectConversation = (conv) => {
    setCurrentConversation(conv);
    setError(null);
  };

  const handleDeleteConversation = async (conversationId, e) => {
    e.stopPropagation();
    if (!confirm('Delete this conversation?')) return;

    try {
      await conversationAPI.deleteConversation(conversationId, userId);
      await loadConversations();
      if (currentConversation?.id === conversationId) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
    }
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className={`chat-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Legal Chat</h2>
          <button className="btn-new-chat" onClick={handleNewChat}>
            + New Chat
          </button>
        </div>

        <div className="conversation-list">
          {conversations.length === 0 ? (
            <div className="empty-conversations">
              <p>No conversations yet</p>
              <small>Start a new chat to begin</small>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`conversation-item ${currentConversation?.id === conv.id ? 'active' : ''}`}
                onClick={() => handleSelectConversation(conv)}
              >
                <div className="conversation-content">
                  <h4>{conv.title}</h4>
                  <p>{conv.lastMessage}</p>
                  <small>{new Date(conv.updatedAt).toLocaleDateString()}</small>
                </div>
                <button
                  className="btn-delete-conv"
                  onClick={(e) => handleDeleteConversation(conv.id, e)}
                  title="Delete conversation"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        {!currentConversation && messages.length === 0 ? (
          <div className="chat-welcome">
            <div className="welcome-content">
              <h1>Legal Clinic Uganda</h1>
              <p>Your AI-powered legal assistant for Ugandan law</p>
              <div className="welcome-examples">
                <h3>Example questions:</h3>
                <div className="example-cards">
                  <div className="example-card" onClick={() => setMessage('What are the requirements for registering a business in Uganda?')}>
                    How do I register a business?
                  </div>
                  <div className="example-card" onClick={() => setMessage('What is the process for filing a civil lawsuit in Uganda?')}>
                    How to file a lawsuit?
                  </div>
                  <div className="example-card" onClick={() => setMessage('What are my rights as a tenant in Uganda?')}>
                    Tenant rights in Uganda
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={msg.id || index}>
                {/* User Message */}
                <div className="message user-message">
                  <div className="message-avatar">
                    {user?.firstName?.[0] || 'U'}
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <strong>You</strong>
                      <small>{new Date(msg.createdAt).toLocaleTimeString()}</small>
                    </div>
                    <p>{msg.userMessage}</p>
                  </div>
                </div>

                {/* AI Response */}
                {msg.aiResponse || msg.isLoading ? (
                  <div className="message ai-message">
                    <div className="message-avatar">⚖️</div>
                    <div className="message-content">
                      <div className="message-header">
                        <strong>Legal Assistant</strong>
                        {!msg.isLoading && <small>{new Date(msg.createdAt).toLocaleTimeString()}</small>}
                      </div>
                      {msg.isLoading ? (
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      ) : (
                        <p>{msg.aiResponse}</p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Area */}
        <div className="chat-input-container">
          {error && (
            <div className="chat-error">
              {error}
            </div>
          )}
          <form onSubmit={handleSendMessage} className="chat-input-form">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask a legal question..."
              className="chat-input"
              rows="1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              disabled={loading}
            />
            <button
              type="submit"
              className="btn-send"
              disabled={loading || !message.trim()}
            >
              {loading ? '⏳' : '➤'}
            </button>
          </form>
          <p className="chat-disclaimer">
            This is general legal information, not legal advice. Consult a lawyer for specific legal matters.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Chat;
