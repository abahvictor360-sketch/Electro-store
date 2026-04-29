import Stripe from "stripe";

// Lazy singleton — only instantiated when first accessed at runtime,
// not during Next.js build-time page data collection.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    _stripe = new Stripe(key);
  }
  return _stripe;
}
