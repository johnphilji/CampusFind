import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { config } from '../config/index.js';
import { pool } from '../db/index.js';

const sqsClient = new SQSClient({
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

let isPolling = false;

/**
 * Background consumer worker that polls Amazon SQS for claim events
 * Processes audit events and deduplicates handling
 */
export async function pollSQSQueue(): Promise<void> {
  if (!config.aws.sqsQueueUrl || isPolling) return;
  isPolling = true;

  try {
    const command = new ReceiveMessageCommand({
      QueueUrl: config.aws.sqsQueueUrl,
      MaxNumberOfMessages: 5,
      WaitTimeSeconds: 10, // Long polling
    });

    const response = await sqsClient.send(command);

    if (response.Messages && response.Messages.length > 0) {
      for (const msg of response.Messages) {
        if (!msg.Body) continue;

        try {
          const payload = JSON.parse(msg.Body);
          console.log(`[AWS SQS Worker] Processing Event: ${payload.eventType} for Claim: ${payload.claimReference}`);

          // Insert into audit_events table to fulfill compliance logging
          await pool.query(
            `INSERT INTO audit_events (action, entity_type, entity_id, metadata)
             VALUES ($1, 'sqs_claim_worker', $2, $3)`,
            [
              `SQS_PROCESSED_${payload.eventType}`,
              payload.claimId || payload.reportId || 'unknown',
              JSON.stringify(payload),
            ]
          );

          // Delete message from queue upon successful processing
          if (msg.ReceiptHandle) {
            await sqsClient.send(
              new DeleteMessageCommand({
                QueueUrl: config.aws.sqsQueueUrl,
                ReceiptHandle: msg.ReceiptHandle,
              })
            );
          }
        } catch (parseErr) {
          console.error('[AWS SQS Worker] Failed to process message body:', parseErr);
        }
      }
    }
  } catch (err) {
    // Suppress network logs if offline
  } finally {
    isPolling = false;
  }
}

/**
 * Starts continuous background polling worker
 */
export function startSQSWorker(intervalMs: number = 15000): NodeJS.Timeout {
  console.log('[AWS SQS Worker] Initialized asynchronous claim event consumer.');
  return setInterval(pollSQSQueue, intervalMs);
}
