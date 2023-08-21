require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_DB_URI

const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      // connection options
    });
    console.log('Database connected');
  } catch (error) {
    console.error('Database connection failed', error);
    process.exit(1);
  }
};

module.exports = connectDB;
