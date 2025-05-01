const { Kafka } = require("kafkajs");

const kafka = new Kafka({ clientId: "simulator", brokers: ["localhost:9092"] });
const producer = kafka.producer();

async function run() {
  await producer.connect();

  await producer.send({
    topic: "order",
    messages: [
      {
        value: JSON.stringify({
          correlation_id: "test123",
          data: {
            itemId: "123",
            itemName: "Pizza",
            quantity: 2
          }
        })
      }
    ]
  });

  console.log("Test order sent to Kafka");
  await producer.disconnect();
}

run();
