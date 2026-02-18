import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import connectDB from './config/db.js';
import setupSocket from './config/socket.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import companyProfileRoutes from './routes/companyProfileRoutes.js';

dotenv.config();
connectDB();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Service Bee API is running',
        version: '1.0.0',
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/company', companyProfileRoutes);

app.use(notFound);
app.use(errorHandler);

const server = createServer(app);
const io = setupSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.IO enabled`);
});

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});
