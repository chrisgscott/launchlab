// @ts-ignore
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

export class BrevoRateLimitError extends BrevoError {
  constructor() {
    super('Rate limit exceeded');
    this.name = 'BrevoRateLimitError';
  }
}

export class BrevoNetworkError extends BrevoError {
  constructor(originalError: Error) {
    super(`Network error occurred: ${originalError.message}`);
    this.name = 'BrevoNetworkError';
  }
}

const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const BREVO_API_URL = 'https://api.brevo.com/v3';

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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

interface EmailData {
  to: { email: string; name?: string }[];
  templateId?: number;
  params?: Record<string, any>;
  subject?: string;
  htmlContent?: string;
  textContent?: string;
  sender: {
    email: string;
    name: string;
  };
  replyTo?: { email: string; name?: string };
}

// Function to send emails
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
    // Convert to array if single email
    const toEmails = Array.isArray(to) ? to : [{ email: to }];

    // Validate email addresses
    for (const recipient of toEmails) {
      if (!isValidEmail(recipient.email)) {
        throw new BrevoError(`Invalid email address: ${recipient.email}`);
      }
    }

    const emailData: EmailData = {
      to: toEmails,
      sender: {
        email: 'hello@uselaunchlab.com', // Replace with your from email
        name: 'Chris at UseLaunchLab', // Replace with your name
      },
    };

    if (templateId) {
      emailData.templateId = templateId;
      if (templateParams) {
        emailData.params = templateParams;
      }
    } else {
      if (!subject) throw new BrevoError('Subject is required when not using a template');
      emailData.subject = subject;
      emailData.htmlContent = html;
      emailData.textContent = text;
    }

    if (replyTo) {
      emailData.replyTo = typeof replyTo === 'string' ? { email: replyTo } : replyTo;
    }

    const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new BrevoError(`Failed to send email: ${error.message || 'Unknown error'}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        throw new BrevoRateLimitError();
      }
      if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
        throw new BrevoNetworkError(error);
      }
    }
    throw error;
  }
}

// Type-safe function to send template-based emails
export async function sendTemplateEmail(
  templateId: number,
  to: string,
  params: Record<string, any>
): Promise<void> {
  try {
    const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        templateId,
        to: [{ email: to }],
        params,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new BrevoError(`Failed to send email: ${error.message || 'Unknown error'}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        throw new BrevoRateLimitError();
      }
      if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
        throw new BrevoNetworkError(error);
      }
    }
    throw error;
  }
}

// Subscribe an email to a list
export async function subscribeToList(email: string, listId: number) {
  try {
    const response = await fetch(`${BREVO_API_URL}/contacts`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        email,
        listIds: [listId],
        updateEnabled: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new BrevoError(`Failed to subscribe to list: ${error.message || 'Unknown error'}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('duplicate')) {
        // Contact already exists, not necessarily an error
        return null;
      }
      if (error.message.includes('rate limit')) {
        throw new BrevoRateLimitError();
      }
      if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
        throw new BrevoNetworkError(error);
      }
    }
    throw error;
  }
}

export default { sendEmail, sendTemplateEmail, subscribeToList };
