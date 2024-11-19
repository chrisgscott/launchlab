/// <reference types="node" />

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      STRIPE_SECRET_KEY: string;
      STRIPE_WEBHOOK_SECRET: string;
      // Add other env variables as needed
    }
  }
}

// Declare the module without importing types
declare module '@/config' {
  interface StripeConfig {
    plans: Array<{
      name: string;
      priceId: string;
      [key: string]: any;
    }>;
    [key: string]: any;
  }

  interface Config {
    stripe: StripeConfig;
    [key: string]: any;
  }

  const config: Config;
  export default config;
}

declare module '@/libs/stripe' {
  import type { Checkout, Stripe as StripeType } from 'stripe';

  export function getStripeInstance(): StripeType;
  export function findCheckoutSession(sessionId: string): Promise<Checkout.Session | null>;
  export function createCheckout(params: {
    user?: {
      customerId?: string;
      email?: string;
    };
    mode: 'payment' | 'subscription';
    clientReferenceId?: string;
    successUrl: string;
    cancelUrl: string;
    priceId: string;
    couponId?: string | null;
  }): Promise<string | null>;
  export function createCustomerPortal(params: {
    customerId: string;
    returnUrl: string;
  }): Promise<string | null>;
}
