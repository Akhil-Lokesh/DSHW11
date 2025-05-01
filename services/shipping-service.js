const { Kafka } = require("kafkajs");
const connectDB = require("../db");
const Shipping = require("../models/ShippingModel");

const kafka = new Kafka({ clientId: "shipping", brokers: ["localhost:9092"] });
const consumer = kafka.consumer({ groupId: "shipping-group" });

function generateTrackingId() {
  return "SHIP-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function start() {
  await connectDB();
  await consumer.connect();
  await consumer.subscribe({ topic: "order-confirmed", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const msg = JSON.parse(message.value.toString());
      console.log("Received order-confirmed:", msg);

      const shipping = new Shipping({
        itemId: msg.itemId,
        itemName: msg.itemName,
        quantity: msg.quantity,
        trackingId: generateTrackingId(),
      });

      await shipping.save();
      console.log("Shipping record saved:", shipping);
    }
  });
}

start();
