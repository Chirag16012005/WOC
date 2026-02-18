import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.connected = false;
    }

    connect(token) {
        if (this.socket && this.connected) {
            return this.socket;
        }

        const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

        this.socket = io(SERVER_URL, {
            auth: {
                token: token,
            },
            autoConnect: true,
        });

        this.socket.on('connect', () => {
            console.log('Socket connected');
            this.connected = true;
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
            this.connected = false;
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }

    joinRoom(roomId) {
        if (this.socket) {
            this.socket.emit('joinRoom', { roomId });
        }
    }

    sendMessage(roomId, receiverId, message) {
        if (this.socket) {
            this.socket.emit('sendMessage', { roomId, receiverId, message });
        }
    }

    onNewMessage(callback) {
        if (this.socket) {
            this.socket.on('newMessage', callback);
        }
    }

    onNotification(callback) {
        if (this.socket) {
            this.socket.on('notification', callback);
        }
    }

    onUserTyping(callback) {
        if (this.socket) {
            this.socket.on('userTyping', callback);
        }
    }

    onUserStoppedTyping(callback) {
        if (this.socket) {
            this.socket.on('userStoppedTyping', callback);
        }
    }

    emitTyping(roomId) {
        if (this.socket) {
            this.socket.emit('typing', { roomId });
        }
    }

    emitStopTyping(roomId) {
        if (this.socket) {
            this.socket.emit('stopTyping', { roomId });
        }
    }

    removeAllListeners() {
        if (this.socket) {
            this.socket.removeAllListeners('newMessage');
            this.socket.removeAllListeners('notification');
            this.socket.removeAllListeners('userTyping');
            this.socket.removeAllListeners('userStoppedTyping');
        }
    }

    getSocket() {
        return this.socket;
    }

    isConnected() {
        return this.connected;
    }
}

// Export a singleton instance
export default new SocketService();
