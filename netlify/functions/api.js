import serverless from 'serverless-http'
import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import authRouter from '../../api/routes/auth.route.js'
import userRouter from '../../api/routes/user.route.js'
import listingRouter from '../../api/routes/listing.route.js'
import cookieParser from 'cookie-parser'

dotenv.config()

const app = express()

// CORS Configuration
app.use(
  cors({
    origin: ['https://market-estate-client.vercel.app', 'http://localhost:5173'],
    methods: ['POST', 'GET', 'PUT', 'DELETE'],
    credentials: true,
  })
)

app.use(express.json())
app.use(cookieParser())

// MongoDB Connection
let isConnected = false

const connectDB = async () => {
  if (isConnected) {
    return
  }

  try {
    await mongoose.connect(process.env.MONGO)
    isConnected = true
    console.log('Connected to MongoDB')
  } catch (err) {
    console.error('MongoDB connection error:', err)
    throw err
  }
}

// API Routes
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/listing', listingRouter)

// Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  })
})

// Netlify Function Handler
export const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  
  await connectDB()
  
  return serverless(app)(event, context)
}
