import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import api from '../services/api';
import './Chat.css';

const Chat = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [adminId, setAdminId] = useState(null);
    const [roomId, setRoomId] = useState('');
    const [onlineUsers, setOnlineUsers] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (user) {
            // Find an admin to chat with
            fetchAdmin();

            const socket = getSocket();
            if (socket) {
                setupSocketListeners(socket);
            }
        }
    }, [user]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchAdmin = async () => {
        try {
            // For demo purposes, we'll use a hardcoded admin ID
            // In production, you'd fetch available admins from an endpoint
            const adminUserId = 'admin-user-id'; // Replace with actual admin ID
            setAdminId(adminUserId);

            // Create room ID (sorted IDs to ensure consistency)
            const ids = [user._id, adminUserId].sort();
            const room = `room-${ids[0]}-${ids[1]}`;
            setRoomId(room);

            // Join room
            const socket = getSocket();
            if (socket) {
                socket.emit('joinRoom', { roomId: room });
            }

            // Fetch chat history
            fetchChatHistory(room);
        } catch (err) {
            console.error('Error fetching admin:', err);
        }
    };

    const fetchChatHistory = async (room) => {
        try {
            const response = await api.get(`/chat/history/${room}`);
            setMessages(response.data.data);
        } catch (err) {
            console.error('Error fetching chat history:', err);
        }
    };

    const setupSocketListeners = (socket) => {
        socket.on('newMessage', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        socket.on('onlineUsers', (users) => {
            setOnlineUsers(users);
        });

        socket.on('userTyping', (data) => {
            console.log(`${data.name} is typing...`);
        });
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !adminId || !roomId) return;

        const socket = getSocket();
        if (socket) {
            socket.emit('sendMessage', {
                roomId,
                receiverId: adminId,
                message: newMessage,
            });
            setNewMessage('');
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <button className="chat-toggle-btn" onClick={toggleChat}>
                💬 {onlineUsers.length > 0 && <span className="online-indicator"></span>}
            </button>

            {isOpen && (
                <div className="chat-widget">
                    <div className="chat-header">
                        <h3>Chat with Support</h3>
                        <button className="close-btn" onClick={toggleChat}>
                            ×
                        </button>
                    </div>

                    <div className="chat-messages">
                        {messages.length > 0 ? (
                            messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`message ${msg.sender._id === user._id ? 'sent' : 'received'
                                        }`}
                                >
                                    <div className="message-content">
                                        <div className="message-sender">
                                            {msg.sender._id === user._id ? 'You' : msg.sender.name}
                                        </div>
                                        <div className="message-text">{msg.message}</div>
                                        <div className="message-time">
                                            {new Date(msg.createdAt).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-messages">No messages yet. Start a conversation!</div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="chat-input">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                        />
                        <button type="submit" disabled={!newMessage.trim()}>
                            Send
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default Chat;
