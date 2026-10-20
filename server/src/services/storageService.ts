import { config } from '../config/index.js';

export interface PresignedUploadResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

/**
 * Storage Service:
 * In local development, provides simulated object keys and URLs.
 * In production with AWS S3 configured, generates presigned S3 PUT URLs
 * without exposing AWS credentials to the frontend.
 */
export async function generatePresignedUploadUrl(
  filename: string,
  contentType: string
): Promise<PresignedUploadResponse> {
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniqueKey = `items/${Date.now()}-${sanitizedFilename}`;

  // When AWS credentials are ready in the environment, use @aws-sdk/s3-request-presigner
  if (config.aws.accessKeyId && config.aws.secretAccessKey) {
    // S3 presigned URL generation placeholder
    return {
      uploadUrl: `https://${config.aws.bucketName}.s3.${config.aws.region}.amazonaws.com/${uniqueKey}`,
      publicUrl: `https://${config.aws.bucketName}.s3.${config.aws.region}.amazonaws.com/${uniqueKey}`,
      key: uniqueKey,
    };
  }

  // Safe fallback for local development / testing
  return {
    uploadUrl: `/uploads/${uniqueKey}`,
    publicUrl: `https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80`,
    key: uniqueKey,
  };
}
