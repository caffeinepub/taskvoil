import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useICPLogin } from "@/hooks/useICPLogin";
import { useTranslation } from "@/lib/i18n";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Fingerprint,
  Loader2,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const REG_TEXTS: Record<
  string,
  {
    title: string;
    subtitle: string;
    step: string;
    iiSubtitle: string;
    nfidSubtitle: string;
    plugSubtitle: string;
    decentralized: string;
    alreadyAccount: string;
    signIn: string;
    cancelledError: string;
    terms: string;
    privacy: string;
    gdprMandatory: string;
    gdprMandatoryPrivacy: string;
    gdprMandatoryAnd: string;
    gdprMandatoryTerms: string;
    gdprMarketing: string;
    gdprRequired: string;
  }
> = {
  fr: {
    title: "Créez votre compte",
    subtitle: "Choisissez votre méthode d'inscription sécurisée",
    step: "Étape 1/2 — Authentification ICP",
    iiSubtitle: "Biométrie · Clé d'appareil",
    nfidSubtitle: "Connexion avec Google possible",
    plugSubtitle: "Wallet Web3 · Sans mot de passe",
    decentralized: "Authentification décentralisée sécurisée par ICP",
    alreadyAccount: "Déjà inscrit ?",
    signIn: "Se connecter",
    cancelledError: "Connexion annulée ou échouée",
    terms: "conditions d'utilisation",
    privacy: "En vous inscrivant, vous acceptez nos",
    gdprMandatory: "J'ai lu et j'accepte la",
    gdprMandatoryPrivacy: "Politique de confidentialité",
    gdprMandatoryAnd: "et les",
    gdprMandatoryTerms: "Conditions générales d'utilisation",
    gdprMarketing:
      "J'accepte de recevoir des emails promotionnels et des notifications de TaskVoilà.",
    gdprRequired: "Vous devez accepter les conditions avant de continuer.",
  },
  en: {
    title: "Create your account",
    subtitle: "Choose your secure registration method",
    step: "Step 1/2 — ICP Authentication",
    iiSubtitle: "Biometrics · Device key",
    nfidSubtitle: "Google login available",
    plugSubtitle: "Web3 Wallet · Passwordless",
    decentralized: "Decentralised authentication secured by ICP",
    alreadyAccount: "Already have an account?",
    signIn: "Sign in",
    cancelledError: "Login cancelled or failed",
    terms: "terms of service",
    privacy: "By registering, you agree to our",
    gdprMandatory: "I have read and accept the",
    gdprMandatoryPrivacy: "Privacy Policy",
    gdprMandatoryAnd: "and",
    gdprMandatoryTerms: "Terms and Conditions",
    gdprMarketing:
      "I agree to receive promotional emails and notifications from TaskVoila.",
    gdprRequired: "You must accept the terms to continue.",
  },
  de: {
    title: "Konto erstellen",
    subtitle: "Wählen Sie Ihre sichere Registrierungsmethode",
    step: "Schritt 1/2 — ICP-Authentifizierung",
    iiSubtitle: "Biometrie · Geräteschlüssel",
    nfidSubtitle: "Google-Login verfügbar",
    plugSubtitle: "Web3-Wallet · Ohne Passwort",
    decentralized: "Dezentrale Authentifizierung gesichert durch ICP",
    alreadyAccount: "Bereits registriert?",
    signIn: "Anmelden",
    cancelledError: "Anmeldung abgebrochen oder fehlgeschlagen",
    terms: "Nutzungsbedingungen",
    privacy: "Mit der Registrierung akzeptieren Sie unsere",
    gdprMandatory: "Ich habe die",
    gdprMandatoryPrivacy: "Datenschutzrichtlinie",
    gdprMandatoryAnd: "und die",
    gdprMandatoryTerms: "Allgemeinen Geschäftsbedingungen",
    gdprMarketing:
      "Ich stimme zu, Werbe-E-Mails und Benachrichtigungen von TaskVoila zu erhalten.",
    gdprRequired: "Sie müssen die Bedingungen akzeptieren, um fortzufahren.",
  },
  es: {
    title: "Crea tu cuenta",
    subtitle: "Elige tu método de registro seguro",
    step: "Paso 1/2 — Autenticación ICP",
    iiSubtitle: "Biometría · Clave de dispositivo",
    nfidSubtitle: "Inicio de sesión con Google disponible",
    plugSubtitle: "Cartera Web3 · Sin contraseña",
    decentralized: "Autenticación descentralizada protegida por ICP",
    alreadyAccount: "¿Ya tienes una cuenta?",
    signIn: "Iniciar sesión",
    cancelledError: "Inicio de sesión cancelado o fallido",
    terms: "términos de uso",
    privacy: "Al registrarte, aceptas nuestros",
    gdprMandatory: "He leído y acepto la",
    gdprMandatoryPrivacy: "Política de privacidad",
    gdprMandatoryAnd: "y los",
    gdprMandatoryTerms: "Términos y condiciones",
    gdprMarketing:
      "Acepto recibir correos electrónicos promocionales y notificaciones de TaskVoila.",
    gdprRequired: "Debes aceptar los términos para continuar.",
  },
  it: {
    title: "Crea il tuo account",
    subtitle: "Scegli il tuo metodo di registrazione sicuro",
    step: "Fase 1/2 — Autenticazione ICP",
    iiSubtitle: "Biometria · Chiave dispositivo",
    nfidSubtitle: "Accesso con Google disponibile",
    plugSubtitle: "Portafoglio Web3 · Senza password",
    decentralized: "Autenticazione decentralizzata protetta da ICP",
    alreadyAccount: "Hai già un account?",
    signIn: "Accedi",
    cancelledError: "Accesso annullato o fallito",
    terms: "termini di servizio",
    privacy: "Registrandoti, accetti i nostri",
    gdprMandatory: "Ho letto e accetto l'",
    gdprMandatoryPrivacy: "Informativa sulla privacy",
    gdprMandatoryAnd: "e i",
    gdprMandatoryTerms: "Termini e condizioni",
    gdprMarketing:
      "Accetto di ricevere email promozionali e notifiche da TaskVoila.",
    gdprRequired: "Devi accettare i termini per continuare.",
  },
  pt: {
    title: "Crie a sua conta",
    subtitle: "Escolha o seu método de registo seguro",
    step: "Passo 1/2 — Autenticação ICP",
    iiSubtitle: "Biometria · Chave de dispositivo",
    nfidSubtitle: "Login com Google disponível",
    plugSubtitle: "Carteira Web3 · Sem palavra-passe",
    decentralized: "Autenticação descentralizada protegida pelo ICP",
    alreadyAccount: "Já tem uma conta?",
    signIn: "Iniciar sessão",
    cancelledError: "Login cancelado ou falhado",
    terms: "termos de utilização",
    privacy: "Ao registar-se, aceita os nossos",
    gdprMandatory: "Li e aceito a",
    gdprMandatoryPrivacy: "Política de privacidade",
    gdprMandatoryAnd: "e os",
    gdprMandatoryTerms: "Termos e condições",
    gdprMarketing:
      "Concordo em receber e-mails promocionais e notificações da TaskVoila.",
    gdprRequired: "Deve aceitar os termos para continuar.",
  },
  nl: {
    title: "Account aanmaken",
    subtitle: "Kies uw veilige registratiemethode",
    step: "Stap 1/2 — ICP-authenticatie",
    iiSubtitle: "Biometrie · Apparaatsleutel",
    nfidSubtitle: "Google-login beschikbaar",
    plugSubtitle: "Web3-portemonnee · Zonder wachtwoord",
    decentralized: "Gedecentraliseerde authenticatie beveiligd door ICP",
    alreadyAccount: "Al een account?",
    signIn: "Inloggen",
    cancelledError: "Inloggen geannuleerd of mislukt",
    terms: "gebruiksvoorwaarden",
    privacy: "Door te registreren, gaat u akkoord met onze",
    gdprMandatory: "Ik heb het",
    gdprMandatoryPrivacy: "Privacybeleid",
    gdprMandatoryAnd: "en de",
    gdprMandatoryTerms: "Algemene voorwaarden",
    gdprMarketing:
      "Ik ga akkoord met het ontvangen van promotionele e-mails en meldingen van TaskVoila.",
    gdprRequired: "U moet de voorwaarden accepteren om door te gaan.",
  },
  el: {
    title: "Δημιουργία λογαριασμού",
    subtitle: "Επιλέξτε τη μέθοδο ασφαλούς εγγραφής σας",
    step: "Βήμα 1/2 — Αυθεντικοποίηση ICP",
    iiSubtitle: "Βιομετρία · Κλειδί συσκευής",
    nfidSubtitle: "Διαθέσιμη σύνδεση Google",
    plugSubtitle: "Web3 Πορτοφόλι · Χωρίς κωδικό",
    decentralized: "Αποκεντρωμένη αυθεντικοποίηση ασφαλισμένη από το ICP",
    alreadyAccount: "Έχετε ήδη λογαριασμό;",
    signIn: "Σύνδεση",
    cancelledError: "Σύνδεση ακυρώθηκε ή απέτυχε",
    terms: "όρους χρήσης",
    privacy: "Εγγραφόμενοι, αποδέχεστε τους",
    gdprMandatory: "Έχω διαβάσει και αποδέχομαι την",
    gdprMandatoryPrivacy: "Πολιτική απορρήτου",
    gdprMandatoryAnd: "και τους",
    gdprMandatoryTerms: "Όρους και προϋποθέσεις",
    gdprMarketing:
      "Συμφωνώ να λαμβάνω διαφημιστικά email και ειδοποιήσεις από το TaskVoila.",
    gdprRequired: "Πρέπει να αποδεχτείτε τους όρους για να συνεχίσετε.",
  },
};

