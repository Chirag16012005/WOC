import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Message from '../models/Message.js';
import User from '../models/User.js';

const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            methods: ['GET', 'POST', "DELETE", "PUT", "PATCH"],
            credentials: true,
        },
    });

    const onlineUsers = new Map();

    // Socket.IO middleware for authentication
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return next(new Error('User not found'));
            }

            socket.user = user;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.name} (${socket.user._id})`);

        // Add user to online users
        onlineUsers.set(socket.user._id.toString(), {
            socketId: socket.id,
            userId: socket.user._id,
            name: socket.user.name,
            role: socket.user.role,
        });

        // Broadcast online users
        io.emit('onlineUsers', Array.from(onlineUsers.values()));

        // Join room event
        socket.on('joinRoom', ({ roomId }) => {
            socket.join(roomId);
            console.log(`User ${socket.user.name} joined room: ${roomId}`);
        });

        // Send message event
        socket.on('sendMessage', async ({ roomId, receiverId, message }) => {
            try {
                // Save message to database
                const newMessage = await Message.create({
                    sender: socket.user._id,
                    receiver: receiverId,
                    message,
                    roomId,
                });

                const populatedMessage = await Message.findById(newMessage._id)
                    .populate('sender', 'name email role')
                    .populate('receiver', 'name email role');

                // If it's a complaint chat, update unread counts
                if (roomId.startsWith('complaint_')) {
                    const complaintId = roomId.replace('complaint_', '');
                    const Complaint = (await import('../models/Complaint.js')).default;
                    const complaint = await Complaint.findById(complaintId);

                    if (complaint) {
                        // Increment unread count for receiver
                        if (complaint.user.toString() === receiverId) {
                            complaint.unreadMessages.user += 1;
                        } else if (complaint.company.toString() === receiverId) {
                            complaint.unreadMessages.company += 1;
                        }
                        await complaint.save();
                    }
                }

                // Emit message to room
                io.to(roomId).emit('newMessage', populatedMessage);

                // Also emit to receiver if they're online
                const receiverSocket = Array.from(onlineUsers.values()).find(
                    (u) => u.userId.toString() === receiverId
                );

                if (receiverSocket) {
                    io.to(receiverSocket.socketId).emit('notification', {
                        type: 'newMessage',
                        message: `New message from ${socket.user.name}`,
                        data: populatedMessage,
                    });
                }
            } catch (error) {
                socket.emit('error', { message: error.message });
            }
        });

        // Typing indicator
        socket.on('typing', ({ roomId }) => {
            socket.to(roomId).emit('userTyping', {
                userId: socket.user._id,
                name: socket.user.name,
            });
        });

        socket.on('stopTyping', ({ roomId }) => {
            socket.to(roomId).emit('userStoppedTyping', {
                userId: socket.user._id,
            });
        });

        // Disconnect event
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user.name}`);
            onlineUsers.delete(socket.user._id.toString());
            io.emit('onlineUsers', Array.from(onlineUsers.values()));
        });
    });

    return io;
};

export default setupSocket;
