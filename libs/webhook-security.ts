import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Brevo's IP ranges - update this list periodically
// Source: https://developers.brevo.com/docs/ip-whitelist
const BREVO_IP_RANGES = [
  '185.107.232.0/24',
  '185.107.232.0/24',
  // Add more IP ranges as needed
];

export class WebhookSecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebhookSecurityError';
  }
}

// Check if an IP is within a CIDR range
function isIpInRange(ip: string, cidr: string): boolean {
  const [range, bits = "32"] = cidr.split("/");
  const mask = ~((1 << (32 - parseInt(bits))) - 1);
  
  const ipParts = ip.split(".").map(Number);
  const rangeParts = range.split(".").map(Number);
  
  const ipNum = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
  const rangeNum = (rangeParts[0] << 24) + (rangeParts[1] << 16) + (rangeParts[2] << 8) + rangeParts[3];
  
  return (ipNum & mask) === (rangeNum & mask);
}

// Validate that the request comes from Brevo
function validateIpAddress(req: NextRequest): boolean {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0] : req.ip;
  
  if (!ip) return false;
  
  return BREVO_IP_RANGES.some(range => isIpInRange(ip, range));
}

// Validate the Brevo signature
function validateSignature(req: NextRequest): boolean {
  const signature = req.headers.get('brevo-signature');
  const webhookSecret = process.env.BREVO_WEBHOOK_SECRET;
  
  if (!signature || !webhookSecret) {
    return false;
  }

  // Implement signature validation based on Brevo's requirements
  // This will depend on how Brevo signs their webhooks
  return true;
}

// Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  max: 10 // 10 requests per minute
};

const requestCounts = new Map<string, { count: number; timestamp: number }>();

// Simple rate limiting implementation
function checkRateLimit(req: NextRequest): boolean {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  
  const current = requestCounts.get(ip);
  if (!current) {
    requestCounts.set(ip, { count: 1, timestamp: now });
    return true;
  }
  
  if (now - current.timestamp > RATE_LIMIT.windowMs) {
    requestCounts.set(ip, { count: 1, timestamp: now });
    return true;
  }
  
  if (current.count >= RATE_LIMIT.max) {
    return false;
  }
  
  current.count++;
  return true;
}

// Main security middleware
export async function validateWebhook(req: NextRequest): Promise<NextResponse | null> {
  try {
    // Check rate limiting
    if (!checkRateLimit(req)) {
      throw new WebhookSecurityError('Rate limit exceeded');
    }

    // Validate IP address
    if (!validateIpAddress(req)) {
      throw new WebhookSecurityError('Invalid IP address');
    }

    // Validate signature
    if (!validateSignature(req)) {
      throw new WebhookSecurityError('Invalid signature');
    }

    return null; // Validation passed
  } catch (error) {
    if (error instanceof WebhookSecurityError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Webhook validation failed' },
      { status: 401 }
    );
  }
}
