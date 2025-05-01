const { Kafka } = require("kafkajs");
const { v4: uuidv4 } = require("uuid");

const kafka = new Kafka({ clientId: "gateway", brokers: ["localhost:9092"] });
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "rpc-response-group" });

const pendingRequests = {};

async function initKafka() {
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ topic: "rpc-response", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const res = JSON.parse(message.value.toString());
      const correlationId = res.correlation_id;

      if (pendingRequests[correlationId]) {
        pendingRequests[correlationId](res.data);
        delete pendingRequests[correlationId];
      }
    },
  });
}

async function makeRequest(topic, data, callback) {
  const correlation_id = uuidv4();
  pendingRequests[correlation_id] = callback;

  await producer.send({
    topic,
    messages: [{ value: JSON.stringify({ correlation_id, data }) }],
  });
}

module.exports = { initKafka, makeRequest };
