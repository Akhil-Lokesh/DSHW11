const { Kafka } = require("kafkajs");
const connectDB = require("../db");

// Create Kafka client
const kafka = new Kafka({ 
  clientId: "order-processor",
  brokers: ["localhost:9092"] 
});

// Create consumer and producer
const consumer = kafka.consumer({ groupId: "order-processor-group" });
const producer = kafka.producer();

// Process incoming orders and send confirmation
async function processOrder(orderData) {
  try {
    console.log(`Processing order: ${JSON.stringify(orderData)}`);
    
    // Here you would add any business logic to validate and process the order
    // For example, check inventory, calculate price, etc.
    
    // Create order confirmation message
    const orderConfirmation = {
      correlation_id: orderData.correlation_id,
      data: {
        itemId: orderData.data.itemId,
        itemName: orderData.data.itemName,
        quantity: orderData.data.quantity,
        // Add additional confirmation data as needed
        orderProcessedAt: new Date().toISOString()
      }
    };
    
    // Send to order-confirmed topic
    await producer.send({
      topic: "order-confirmed",
      messages: [
        { value: JSON.stringify(orderConfirmation) }
      ]
    });
    
    console.log(`Order confirmed and sent to shipping service: ${orderData.data.itemId}`);
  } catch (error) {
    console.error("Error processing order:", error);
  }
}

// Start the order processor service
async function startOrderProcessor() {
  try {
    // Connect to MongoDB (if needed for order processing)
    await connectDB();
    console.log("Connected to MongoDB");
    
    // Connect to Kafka
    await consumer.connect();
    await producer.connect();
    console.log("Connected to Kafka");
    
    // Subscribe to order topic
    await consumer.subscribe({ 
      topic: "order", 
      fromBeginning: false 
    });
    
    // Process incoming orders
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const orderData = JSON.parse(message.value.toString());
          await processOrder(orderData);
        } catch (error) {
          console.error("Error handling message:", error);
        }
      },
    });
    
    console.log("Order processor service started, listening for orders...");
  } catch (error) {
    console.error("Failed to start order processor service:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  try {
    await consumer.disconnect();
    await producer.disconnect();
    console.log("Disconnected from Kafka");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
});

// Start the service
startOrderProcessor(); 