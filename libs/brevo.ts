import * as SibApiV3Sdk from 'sib-api-v3-sdk';
import config from '../config';
import {
  EmailTemplateId,
  TemplateParams,
  validateTemplateParams,
  getTemplateDescription,
} from './email-templates';

// Custom error classes for better error handling
export class BrevoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BrevoError';
  }
}

export class BrevoTemplateError extends BrevoError {
  constructor(templateId: number) {
    super(`Template with ID ${templateId} not found or is invalid`);
    this.name = 'BrevoTemplateError';
  }
}

export class BrevoRateLimitError extends BrevoError {
  constructor() {
    super('API rate limit exceeded. Please try again later.');
    this.name = 'BrevoRateLimitError';
  }
}

export class BrevoNetworkError extends BrevoError {
  constructor(originalError: Error) {
    super(`Network error occurred: ${originalError.message}`);
    this.name = 'BrevoNetworkError';
  }
}

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY || '';

// Create a reusable transactional email API instance
const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

if (!process.env.BREVO_API_KEY && process.env.NODE_ENV === 'development') {
  console.group('⚠️ BREVO_API_KEY missing from .env');
  console.log('Add it to your .env file to enable email sending.');
  console.error("If you don't need it, remove the code from /libs/brevo.ts");
  console.groupEnd();
}

interface SendEmailOptions {
  to: string | { email: string; name?: string }[];
  subject?: string;
  text?: string;
  html?: string;
  templateId?: number;
  templateParams?: Record<string, any>;
  replyTo?: string | { email: string; name?: string };
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
  templateId,
  templateParams,
  replyTo,
}: SendEmailOptions) {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    // Convert to array if single email
    const toEmails = Array.isArray(to) ? to : [{ email: to }];

    // Validate email addresses
    for (const recipient of toEmails) {
      if (!isValidEmail(recipient.email)) {
        throw new BrevoError(`Invalid email address: ${recipient.email}`);
      }
    }

    sendSmtpEmail.to = toEmails;

    if (templateId) {
      sendSmtpEmail.templateId = templateId;
      if (templateParams) {
        sendSmtpEmail.params = templateParams;
      }
    } else {
      if (!subject) throw new BrevoError('Subject is required when not using a template');
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = html;
      sendSmtpEmail.textContent = text;
    }

    sendSmtpEmail.sender = {
      email: config.email.fromEmail,
      name: config.email.fromName,
    };

    if (replyTo) {
      sendSmtpEmail.replyTo = typeof replyTo === 'string' ? { email: replyTo } : replyTo;
    }

    const response = await emailApi.sendTransacEmail(sendSmtpEmail);
    return response;
  } catch (error) {
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        throw new BrevoRateLimitError();
      }
      if (error.message.includes('template')) {
        throw new BrevoTemplateError(templateId!);
      }
      if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
        throw new BrevoNetworkError(error);
      }
    }

    // Log the error for debugging
    console.error('Error sending email:', error);
    throw error;
  }
}

// Helper function to validate email addresses
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Type-safe function to send template-based emails
export async function sendTemplateEmail<T extends EmailTemplateId>(
  templateId: T,
  to: string | { email: string; name?: string }[],
  params: TemplateParams[T]
) {
  // Validate template parameters
  if (!validateTemplateParams(templateId, params)) {
    throw new BrevoError(`Invalid parameters for template: ${getTemplateDescription(templateId)}`);
  }

  return sendEmail({
    to,
    templateId,
    templateParams: params,
  });
}

export default { sendEmail, sendTemplateEmail };
