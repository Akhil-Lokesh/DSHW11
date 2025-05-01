const mongoose = require('mongoose');

// Define the shipping schema with required fields
const shippingSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  trackingId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "shipped", "delivered", "cancelled"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Shipping', shippingSchema); 