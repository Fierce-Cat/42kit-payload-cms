import { AMQPClient } from '@cloudamqp/amqp-client';

const amqpUrl =
  'amqp://BdejSsThKMwH69R9BmBUGjtJeLuKHYzH:cCS4Twv3YfxQl5OX@rabbitmq-42kit.olisar.space:5672';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function publishToQueue(message: any, queueName: string) {
  const amqp = new AMQPClient(amqpUrl);
  amqp
    .connect()
    .then(conn => {
      return conn.channel().then(channel => {
        return channel.queue(queueName, { durable: true }).then(queue => {
          return queue.publish(JSON.stringify(message), { deliveryMode: 2 }).then(() => {
            return conn.close();
          });
        });
      });
    })
    .catch(error => {
      console.error('Error publishing to queue:', error);
    });
}
