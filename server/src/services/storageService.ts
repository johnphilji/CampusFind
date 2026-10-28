import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config/index.js';

export interface PresignedUploadResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

// Initialize S3 client using environment or EC2 IAM Role credentials
const s3Client = new S3Client({
  region: config.aws.region,
  ...(config.aws.accessKeyId && config.aws.secretAccessKey
    ? {
        credentials: {
          accessKeyId: config.aws.accessKeyId,
          secretAccessKey: config.aws.secretAccessKey,
        },
      }
    : {}),
});

/** Allowed image MIME types for upload */
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

/**
 * Generates an S3 presigned PUT URL for direct, secure file upload from frontend
 * Validates content-type against an allowlist and keeps private evidence secure
 */
export async function generatePresignedUploadUrl(
  filename: string,
  contentType: string,
  isPrivateEvidence: boolean = false
): Promise<PresignedUploadResponse> {
  // SECURITY: Reject disallowed file types before doing anything else
  if (!ALLOWED_IMAGE_TYPES.has(contentType.toLowerCase())) {
    throw new Error(`File type '${contentType}' is not allowed. Accepted types: jpeg, png, webp, gif.`);
  }
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const folder = isPrivateEvidence ? 'evidence' : 'items';
  const uniqueKey = `${folder}/${Date.now()}-${sanitizedFilename}`;

  // If AWS S3 bucket is configured, generate presigned PUT URL
  if (config.aws.bucketName && (config.aws.accessKeyId || process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI || process.env.AWS_EXECUTION_ENV || process.env.NODE_ENV === 'production')) {
    try {
      const command = new PutObjectCommand({
        Bucket: config.aws.bucketName,
        Key: uniqueKey,
        ContentType: contentType,
      });

      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
      // Point to our secure backend proxy route which streams from private S3 bucket
      const publicUrl = isPrivateEvidence
        ? '' // Private evidence is never exposed via public URL
        : `/api/images/${uniqueKey}`;

      return {
        uploadUrl,
        publicUrl,
        key: uniqueKey,
      };
    } catch (err) {
      console.warn('S3 presign warning (falling back to local mock):', err);
    }
  }

  // Safe fallback for local development / testing
  return {
    uploadUrl: `/uploads/${uniqueKey}`,
    publicUrl: `https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80`,
    key: uniqueKey,
  };
}

/**
 * Streams S3 object directly to response
 */
export async function getObjectStream(key: string) {
  if (!config.aws.bucketName) {
    throw new Error('S3 bucket not configured');
  }
  const command = new GetObjectCommand({
    Bucket: config.aws.bucketName,
    Key: key,
  });
  return await s3Client.send(command);
}

/**
 * Generate temporary presigned download URL for authorized admin viewing of private evidence
 */
export async function getPresignedEvidenceDownloadUrl(key: string): Promise<string> {
  if (!config.aws.bucketName) return '';
  try {
    const command = new GetObjectCommand({
      Bucket: config.aws.bucketName,
      Key: key,
    });
    return await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minutes validity
  } catch (err) {
    console.error('Error generating evidence download URL:', err);
    return '';
  }
}

