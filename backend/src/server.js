const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log("STEP 1");

const app = require('./app');

console.log("STEP 2");

const connectDB = require('./config/db');

console.log("STEP 3");
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB().then(() => {
  // Start server only after a successful DB connection
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});