export function RegisterPage() {
  const { lang } = useTranslation();
  const reg = REG_TEXTS[lang] ?? REG_TEXTS.en;
  const { handleAuth: icpHandleAuth, loadingProvider } = useICPLogin();
  const navigate = useNavigate();
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [showGdprError, setShowGdprError] = useState(false);

  async function handleAuth(provider: "ii" | "nfid" | "plug") {
    if (!gdprAccepted) {
      setShowGdprError(true);
      return;
    }
    setShowGdprError(false);
    localStorage.setItem(
      "tv_marketing_consent",
      marketingConsent ? "true" : "false",
    );
    await icpHandleAuth(provider);
  }

  return (
    <>
      <main className="min-h-screen auth-bg flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none bg-amber-400"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none bg-amber-300"
          aria-hidden="true"
        />

        <div className="w-full max-w-md relative z-10">
          {/* Back button top-left */}
          <div className="flex justify-start mb-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => void navigate({ to: "/" })}
              data-ocid="register.back.button"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {{
                fr: "Retour",
                en: "Back",
                de: "Zurück",
                es: "Volver",
                nl: "Terug",
                it: "Indietro",
                pt: "Voltar",
                el: "Πίσω",
              }[lang] ?? "Back"}
            </Button>
          </div>
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex flex-col items-center gap-3">
              <img
                src="/assets/generated/logo-proposal-3-squirrel-helmet-clipboard.dim_600x600.png"
                loading="eager"
                alt="TaskVoilà"
                className="w-16 h-16 object-contain drop-shadow-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <span className="font-display font-bold text-3xl text-foreground tracking-tight">
                Task<span className="text-amber-500">Voilà</span>
              </span>
            </Link>
            <h1 className="font-display text-xl font-bold text-foreground mt-5">
              {reg.title}
            </h1>
            <p className="text-muted-foreground mt-1.5 text-sm">
              {reg.subtitle}
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-xl p-6 md:p-8">
            <div className="mb-5 flex items-center gap-2 bg-muted/50 rounded-xl px-4 py-3">
              <div className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                1
              </div>
              <p className="text-xs text-muted-foreground">{reg.step}</p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-1.5 mb-5">
              <div className="bg-amber-500 h-1.5 rounded-full w-1/2 transition-all" />
            </div>

            {/* GDPR Checkboxes */}
            <div className="mb-5 space-y-3 p-4 bg-muted/30 rounded-xl border border-border">
              {/* Mandatory checkbox */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="gdpr-mandatory"
                  data-ocid="register.gdpr.checkbox"
                  checked={gdprAccepted}
                  onCheckedChange={(checked) => {
                    setGdprAccepted(checked === true);
                    if (checked) setShowGdprError(false);
                  }}
                  className={showGdprError ? "border-red-500" : ""}
                />
                <label
                  htmlFor="gdpr-mandatory"
                  className="text-xs text-foreground leading-relaxed cursor-pointer"
                >
                  {reg.gdprMandatory}{" "}
                  <Link
                    to="/privacy"
                    className="text-amber-600 font-medium underline hover:text-amber-700"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {reg.gdprMandatoryPrivacy}
                  </Link>{" "}
                  {reg.gdprMandatoryAnd}{" "}
                  <Link
                    to="/terms"
                    className="text-amber-600 font-medium underline hover:text-amber-700"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {reg.gdprMandatoryTerms}
                  </Link>
                  {"."} <span className="text-red-500 font-bold">*</span>
                </label>
              </div>

              {/* Validation error */}
              {showGdprError && (
                <p
                  data-ocid="register.gdpr.error_state"
                  className="text-xs text-red-500 ml-7"
                >
                  {reg.gdprRequired}
                </p>
              )}

              {/* Optional marketing checkbox */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="gdpr-marketing"
                  data-ocid="register.marketing.checkbox"
                  checked={marketingConsent}
                  onCheckedChange={(checked) =>
                    setMarketingConsent(checked === true)
                  }
                />
                <label
                  htmlFor="gdpr-marketing"
                  className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
                >
                  {reg.gdprMarketing}
                </label>
              </div>
            </div>

            <div className="space-y-3">
              {/* Internet Identity */}
              <Button
                data-ocid="register.internet_identity.button"
                className="w-full h-14 gap-3 justify-start px-5 bg-amber-50 hover:bg-amber-100 border border-amber-200 hover:border-amber-400 text-amber-900 font-semibold transition-all shadow-sm"
                variant="outline"
                onClick={() => void handleAuth("ii")}
                disabled={loadingProvider !== null}
              >
                {loadingProvider === "ii" ? (
                  <Loader2 className="h-5 w-5 animate-spin text-amber-500 shrink-0" />
                ) : (
                  <Fingerprint className="h-5 w-5 text-amber-500 shrink-0" />
                )}
                <div className="flex-1 text-left">
                  <div className="text-sm font-bold text-amber-900">
                    Internet Identity
                  </div>
                  <div className="text-xs text-amber-700 font-normal mt-0.5">
                    {reg.iiSubtitle}
                  </div>
                </div>
                <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
              </Button>

              {/* NFID */}
              <Button
                data-ocid="register.nfid.button"
                className="w-full h-14 gap-3 justify-start px-5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 hover:border-indigo-400 text-indigo-900 font-semibold transition-all shadow-sm"
                variant="outline"
                onClick={() => void handleAuth("nfid")}
                disabled={loadingProvider !== null}
              >
                {loadingProvider === "nfid" ? (
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-500 shrink-0" />
                ) : (
                  <span className="text-xl shrink-0">🔒</span>
                )}
                <div className="flex-1 text-left">
                  <div className="text-sm font-bold text-indigo-900">NFID</div>
                  <div className="text-xs text-indigo-600 font-normal mt-0.5">
                    {reg.nfidSubtitle}
                  </div>
                </div>
              </Button>

              {/* Plug Wallet */}
              <Button
                data-ocid="register.plug_wallet.button"
                className="w-full h-14 gap-3 justify-start px-5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-400 text-emerald-900 font-semibold transition-all shadow-sm"
                variant="outline"
                onClick={() => void handleAuth("plug")}
                disabled={loadingProvider !== null}
              >
                {loadingProvider === "plug" ? (
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-500 shrink-0" />
                ) : (
                  <Wallet className="h-5 w-5 text-emerald-500 shrink-0" />
                )}
                <div className="flex-1 text-left">
                  <div className="text-sm font-bold text-emerald-900">
                    Plug Wallet
                  </div>
                  <div className="text-xs text-emerald-600 font-normal mt-0.5">
                    {reg.plugSubtitle}
                  </div>
                </div>
              </Button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground/60" />
              <p className="text-xs text-muted-foreground/60 text-center">
                {reg.decentralized}
              </p>
            </div>

            <div className="mt-5 pt-5 border-t border-border text-center text-sm text-muted-foreground">
              {reg.alreadyAccount}{" "}
              <Link
                to="/login"
                data-ocid="register.login.link"
                className="font-bold text-amber-600 hover:underline"
              >
                {reg.signIn}
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground/50 mt-4">
            {reg.privacy}{" "}
            <Link
              to="/privacy"
              className="underline hover:text-muted-foreground"
            >
              {reg.terms}
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
