import express from 'express';
import payload from 'payload';
import fs from 'fs';
import https from 'https';

import { upvoteConsumer } from './rabbitmq/votingServices'; // Import the consumer setup function

import dotenv from 'dotenv';
dotenv.config();
const app = express();

// Redirect root to Admin panel
app.get('/', (_, res) => {
  res.redirect('/admin');
});

const start = async () => {
  // Initialize Payload
  await payload.init({
    secret: process.env.PAYLOAD_SECRET,
    express: app,
    onInit: async () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`);
    },
  });

  // Start the consumer
  await upvoteConsumer();

  if (process.env.LOCAL_HTTPS === 'true') {
    const keyPath = process.env.SSL_KEY_PATH;
    const certPath = process.env.SSL_CERT_PATH;
    if (!keyPath || !certPath) {
      throw new Error('SSL_KEY_PATH and SSL_CERT_PATH environment variables must be set for HTTPS.');
    }
    const key = fs.readFileSync(keyPath); // Path to your SSL key
    const cert = fs.readFileSync(certPath); // Path to your SSL certificate

    // Create HTTPS server
    const server = https.createServer({ key, cert }, app);

    // Listen on HTTPS port
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
      console.log(`HTTPS Server running on port ${port}`);
    });
  } else {
    // Add your own express routes here
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Payload Server running on port ${port}`);
    });
  }
};

start();
