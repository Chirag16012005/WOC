import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import socketService from '../services/socketService';
import api from '../services/api';
import './ChatBox.css';

const ChatBox = ({ complaint, onClose }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [typing, setTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const roomId = `complaint_${complaint._id}`;
    const receiverId = user._id === complaint.user._id ? complaint.company._id : complaint.user._id;
    const receiverName = user._id === complaint.user._id ? complaint.company.name : complaint.user.name;

    useEffect(() => {
        // Fetch message history
        fetchMessages();

        // Connect socket with token
        const token = localStorage.getItem('token');
        socketService.connect(token);

        // Join complaint room
        socketService.joinRoom(roomId);

        // Listen for new messages
        socketService.onNewMessage((message) => {
            setMessages((prev) => [...prev, message]);
        });

        // Listen for typing indicators
        socketService.onUserTyping((data) => {
            if (data.userId !== user._id) {
                setTyping(true);
            }
        });

        socketService.onUserStoppedTyping((data) => {
            if (data.userId !== user._id) {
                setTyping(false);
            }
        });

        // Mark messages as read when opening chat
        markAsRead();

        return () => {
            socketService.removeAllListeners();
        };
    }, [complaint._id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const response = await api.get(`/chat/complaint/${complaint._id}`);
            setMessages(response.data.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async () => {
        try {
            await api.post(`/chat/complaint/${complaint._id}/read`);
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            socketService.sendMessage(roomId, receiverId, newMessage);
            setNewMessage('');
            socketService.emitStopTyping(roomId);
        }
    };

    const handleTyping = () => {
        socketService.emitTyping(roomId);

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            socketService.emitStopTyping(roomId);
        }, 2000);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="chatbox-overlay" onClick={onClose}>
            <div className="chatbox-container" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="chatbox-header">
                    <div>
                        <h3>{receiverName}</h3>
                        <p className="chatbox-subject">{complaint.subject}</p>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* Messages */}
                <div className="chatbox-messages">
                    {loading ? (
                        <div className="loading-messages">Loading messages...</div>
                    ) : messages.length === 0 ? (
                        <div className="no-messages">
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg._id}
                                className={`message ${msg.sender._id === user._id ? 'sent' : 'received'
                                    }`}
                            >
                                <div className="message-content">
                                    <p className="message-sender">{msg.sender.name}</p>
                                    <p className="message-text">{msg.message}</p>
                                    <span className="message-time">
                                        {formatTime(msg.createdAt)}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                    {typing && (
                        <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                            <p>{receiverName} is typing...</p>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form className="chatbox-input" onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping();
                        }}
                        autoFocus
                    />
                    <button type="submit" disabled={!newMessage.trim()}>
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatBox;
