const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  itemId: String,
  itemName: String,
  quantity: Number,
  status: { type: String, default: "confirmed" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
