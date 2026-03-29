import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import { useNavigate } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import { motion } from "motion/react";

export function StripeCancelPage() {
  const navigate = useNavigate();
  const { lang } = useTranslation();

  const labels: Record<
    string,
    { title: string; subtitle: string; retry: string; back: string }
  > = {
    fr: {
      title: "Paiement annulé",
      subtitle:
        "Votre paiement a été annulé. Vous pouvez réessayer à tout moment.",
      retry: "Réessayer le paiement",
      back: "Retour au tableau de bord",
    },
    en: {
      title: "Payment cancelled",
      subtitle: "Your payment was cancelled. You can try again at any time.",
      retry: "Try again",
      back: "Back to dashboard",
    },
    de: {
      title: "Zahlung abgebrochen",
      subtitle:
        "Ihre Zahlung wurde abgebrochen. Sie können es jederzeit erneut versuchen.",
      retry: "Erneut versuchen",
      back: "Zurück zum Dashboard",
    },
    es: {
      title: "Pago cancelado",
      subtitle:
        "Su pago fue cancelado. Puede intentarlo de nuevo en cualquier momento.",
      retry: "Intentar de nuevo",
      back: "Volver al panel",
    },
    it: {
      title: "Pagamento annullato",
      subtitle:
        "Il pagamento è stato annullato. Puoi riprovare in qualsiasi momento.",
      retry: "Riprova",
      back: "Torna alla dashboard",
    },
    pt: {
      title: "Pagamento cancelado",
      subtitle:
        "O seu pagamento foi cancelado. Pode tentar novamente a qualquer momento.",
      retry: "Tentar novamente",
      back: "Voltar ao painel",
    },
    nl: {
      title: "Betaling geannuleerd",
      subtitle:
        "Uw betaling is geannuleerd. U kunt het op elk moment opnieuw proberen.",
      retry: "Opnieuw proberen",
      back: "Terug naar dashboard",
    },
    el: {
      title: "Payment cancelled",
      subtitle: "Your payment was cancelled.",
      retry: "Try again",
      back: "Back to dashboard",
    },
  };

  const t = labels[lang] ?? labels.en;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
        data-ocid="stripe.cancel_state"
      >
        <Card className="border-border bg-card shadow-xl">
          <CardContent className="pt-8 pb-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <XCircle className="w-10 h-10 text-muted-foreground" />
              </div>
            </motion.div>

            <h1 className="text-2xl font-bold text-foreground mb-3">
              {t.title}
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {t.subtitle}
            </p>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => navigate({ to: "/" })}
                variant="outline"
                className="w-full"
                data-ocid="stripe.retry_button"
              >
                {t.retry}
              </Button>
              <Button
                onClick={() => navigate({ to: "/dashboard/client" })}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {t.back}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
