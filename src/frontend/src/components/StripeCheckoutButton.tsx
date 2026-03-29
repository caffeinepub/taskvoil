import { Button } from "@/components/ui/button";
import { useActor } from "@/hooks/useActor";
import { calculateTotal, toCents } from "@/lib/stripe-config";
import { CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";

interface StripeCheckoutButtonProps {
  missionId: number;
  amount: number;
  title: string;
  description: string;
  className?: string;
}

export function StripeCheckoutButton({
  missionId: _missionId,
  amount,
  title,
  description,
  className,
}: StripeCheckoutButtonProps) {
  const { actor, isFetching } = useActor();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    if (!actor) return;
    setLoading(true);
    setError(null);

    try {
      const { total } = calculateTotal(amount);
      const amountCents = BigInt(toCents(total));

      const successUrl = `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/payment/cancel`;

      const checkoutUrl = await (actor as any).createStripeCheckout(
        amountCents,
        title,
        description,
        successUrl,
        cancelUrl,
      );

      if (typeof checkoutUrl === "string" && checkoutUrl.startsWith("http")) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error("URL de paiement invalide");
      }
    } catch {
      setError(
        "Une erreur est survenue lors de la création du paiement. Veuillez réessayer.",
      );
    } finally {
      setLoading(false);
    }
  }

  const isDisabled = loading || isFetching || !actor;

  return (
    <div className={className}>
      <Button
        onClick={handlePay}
        disabled={isDisabled}
        className="w-full bg-[oklch(0.55_0.18_145)] hover:bg-[oklch(0.48_0.18_145)] text-white font-semibold py-3 text-base transition-all duration-200"
        data-ocid="stripe.pay_button"
      >
        {loading ? (
          <span
            className="flex items-center gap-2"
            data-ocid="stripe.loading_state"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Traitement en cours...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payer par carte (Stripe)
          </span>
        )}
      </Button>

      {error && (
        <p
          className="mt-2 text-sm text-destructive"
          data-ocid="stripe.error_state"
        >
          {error}
        </p>
      )}
    </div>
  );
}
