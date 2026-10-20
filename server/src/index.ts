import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { requestLogger, errorHandler } from './middleware/logger.js';
import { authRouter } from './routes/authRoutes.js';
import { reportRouter } from './routes/reportRoutes.js';
import { claimRouter } from './routes/claimRoutes.js';
import { generatePresignedUploadUrl } from './services/storageService.js';
import { authenticateToken } from './middleware/auth.js';

const app = express();

// Middleware
app.use(cors({
  origin: config.clientOrigin,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'CampusFind Backend API',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

// S3 Upload Preparation Route
app.post('/api/upload/presign', authenticateToken, async (req, res) => {
  const { filename, contentType } = req.body;
  if (!filename || !contentType) {
    res.status(400).json({ error: 'filename and contentType are required' });
    return;
  }
  try {
    const presigned = await generatePresignedUploadUrl(filename, contentType);
    res.json(presigned);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/reports', reportRouter);
app.use('/api/claims', claimRouter);

// Global Error Handler
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`🚀 CampusFind API running on http://localhost:${config.port}`);
  console.log(`📡 CORS enabled for origin: ${config.clientOrigin}`);
});

export default app;
