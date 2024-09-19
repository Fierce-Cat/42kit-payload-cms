import { AMQPClient } from '@cloudamqp/amqp-client';

const amqpUrl = process.env.AMQP_URL || 'amqp://user:password@localhost:5672';

export function publishToQueue (message: any, queueName: string) {
  const amqp = new AMQPClient(amqpUrl);
  amqp.connect().then(conn => {
    return conn.channel().then(channel => {
      return channel.queue(queueName, { durable: true }).then(queue => {
        return queue.publish(JSON.stringify(message), { deliveryMode: 2 }).then(() => {
          return conn.close();
        });
      });
    });
  }).catch(error => {
    console.error('Error publishing to queue:', error);
  });
}


