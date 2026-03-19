/**
 * AssetFlow Backend - Main Server Entry Point
 * Refactored MVC architecture for scalability
 */

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import assetRoutes from './routes/asset.routes.js';
import ticketRoutes from './routes/ticket.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import subscriptionController from './controllers/subscription.controller.js';

dotenv.config();

const app = express();

app.use(cookieParser());

// Configure CORS
const allowedOrigins = [
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));


// CRITICAL: Stripe webhook MUST be before express.json() middleware
// Webhook requires raw body for signature verification
app.post(
  '/api/subscription/webhook',
  express.raw({ type: 'application/json' }),
  subscriptionController.handleWebhook
);

// Apply JSON body parser for all other routes
app.use(express.json());

// Register API routes
app.use('/auth', authRoutes);
app.use('/assets', assetRoutes);
app.use('/tickets', ticketRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/subscription', subscriptionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AssetFlow API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 AssetFlow API ready at http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});