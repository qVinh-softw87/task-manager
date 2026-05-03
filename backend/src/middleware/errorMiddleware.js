const notFound = (req, res, next) => {
    res.status(404);
    next(new Error(`Route not found: ${req.originalUrl}`));
    // req.originalUrl is a built-in property in Express that contains the original full URL requested by the client
};

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({
        message: err.message,
    });
};

module.exports = {
    notFound,
    errorHandler,
};
