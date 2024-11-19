declare module '@/config' {
  const config: {
    stripe: {
      plans: Array<{
        priceId: string;
        [key: string]: any;
      }>;
      [key: string]: any;
    };
    [key: string]: any;
  };
  export default config;
}

declare module '@/libs/stripe' {
  import type { Stripe } from 'stripe';
  export function findCheckoutSession(_sessionId: string): Promise<Stripe.Checkout.Session | null>;
  // Add other exports as needed
}
