import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import { requestLogger, errorHandler } from './middleware/logger.js';
import { authRouter } from './routes/authRoutes.js';
import { reportRouter } from './routes/reportRoutes.js';
import { claimRouter } from './routes/claimRoutes.js';
import { adminRouter } from './routes/adminRoutes.js';
import { notificationRouter } from './routes/notificationRoutes.js';
import { generatePresignedUploadUrl, getObjectStream } from './services/storageService.js';
import { authenticateToken } from './middleware/auth.js';
import { startSQSWorker } from './services/sqsWorker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allows local dev and EC2 public IP/domain
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);

// Health check endpoint for CloudWatch & EC2 target checks
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'CampusFind Backend API',
    environment: config.nodeEnv,
    region: config.aws.region,
    s3Bucket: config.aws.bucketName,
    sqsConfigured: Boolean(config.aws.sqsQueueUrl),
    snsConfigured: Boolean(config.aws.snsTopicArn),
    timestamp: new Date().toISOString()
  });
});

// S3 Upload Preparation Route
app.post('/api/upload/presign', authenticateToken, async (req, res) => {
  const { filename, contentType, isPrivateEvidence } = req.body;
  if (!filename || !contentType) {
    res.status(400).json({ error: 'filename and contentType are required' });
    return;
  }
  try {
    const presigned = await generatePresignedUploadUrl(filename, contentType, Boolean(isPrivateEvidence));
    res.json(presigned);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

// S3 Image Streaming Proxy Route
// Enables seamless browser rendering while keeping S3 bucket completely private
app.get('/api/images/*', async (req, res) => {
  const s3Key = (req.params as any)[0];
  if (!s3Key) {
    res.status(400).send('Image key is required.');
    return;
  }

  try {
    const s3Data = await getObjectStream(s3Key);
    if (s3Data.ContentType) {
      res.setHeader('Content-Type', s3Data.ContentType);
    }
    if (s3Data.ContentLength) {
      res.setHeader('Content-Length', s3Data.ContentLength);
    }
    res.setHeader('Cache-Control', 'public, max-age=86400');
    (s3Data.Body as any).pipe(res);
  } catch (err: any) {
    if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
      res.status(404).send('Image not found in S3.');
    } else {
      console.error('Error streaming image from S3:', err);
      res.status(500).send('Failed to retrieve image from storage.');
    }
  }
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/reports', reportRouter);
app.use('/api/claims', claimRouter);
app.use('/api/admin', adminRouter);
app.use('/api/notifications', notificationRouter);

// Serve built frontend assets if hosted together on EC2
const clientDistPath = path.resolve(__dirname, '../../dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) next();
  });
});

// Global Error Handler
app.use(errorHandler);

// Start server
const server = app.listen(config.port, () => {
  console.log(`🚀 CampusFind API running on port ${config.port}`);
  console.log(`🌍 Environment: ${config.nodeEnv} | AWS Region: ${config.aws.region}`);
  
  // Start background SQS consumer worker
  if (config.aws.sqsQueueUrl) {
    startSQSWorker();
  }
});

export default app;
