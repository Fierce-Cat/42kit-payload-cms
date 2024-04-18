import express from 'express'
import payload from 'payload'
import fs from 'fs'
import https from 'https'

require('dotenv').config()
const app = express()

const key = fs.readFileSync('./local-dev.citizenwiki.cn-key.pem') // Path to your SSL key
const cert = fs.readFileSync('./local-dev.citizenwiki.cn.pem') // Path to your SSL certificate

// Create HTTPS server
const server = https.createServer({ key, cert }, app)

// Listen on HTTPS port
const port = process.env.PORT || 3000
server.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

// Redirect root to Admin panel
app.get('/', (_, res) => {
  res.redirect('/admin')
})

const start = async () => {
  // Initialize Payload
  await payload.init({
    secret: process.env.PAYLOAD_SECRET,
    express: app,
    onInit: async () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`)
    },
  })

  // Add your own express routes here
  // const port = process.env.PORT || 3000
  // app.listen(port)
}

start()
