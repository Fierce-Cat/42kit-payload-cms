import { AMQPClient } from '@cloudamqp/amqp-client';

const amqpUrl =
  process.env.AMQP_URL || 'amqp://user:password@localhost:5672';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function publishToQueue(message: any, queueName: string) {
  const amqp = new AMQPClient(amqpUrl);
  let conn;
  try {
    conn = await amqp.connect();
    const channel = await conn.channel();
    const queue = await channel.queue(queueName, { durable: true });
    await queue.publish(JSON.stringify(message), { deliveryMode: 2 });
  } catch (error) {
    console.error('Error publishing to queue:', error);
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (closeError) {
        console.error('Error closing AMQP connection:', closeError);
      }
    }
  }
}
