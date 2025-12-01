// Aerologue Email Forwarder Lambda
// Receives emails from SES, stores in S3, and forwards to specified address

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses';

const s3 = new S3Client({ region: 'us-east-1' });
const ses = new SESClient({ region: 'us-east-1' });

// Configuration - Update FORWARD_TO with your email
const CONFIG = {
  emailBucket: 'aerologue-emails',
  emailKeyPrefix: 'incoming/',
  forwardMapping: {
    'info@aerologue.com': [process.env.FORWARD_TO || 'samsonsamuel@live.co.uk'],
    '@aerologue.com': [process.env.FORWARD_TO || 'samsonsamuel@live.co.uk'], // Catch-all
  },
  fromEmail: 'noreply@aerologue.com',
  subjectPrefix: '[Aerologue] ',
};

export const handler = async (event) => {
  console.log('Received SES event:', JSON.stringify(event, null, 2));

  const sesNotification = event.Records[0].ses;
  const messageId = sesNotification.mail.messageId;
  const recipients = sesNotification.receipt.recipients;

  console.log(`Processing email ${messageId} for recipients:`, recipients);

  try {
    // Get the email from S3
    const s3Key = `${CONFIG.emailKeyPrefix}${messageId}`;
    const getObjectResponse = await s3.send(new GetObjectCommand({
      Bucket: CONFIG.emailBucket,
      Key: s3Key,
    }));

    let emailData = await streamToString(getObjectResponse.Body);

    // Process each recipient
    for (const recipient of recipients) {
      const forwardAddresses = getForwardAddresses(recipient);

      if (forwardAddresses.length === 0) {
        console.log(`No forwarding configured for ${recipient}`);
        continue;
      }

      // Modify the email for forwarding
      const modifiedEmail = modifyEmailForForwarding(emailData, recipient, forwardAddresses);

      // Send the forwarded email
      await ses.send(new SendRawEmailCommand({
        RawMessage: { Data: Buffer.from(modifiedEmail) },
      }));

      console.log(`Forwarded email to: ${forwardAddresses.join(', ')}`);
    }

    return { status: 'success', messageId };
  } catch (error) {
    console.error('Error processing email:', error);
    throw error;
  }
};

function getForwardAddresses(recipient) {
  const recipientLower = recipient.toLowerCase();

  // Check for exact match
  if (CONFIG.forwardMapping[recipientLower]) {
    return CONFIG.forwardMapping[recipientLower];
  }

  // Check for domain catch-all
  const domain = '@' + recipientLower.split('@')[1];
  if (CONFIG.forwardMapping[domain]) {
    return CONFIG.forwardMapping[domain];
  }

  return [];
}

function modifyEmailForForwarding(emailData, originalRecipient, forwardAddresses) {
  // Parse and modify headers
  const headerEndIndex = emailData.indexOf('\r\n\r\n');
  const headers = emailData.substring(0, headerEndIndex);
  const body = emailData.substring(headerEndIndex);

  let modifiedHeaders = headers;

  // Replace From header to avoid SPF/DKIM issues
  modifiedHeaders = modifiedHeaders.replace(
    /^From:.*$/im,
    `From: "Aerologue Forwarding" <${CONFIG.fromEmail}>`
  );

  // Add Reply-To with original sender
  const originalFrom = headers.match(/^From:\s*(.*)$/im);
  if (originalFrom) {
    modifiedHeaders += `\r\nReply-To: ${originalFrom[1]}`;
  }

  // Replace To header
  modifiedHeaders = modifiedHeaders.replace(
    /^To:.*$/im,
    `To: ${forwardAddresses.join(', ')}`
  );

  // Add X-Forwarded headers for reference
  modifiedHeaders += `\r\nX-Original-To: ${originalRecipient}`;
  modifiedHeaders += `\r\nX-Forwarded-By: aerologue-email-forwarder`;

  // Optionally prefix subject
  if (CONFIG.subjectPrefix) {
    modifiedHeaders = modifiedHeaders.replace(
      /^Subject:\s*(.*)$/im,
      (match, subject) => {
        if (!subject.startsWith(CONFIG.subjectPrefix)) {
          return `Subject: ${CONFIG.subjectPrefix}${subject}`;
        }
        return match;
      }
    );
  }

  return modifiedHeaders + body;
}

async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}
