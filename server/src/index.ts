import express from 'express';
import cors from 'cors';
import path from 'path';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
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
import { startRetentionScheduler } from './services/retentionService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ---------------------------------------------------------------------------
// CORS — restrict to known frontend origins when CLIENT_ORIGIN is configured.
// Falls back to '*' if CLIENT_ORIGIN is not set (preserves existing behaviour
// for local dev and EC2 deployments that haven't set the variable yet).
// ---------------------------------------------------------------------------
const corsOrigin: string | string[] | boolean =
  config.clientOrigin && config.clientOrigin !== '*'
    ? config.clientOrigin.split(',').map((o) => o.trim())
    : true; // true = allow all origins (backwards-compatible default)

app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);

// ---------------------------------------------------------------------------
// Rate limiting — applied only to authentication endpoints.
// 10 attempts per 15-minute window; returns a consistent JSON error so
// the frontend can display it without crashing.
// ---------------------------------------------------------------------------
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  skipSuccessfulRequests: true, // only count failed (non-2xx) requests toward limit
});

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

// ---------------------------------------------------------------------------
// S3 Upload Preparation Route
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// S3 Image Streaming Proxy Route
// - Public item photos (keys starting with 'items/') remain unauthenticated
//   so <img> tags in the frontend load without extra headers.
// - Private claim evidence (keys starting with 'evidence/') requires a valid
//   admin JWT, preventing students from guessing evidence keys.
// ---------------------------------------------------------------------------
app.get('/api/images/*', async (req, res) => {
  const s3Key = (req.params as any)[0];
  if (!s3Key) {
    res.status(400).send('Image key is required.');
    return;
  }

  // Guard: evidence images require admin authentication
  if (s3Key.startsWith('evidence/')) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      res.status(401).send('Authentication required to access private evidence.');
      return;
    }
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      if (decoded.role !== 'admin' && decoded.role !== 'security_staff') {
        res.status(403).send('Admin access required for private evidence.');
        return;
      }
    } catch {
      res.status(403).send('Invalid or expired token.');
      return;
    }
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

// API Routes — apply rate limiter to auth routes
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/admin/login', authLimiter); // also limit the admin login endpoint
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

  // Start automatic data retention scheduler (7-day and 30-day rules)
  startRetentionScheduler();
});

export default app;
