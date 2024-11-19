import configFile from '@/config';
import { findCheckoutSession } from '@/libs/stripe';
import { SupabaseClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Ensure required environment variables are set
const getStripeInstance = (): Stripe => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
  }
  return new Stripe(secretKey, {
    apiVersion: '2023-08-16',
    typescript: true,
  });
};

const getWebhookSecret = (): string => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set in environment variables');
  }
  return secret;
};

const getSupabaseClient = (): SupabaseClient => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase environment variables are not properly configured');
  }

  return new SupabaseClient(url, key);
};

// This is where we receive Stripe webhook events
// It used to update the user data, send emails, etc...
// By default, it'll store the user in the database
// See more: https://shipfa.st/docs/features/payments
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    // Initialize our clients
    const stripe = getStripeInstance();
    const webhookSecret = getWebhookSecret();
    const supabase = getSupabaseClient();

    // Verify Stripe event is legit
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    const eventType = event.type;

    try {
      switch (eventType) {
        case 'checkout.session.completed': {
          // First payment is successful and a subscription is created (if mode was set to "subscription" in ButtonCheckout)
          // Grant access to the product
          const stripeObject = event.data.object as Stripe.Checkout.Session;

          if (!stripeObject.id) {
            throw new Error('Missing session ID in Stripe webhook event');
          }

          const session = await findCheckoutSession(stripeObject.id);

          if (!session) {
            throw new Error('Failed to retrieve checkout session');
          }

          const customerId = session?.customer;
          const priceId = session?.line_items?.data?.[0]?.price?.id;
          if (!priceId) {
            throw new Error('Missing price ID in checkout session');
          }
          const userId = stripeObject.client_reference_id;
          const plan = configFile.stripe.plans.find(p => p.priceId === priceId);

          if (!customerId || typeof customerId !== 'string') {
            throw new Error('Missing or invalid customer ID in checkout session');
          }

          const customerResponse = await stripe.customers.retrieve(customerId);

          // Check if customer is deleted
          if ('deleted' in customerResponse) {
            throw new Error('Cannot process deleted customer');
          }

          const customerEmail = customerResponse.email;
          if (!customerEmail) {
            throw new Error('Customer email is missing');
          }

          if (!plan) {
            console.warn('No matching plan found for price ID:', priceId);
            break;
          }

          let user;
          if (!userId) {
            // check if user already exists
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('email', customerEmail)
              .single();

            if (error) {
              throw new Error(`Failed to fetch user profile: ${error.message}`);
            }

            if (profile) {
              user = profile;
            } else {
              // create a new user using supabase auth admin
              const { data, error: createUserError } = await supabase.auth.admin.createUser({
                email: customerEmail,
                email_confirm: true, // This ensures the email is marked as confirmed
              });

              if (createUserError) {
                throw new Error(`Failed to create user: ${createUserError.message}`);
              }

              user = data?.user;
            }
          } else {
            // find user by ID
            const { data: profile, error: fetchUserError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();

            if (fetchUserError) {
              throw new Error(`Failed to fetch user profile: ${fetchUserError.message}`);
            }

            user = profile;
          }

          if (!user?.id) {
            throw new Error('Failed to find or create user');
          }

          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              customer_id: customerId,
              price_id: priceId,
              has_access: true,
            })
            .eq('id', user.id);

          if (updateError) {
            throw new Error(`Failed to update user profile: ${updateError.message}`);
          }

          // Extra: send email with user link, product page, etc...
          // try {
          //   await sendEmail(...);
          // } catch (e) {
          //   console.error("Email issue:" + e?.message);
          // }

          break;
        }

        case 'checkout.session.expired': {
          // User didn't complete the transaction
          // You don't need to do anything here, by you can send an email to the user to remind him to complete the transaction, for instance
          break;
        }

        case 'customer.subscription.updated': {
          // The customer might have changed the plan (higher or lower plan, cancel soon etc...)
          // You don't need to do anything here, because Stripe will let us know when the subscription is canceled for good (at the end of the billing cycle) in the "customer.subscription.deleted" event
          // You can update the user data to show a "Cancel soon" badge for instance
          break;
        }

        case 'customer.subscription.deleted': {
          // The customer subscription stopped
          // Revoke access to the product
          const stripeObject: Stripe.Subscription = event.data.object as Stripe.Subscription;
          const subscription = await stripe.subscriptions.retrieve(stripeObject.id);

          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('customer_id', subscription.customer)
            .single();

          if (profileError) {
            throw new Error(`Failed to fetch profile: ${profileError.message}`);
          }

          if (!profile) {
            throw new Error('No profile found for customer');
          }

          const { error: updateError } = await supabase
            .from('profiles')
            .update({ has_access: false })
            .eq('customer_id', subscription.customer);

          if (updateError) {
            throw new Error(`Failed to update profile access: ${updateError.message}`);
          }

          break;
        }

        case 'invoice.paid': {
          // Customer just paid an invoice (for instance, a recurring payment for a subscription)
          // Grant access to the product
          const stripeObject: Stripe.Invoice = event.data.object as Stripe.Invoice;
          const lineItem = stripeObject.lines.data?.[0];
          if (!lineItem?.price?.id) {
            throw new Error('Missing price ID in invoice line items');
          }
          const priceId = lineItem.price.id;
          const customerId = stripeObject.customer;

          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('customer_id', customerId)
            .single();

          if (profileError) {
            throw new Error(`Failed to fetch profile: ${profileError.message}`);
          }

          if (!profile) {
            throw new Error('No profile found for customer');
          }

          // Make sure the invoice is for the same plan (priceId) the user subscribed to
          if (profile.price_id !== priceId) break;

          // Grant the profile access to your product
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ has_access: true })
            .eq('customer_id', customerId);

          if (updateError) {
            throw new Error(`Failed to update profile access: ${updateError.message}`);
          }

          break;
        }

        case 'invoice.payment_failed':
          // A payment failed (for instance the customer does not have a valid payment method)
          // Revoke access to the product
          // OR wait for the customer to pay (more friendly):
          //      - Stripe will automatically email the customer (Smart Retries)
          //      - We will receive a "customer.subscription.deleted" when all retries were made and the subscription has expired

          break;

        default:
        // Unhandled event type
      }
      return NextResponse.json({ received: true });
    } catch (error) {
      console.error('Error processing webhook event:', error);
      return NextResponse.json({ error: 'Error processing webhook event' }, { status: 500 });
    }
  } catch (err) {
    console.error('Error in webhook handler:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 400 }
    );
  }
}
