const { Kafka } = require("kafkajs");
const connectDB = require("../db");
const Order = require("../models/OrderModel");

const kafka = new Kafka({ clientId: "order", brokers: ["localhost:9092"] });
const consumer = kafka.consumer({ groupId: "order-group" });
const producer = kafka.producer();

async function start() {
  await connectDB();
  await consumer.connect();
  await producer.connect();
  await consumer.subscribe({ topic: "order", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const msg = JSON.parse(message.value.toString());
      console.log("Received order message from Kafka:", msg);

      const { itemId, itemName, quantity } = msg.data;

      // save to db
      const newOrder = await Order.create({ itemId, itemName, quantity });

      const resultMsg = `Order placed: ${newOrder.itemName} (ID: ${newOrder.itemId}), qty: ${newOrder.quantity}`;
      const response = {
        correlation_id: msg.correlation_id,
        data: resultMsg,
      };

      // Send response
      await producer.send({
        topic: "rpc-response",
        messages: [{ value: JSON.stringify(response) }],
      });

      // Publish to "order-confirmed" topic
      await producer.send({
        topic: "order-confirmed",
        messages: [
          {
            value: JSON.stringify({
              itemId: newOrder.itemId,
              itemName: newOrder.itemName,
              quantity: newOrder.quantity,
              message: resultMsg
            }),
          },
        ],
      });

      console.log("Order confirmed and published to 'order-confirmed' topic");
    },
  });
}

start();
