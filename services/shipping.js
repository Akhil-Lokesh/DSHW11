const { Kafka } = require("kafkajs");
const connectDB = require("../db");
const ShippingModel = require("../models/Shipping");
const { v4: uuidv4 } = require("uuid");

// Create kafka client instance
const kafka = new Kafka({ 
  clientId: "shipping-service", 
  brokers: ["localhost:9092"] 
});

// Create consumer with unique group ID
const consumer = kafka.consumer({ 
  groupId: "shipping-service-group" 
});

// Generate a unique tracking ID for each shipment
function generateTrackingId() {
  // Using a custom prefix with a shorter UUID for tracking IDs
  return `SHIP-${uuidv4().substring(0, 8).toUpperCase()}`;
}

// Process order confirmed messages and create shipping records
async function processOrderConfirmed(orderData) {
  try {
    // Extract order details from the message
    const { itemId, itemName, quantity } = orderData;
    
    // Generate tracking ID for this shipment
    const trackingId = generateTrackingId();
    
    // Create new shipping record
    const shipment = new ShippingModel({
      itemId,
      itemName,
      quantity,
      trackingId,
      status: "pending" // Default status
    });
    
    // Save to database
    await shipment.save();
    
    console.log(`Shipping record created with tracking ID: ${trackingId}`);
    return shipment;
  } catch (error) {
    console.error("Error creating shipping record:", error);
    throw error;
  }
}

// Main function to start the microservice
async function startShippingService() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log("Connected to MongoDB");
    
    // Connect to Kafka
    await consumer.connect();
    console.log("Connected to Kafka");
    
    // Subscribe to order-confirmed topic
    await consumer.subscribe({ 
      topic: "order-confirmed", 
      fromBeginning: false 
    });
    
    // Process messages
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          // Parse message value
          const content = JSON.parse(message.value.toString());
          
          // Check if message has required data
          if (content.data) {
            console.log(`Received order confirmation: ${JSON.stringify(content.data)}`);
            
            // Process the order and create shipping
            await processOrderConfirmed(content.data);
          }
        } catch (error) {
          console.error("Error processing message:", error);
        }
      },
    });
    
    console.log("Shipping service started, listening for order confirmations...");
  } catch (error) {
    console.error("Failed to start shipping service:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  try {
    await consumer.disconnect();
    console.log("Disconnected from Kafka");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
});

// Start the service
startShippingService(); 