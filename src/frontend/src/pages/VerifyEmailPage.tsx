import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

export function VerifyEmailPage() {
  const { lang } = useTranslation();

  const messages: Record<string, { title: string; body: string; btn: string }> =
    {
      fr: {
        title: "Email confirmé !",
        body: "Votre adresse email a bien été confirmée. Vous pouvez maintenant vous connecter à votre compte TaskVoilà.",
        btn: "Se connecter",
      },
      en: {
        title: "Email confirmed!",
        body: "Your email address has been verified. You can now log in to your TaskVoilà account.",
        btn: "Log in",
      },
      de: {
        title: "E-Mail bestätigt!",
        body: "Ihre E-Mail-Adresse wurde erfolgreich bestätigt. Sie können sich jetzt in Ihr TaskVoilà-Konto einloggen.",
        btn: "Einloggen",
      },
      es: {
        title: "¡Email confirmado!",
        body: "Tu dirección de correo electrónico ha sido verificada. Ya puedes iniciar sesión en tu cuenta TaskVoilà.",
        btn: "Iniciar sesión",
      },
      it: {
        title: "Email confermata!",
        body: "Il tuo indirizzo email è stato verificato. Ora puoi accedere al tuo account TaskVoilà.",
        btn: "Accedi",
      },
      pt: {
        title: "Email confirmado!",
        body: "O seu endereço de email foi verificado. Já pode iniciar sessão na sua conta TaskVoilà.",
        btn: "Iniciar sessão",
      },
      nl: {
        title: "E-mail bevestigd!",
        body: "Uw e-mailadres is geverifieerd. U kunt nu inloggen op uw TaskVoilà-account.",
        btn: "Inloggen",
      },
    };

  const msg = messages[lang] ?? messages.en;

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md text-center"
      >
        <div className="bg-white rounded-3xl border border-border/50 shadow-card p-8 md:p-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <CheckCircle2
              className="h-16 w-16"
              style={{ color: "oklch(0.55 0.18 160)" }}
            />
          </motion.div>

          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
            {msg.title}
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {msg.body}
          </p>

          <Button
            asChild
            data-ocid="verify-email.login.button"
            className="h-12 w-full font-bold text-white"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.35 0.15 250), oklch(0.28 0.18 258))",
            }}
          >
            <Link to="/login">{msg.btn}</Link>
          </Button>
        </div>
      </motion.div>
    </main>
  );
}
