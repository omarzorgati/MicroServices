const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092'],
});

const producer = kafka.producer();

const produceMessage = async (topic, message) => {
  await producer.connect();
  await producer.send({
    topic,
    messages: [
      { value: JSON.stringify(message) },
    ],
  });
  await producer.disconnect();
};

module.exports = { produceMessage };
