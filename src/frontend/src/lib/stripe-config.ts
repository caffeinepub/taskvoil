// Stripe public key for TaskVoilà
export const STRIPE_PUBLIC_KEY =
  "pk_test_51RYWXvH8ORT1N7BcqifIYQd7AuEZY8BfRefUEFodeRrAKojFGzCf61zPcZuSEu5z4bCwh8hTgKz7o6Nlu2cFk8Jd00iCNHkVm1";

// Commission TaskVoilà : 8%
export const PLATFORM_COMMISSION_RATE = 0.08;

/**
 * Converts a euro amount to cents for Stripe
 */
export function toCents(euros: number): number {
  return Math.round(euros * 100);
}

/**
 * Calculates the total amount including platform commission
 */
export function calculateTotal(
  amount: number,
  insuranceEnabled = false,
): {
  base: number;
  commission: number;
  insurance: number;
  total: number;
} {
  const commission = Math.round(amount * PLATFORM_COMMISSION_RATE);
  const insurance = insuranceEnabled ? Math.round(amount * 0.03) : 0;
  return {
    base: amount,
    commission,
    insurance,
    total: amount + commission + insurance,
  };
}
