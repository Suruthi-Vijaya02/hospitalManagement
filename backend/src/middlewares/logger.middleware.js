const logger = require('../utils/logger');

const loggerMiddleware = (req, res, next) => {
  // Capture request start time
  const start = Date.now();

  // Once the response is finished, log the details
  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} [${res.statusCode}] - ${duration}ms`;

    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent') || ''
    };

    if (res.statusCode >= 400 && res.statusCode < 500) {
      logger.warn(message, { metadata: logData });
    } else if (res.statusCode >= 500) {
      logger.error(message, { metadata: logData });
    } else {
      logger.info(message, { metadata: logData });
    }
  });

  next();
};

module.exports = loggerMiddleware;
