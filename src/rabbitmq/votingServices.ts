import { AMQPClient } from '@cloudamqp/amqp-client';
import payload from 'payload';

let consumerInitialized = false; // Flag to track if the consumer is already initialized
const amqpUrl = process.env.AMQP_URL || 'amqp://user:password@localhost:5672';

export async function upvoteConsumer() {
  if (consumerInitialized) {
    console.log('Consumer is already initialized');
    return;
  }

  const amqp = new AMQPClient(amqpUrl);
  const conn = await amqp.connect();
  const channel = await conn.channel();
  const queue = await channel.queue('upvote-queue', { durable: true });

  // Consumer for the upvote queue
  await queue.subscribe(
    {
      noAck: false,
    },
    async (message) => {
      try {
        let data = JSON.parse(message.bodyToString());

        const { contentId, statId, value } = data;

        const countData = await payload.count({
          collection: 'content-votes',
          where: {
            'content.value': {
              equals: contentId,
            },
            type: {
              equals: 'upvote',
            },
          },
        });

        const totalCount = countData.totalDocs;
        const voteSum = countData.totalDocs;

        await payload.update({
          collection: 'content-stats',
          id: statId,
          data: {
            total_count: totalCount,
            votes_sum: voteSum,
          },
        });

        message.ack();
      } catch (error) {
        console.error('Error processing message:', error);
        message.nack();
      }
    }
  );

  consumerInitialized = true; // Set the flag to true after initializing the consumer
  console.log('Consumer setup complete');
}

// Call this function when your application starts
upvoteConsumer().catch(console.error);
