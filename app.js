const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const morgan = require('morgan')



const app = express();

// Middlewares
app.use(morgan('dev'))
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'Server is healthy' });
});

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;