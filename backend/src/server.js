const path = require('path');
const dns = require('dns');

// Fix for MongoDB Atlas "querySrv ECONNREFUSED" error on certain local networks
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { startReminderScheduler } = require('./services/reminder.service');
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB().then(() => {
  // Start server only after a successful DB connection
  app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  // Start reminder scheduler
  startReminderScheduler();
}).catch((err) => {
  logger.error('Failed to start server', { error: err.message });
});
