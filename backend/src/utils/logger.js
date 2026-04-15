const winston = require('winston');
require('winston-mongodb');

const path = require('path');
const dotenv = require('dotenv');

// We ensure env variables are loaded because this logger will need MONGO_URI
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Setup options for MongoDB transport
// We only add the MongoDB transport if MONGO_URI is defined
const transports = [
  new winston.transports.File({ 
    filename: path.join(__dirname, '../../logs/error.json'), 
    level: 'error',
    format: logFormat
  }),
  new winston.transports.File({ 
    filename: path.join(__dirname, '../../logs/combined.json'),
    format: logFormat
  }),
  // Adding Console log so we still see activity in our terminal
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  })
];

if (process.env.MONGO_URI) {
  transports.push(
    new winston.transports.MongoDB({
      level: 'info',
      db: process.env.MONGO_URI,
      collection: 'server_logs',
      format: logFormat,
    })
  );
}

const logger = winston.createLogger({
  level: 'info',
  transports: transports,
  exitOnError: false,
});

module.exports = logger;
