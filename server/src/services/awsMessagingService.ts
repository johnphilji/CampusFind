import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { config } from '../config/index.js';

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

const snsClient = new SNSClient({
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

export interface ClaimEventMessage {
  eventId: string;
  eventType: 'CLAIM_SUBMITTED' | 'CLAIM_APPROVED' | 'CLAIM_REJECTED' | 'ITEM_RETURNED' | 'LISTING_REOPENED';
  claimId: string;
  claimReference: string;
  reportId: string;
  itemTitle: string;
  claimantId: string;
  timestamp: string;
}

/**
 * Publishes an asynchronous event to AWS SQS for background claim lifecycle processing
 */
export async function sendClaimEventToSQS(message: ClaimEventMessage): Promise<void> {
  if (!config.aws.sqsQueueUrl) {
    console.log('[SQS Mock Producer] Enqueued message:', message.eventType, message.claimReference);
    return;
  }

  try {
    const command = new SendMessageCommand({
      QueueUrl: config.aws.sqsQueueUrl,
      MessageBody: JSON.stringify(message),
      MessageAttributes: {
        eventType: {
          DataType: 'String',
          StringValue: message.eventType,
        },
      },
    });

    await sqsClient.send(command);
    console.log('[AWS SQS Producer] Successfully sent claim message to SQS:', message.claimReference);
  } catch (err) {
    console.error('[AWS SQS Producer Error]:', err);
  }
}

/**
 * Publishes notification to AWS SNS Topic (alerting users/admins of claim approval/rejection)
 * Strictly omits private claim proof/evidence to ensure privacy
 */
export async function publishClaimNotificationSNS(subject: string, messageBody: string): Promise<void> {
  if (!config.aws.snsTopicArn) {
    console.log(`[SNS Mock Publisher] [Subject: ${subject}] Message: ${messageBody}`);
    return;
  }

  try {
    const command = new PublishCommand({
      TopicArn: config.aws.snsTopicArn,
      Subject: subject.slice(0, 100),
      Message: messageBody,
    });

    await snsClient.send(command);
    console.log('[AWS SNS Publisher] Successfully broadcasted notification to SNS topic:', subject);
  } catch (err) {
    console.error('[AWS SNS Publisher Error]:', err);
  }
}
