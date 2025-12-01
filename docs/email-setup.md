# Email Setup - SES Email Forwarding

**Document ID:** EMAIL-SETUP-001.0
**Last Updated:** 2025-12-01
**Status:** Active

This document describes the email infrastructure for Aerologue using AWS SES Email Forwarding.

---

## Overview

**Setup Type:** SES Email Receiving with Lambda Forwarding

Emails sent to @aerologue.com addresses are:
1. Received by AWS SES
2. Stored in S3 for archival
3. Forwarded to a personal email address via Lambda

This is a cost-effective solution (~$0.10/1000 emails) suitable for early-stage projects.

---

## Email Addresses

| Address | Purpose | Forwards To |
|---------|---------|-------------|
| info@aerologue.com | General contact, support | samsonsamuel@live.co.uk |
| *@aerologue.com | Catch-all (any address) | samsonsamuel@live.co.uk |

---

## How It Works

```
[Sender]
    │
    ▼
[info@aerologue.com]
    │
    ▼ (MX Record points to AWS)
[AWS SES - Receives Email]
    │
    ├──▶ [S3: aerologue-emails/incoming/] (archived)
    │
    ▼
[Lambda: aerologue-email-forwarder]
    │
    ▼
[SES - Sends Forwarded Email]
    │
    ▼
[samsonsamuel@live.co.uk]
```

---

## Email Modifications During Forwarding

When an email is forwarded, the Lambda modifies headers to ensure deliverability:

| Original | Forwarded |
|----------|-----------|
| From: sender@example.com | From: "Aerologue Forwarding" <noreply@aerologue.com> |
| To: info@aerologue.com | To: samsonsamuel@live.co.uk |
| Subject: Hello | Subject: [Aerologue] Hello |
| (none) | Reply-To: sender@example.com |
| (none) | X-Original-To: info@aerologue.com |

**Why modify From?** To avoid SPF/DKIM failures. The original sender is preserved in Reply-To.

---

## Replying to Emails

### Option 1: Reply Directly
Click "Reply" in your email client. The Reply-To header will address your response to the original sender. However, your reply will show as coming from samsonsamuel@live.co.uk.

### Option 2: Send As (Recommended)
Configure your email client to "Send As" info@aerologue.com:

**In Outlook.com / Hotmail:**
1. Settings → View all Outlook settings
2. Mail → Sync email → Other email accounts
3. Add info@aerologue.com as a "Send As" address
4. Verify ownership (may need SES verification)

**In Gmail:**
1. Settings → See all settings → Accounts and Import
2. "Send mail as" → Add another email address
3. Enter info@aerologue.com
4. SMTP Server: email-smtp.us-east-1.amazonaws.com
5. Port: 587, TLS
6. Username/Password: SES SMTP credentials (create in AWS Console → SES → SMTP settings)

---

## AWS Resources

| Resource | Name/ID | Purpose |
|----------|---------|---------|
| S3 Bucket | aerologue-emails | Email storage |
| Lambda | aerologue-email-forwarder | Processes and forwards emails |
| SES Rule Set | aerologue-email-rules | Active receipt rule set |
| SES Receipt Rule | forward-info | Routes info@ to Lambda |
| IAM Role | aerologue-email-forwarder-role | Lambda execution role |

---

## Sandbox Mode

**Current Status:** 🟡 Sandbox Mode

### What Works
- ✅ Receiving emails to any @aerologue.com address
- ✅ Storing emails in S3
- ✅ Forwarding to verified email addresses

### Limitations
- ⚠️ Can only forward to verified email addresses
- ⚠️ Daily sending limit: 200 emails
- ⚠️ Sending rate: 1 email/second

### Verified Addresses
To forward to an address, it must be verified:
```bash
aws ses verify-email-identity --email-address user@example.com --region us-east-1
```

Then click the verification link in the email.

### Exit Sandbox (When Needed)
See `TODO.md` for decision criteria. To request production access:
1. AWS Console → SES → Account Dashboard
2. Click "Request production access"
3. Describe use case
4. Wait 24-48 hours

---

## Costs

| Item | Cost |
|------|------|
| SES Receiving | First 1,000/month free, then $0.10/1,000 |
| SES Sending | $0.10/1,000 emails |
| S3 Storage | ~$0.023/GB/month |
| Lambda | First 1M requests/month free |
| **Estimated Monthly** | **< $1** for low volume |

---

## Adding New Email Addresses

To add a new forwarding address (e.g., support@aerologue.com → different email):

1. Update Lambda configuration:
   ```javascript
   forwardMapping: {
     'info@aerologue.com': ['samsonsamuel@live.co.uk'],
     'support@aerologue.com': ['support-team@example.com'],  // Add new
   }
   ```

2. Verify the destination email (if in sandbox):
   ```bash
   aws ses verify-email-identity --email-address support-team@example.com --region us-east-1
   ```

3. Redeploy Lambda:
   ```bash
   cd lambda/email-forwarder
   powershell Compress-Archive -Path index.mjs -DestinationPath email-forwarder.zip -Force
   aws lambda update-function-code --function-name aerologue-email-forwarder --zip-file fileb://email-forwarder.zip --region us-east-1
   ```

---

## Troubleshooting

### Email not received?
1. Check S3 bucket - is the email stored in `aerologue-emails/incoming/`?
2. Check Lambda logs in CloudWatch
3. Verify destination email is verified (sandbox mode)

### View Lambda logs:
```bash
aws logs tail /aws/lambda/aerologue-email-forwarder --follow --region us-east-1
```

### Check SES sending statistics:
```bash
aws ses get-send-statistics --region us-east-1
```

---

## Future Upgrade Path

When ready for a full email inbox:

| Option | Cost | Features |
|--------|------|----------|
| Amazon WorkMail | $4/user/month | Webmail, calendar, Outlook compatible |
| Google Workspace | $6/user/month | Gmail interface, Drive, Meet |
| Zoho Mail | Free (1 user) | Basic webmail |

---

## References

- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [aws-setup.md](aws-setup.md) - Full AWS infrastructure
- [TODO.md](TODO.md) - Sandbox review checklist
