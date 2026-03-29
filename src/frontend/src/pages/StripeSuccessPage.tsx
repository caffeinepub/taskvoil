import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { CheckCircle } from "lucide-react";
import { motion } from "motion/react";

export function StripeSuccessPage() {
  const navigate = useNavigate();
  const { lang } = useTranslation();

  // Read session_id from query params
  let sessionId = "";
  try {
    const params = new URLSearchParams(window.location.search);
    sessionId = params.get("session_id") ?? "";
  } catch (_) {
    // ignore
  }

  const labels: Record<
    string,
    { title: string; subtitle: string; back: string; ref: string }
  > = {
    fr: {
      title: "Paiement confirmé !",
      subtitle:
        "Votre paiement a été traité avec succès. Vous pouvez maintenant accéder à votre mission.",
      back: "Retour au tableau de bord",
      ref: "Référence de paiement",
    },
    en: {
      title: "Payment confirmed!",
      subtitle:
        "Your payment has been processed successfully. You can now access your mission.",
      back: "Back to dashboard",
      ref: "Payment reference",
    },
    de: {
      title: "Zahlung bestätigt!",
      subtitle:
        "Ihre Zahlung wurde erfolgreich verarbeitet. Sie können jetzt auf Ihren Auftrag zugreifen.",
      back: "Zurück zum Dashboard",
      ref: "Zahlungsreferenz",
    },
    es: {
      title: "¡Pago confirmado!",
      subtitle:
        "Su pago ha sido procesado con éxito. Ahora puede acceder a su misión.",
      back: "Volver al panel",
      ref: "Referencia de pago",
    },
    it: {
      title: "Pagamento confermato!",
      subtitle:
        "Il pagamento è stato elaborato con successo. Ora puoi accedere alla tua missione.",
      back: "Torna alla dashboard",
      ref: "Riferimento di pagamento",
    },
    pt: {
      title: "Pagamento confirmado!",
      subtitle:
        "O seu pagamento foi processado com sucesso. Agora pode aceder à sua missão.",
      back: "Voltar ao painel",
      ref: "Referência de pagamento",
    },
    nl: {
      title: "Betaling bevestigd!",
      subtitle:
        "Uw betaling is succesvol verwerkt. U heeft nu toegang tot uw opdracht.",
      back: "Terug naar dashboard",
      ref: "Betalingsreferentie",
    },
    el: {
      title: "Payment confirmed!",
      subtitle: "Your payment has been processed successfully.",
      back: "Back to dashboard",
      ref: "Payment reference",
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
        data-ocid="stripe.success_state"
      >
        <Card className="border-border bg-card shadow-xl">
          <CardContent className="pt-8 pb-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className="w-20 h-20 rounded-full bg-[oklch(0.55_0.18_145)]/15 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-[oklch(0.55_0.18_145)]" />
              </div>
            </motion.div>

            <h1 className="text-2xl font-bold text-foreground mb-3">
              {t.title}
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {t.subtitle}
            </p>

            {sessionId && (
              <div className="bg-muted/50 rounded-lg px-4 py-3 mb-6 text-left">
                <p className="text-xs text-muted-foreground mb-1">{t.ref}</p>
                <p className="text-xs font-mono text-foreground break-all">
                  {sessionId}
                </p>
              </div>
            )}

            <Button
              onClick={() => navigate({ to: "/dashboard/client" })}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              data-ocid="stripe.back_button"
            >
              {t.back}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
