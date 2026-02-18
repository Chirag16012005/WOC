import { io } from 'socket.io-client';

let socket;

export const initializeSocket = (token) => {
    socket = io('https://woc-2.onrender.com/', {
        auth: {
            token,
        },
        autoConnect: true,
    });

    socket.on('connect', () => {
        console.log('Connected to Socket.IO server');
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from Socket.IO server');
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });

    return socket;
};

export const getSocket = () => {
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
    }
};
