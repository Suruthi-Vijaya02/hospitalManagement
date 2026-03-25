const mongoose = require('mongoose');

const errorHandler = (err, req, res, next) => {
    console.error(err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            error: Object.values(err.errors).map(e => e.message),
        });
    }

    // Invalid ObjectId
    if (err instanceof mongoose.Error.CastError) {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format',
            error: err.message,
        });
    }

    // Default server error
    return res.status(500).json({
        success: false,
        message: 'Server Error',
        error: err.message,
    });
};

module.exports = errorHandler;