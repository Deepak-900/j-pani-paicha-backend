const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {

    // ✅ This prints the full stack trace to the terminal
    console.error(err.stack || err.message || err);

    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode).json({
        message: err.message || 'Something went wrong',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = { notFound, errorHandler };