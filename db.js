const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect("mongodb://localhost:27017/microservice-demo");
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
}

module.exports = connectDB;
