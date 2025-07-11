const app = require('./app');
const { sequelize } = require('./models');
const PORT = process.env.PORT || 5000;

// Database Connection and Server Start
const startServer = async () => {
    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('Database connection established successfully');

        // Sync models with database
        // Note: alter/force should be used carefully in production
        const syncOptions = process.env.NODE_ENV === 'production'
            ? {}
            : { alter: true };

        await sequelize.sync(syncOptions);
        console.log('Database models synchronized');

        // Start server
        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        // Handle server shutdown gracefully
        process.on('SIGTERM', () => shutdown(server));
        process.on('SIGINT', () => shutdown(server));

    } catch (error) {
        console.error('Unable to start server:', error);
        process.exit(1);
    }
};

// Graceful shutdown function
const shutdown = (server) => {
    console.log('Shutting down server gracefully...');
    server.close(() => {
        console.log('Server closed');
        sequelize.close()
            .then(() => {
                console.log('Database connection closed');
                process.exit(0);
            })
            .catch(err => {
                console.error('Error closing database connection:', err);
                process.exit(1);
            });
    });
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    // Don't exit immediately in production - might want to log and continue
    if (process.env.NODE_ENV === 'development') {
        process.exit(1);
    }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Exit in all environments as this is potentially unsafe
    process.exit(1);
});