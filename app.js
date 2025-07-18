const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes')
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();

app.use('/userProfile', express.static(path.join(__dirname, 'public', 'uploads', 'profile')));


// 1. Security middleware first
app.use(helmet());

// 2. Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// 3. Logging
app.use(morgan('dev'));

// 4. CORS with explicit configuration
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie'],
    maxAge: 86400
};
app.use(cors(corsOptions));

// 5. Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// 6. Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.get('/test-image', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/uploads/profile/default.png'));
});

// 7. Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Server is healthy' });
});

// 8. Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// 9. Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});

module.exports = app;