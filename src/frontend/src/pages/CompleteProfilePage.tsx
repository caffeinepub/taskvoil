import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActor } from "@/hooks/useActor";
import { useAuthStore } from "@/lib/auth-store";
import { useCountryStore } from "@/lib/country-store";
import { useTranslation } from "@/lib/i18n";
import { Link, useNavigate } from "@tanstack/react-router";
import { Briefcase, CheckCircle, Loader2, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const T = {
  fr: {
    title: "Complétez votre profil",
    subtitle: "Quelques informations pour finaliser votre inscription",
    step: "Étape 2/2 — Votre profil",
    pseudoLabel: "Pseudo (affiché publiquement)",
    pseudoPlaceholder: "Ex\u00a0: BricoBob, JardinierPro…",
    pseudoHint: "Votre vrai nom ne sera jamais affiché publiquement.",
    roleLabel: "Vous êtes :",
    client: "Particulier",
    clientDesc: "Je cherche des services",
    pro: "Professionnel",
    proDesc: "Je propose des services",
    phoneLabel: "Téléphone (facultatif)",
    phonePlaceholder: "+33 6 00 00 00 00",
    cityLabel: "Ville (facultative)",
    cityPlaceholder: "Paris",
    submit: "Créer mon compte",
    loading: "Création en cours…",
    errorPseudo: "Le pseudo est obligatoire.",
    errorPseudoLen: "Le pseudo doit contenir au moins 3 caractères.",
    success: "Profil créé avec succès !",
    privacy:
      "Vos vraies coordonnées sont confidentielles et ne seront partagées qu'avec le professionnel après acceptation du devis.",
  },
  en: {
    title: "Complete your profile",
    subtitle: "A few details to finish your registration",
    step: "Step 2/2 — Your profile",
    pseudoLabel: "Username (displayed publicly)",
    pseudoPlaceholder: "e.g. HandyBob, GardenPro…",
    pseudoHint: "Your real name will never be shown publicly.",
    roleLabel: "You are:",
    client: "Individual",
    clientDesc: "I'm looking for services",
    pro: "Professional",
    proDesc: "I offer services",
    phoneLabel: "Phone (optional)",
    phonePlaceholder: "+44 7700 900000",
    cityLabel: "City (optional)",
    cityPlaceholder: "London",
    submit: "Create my account",
    loading: "Creating…",
    errorPseudo: "Username is required.",
    errorPseudoLen: "Username must be at least 3 characters.",
    success: "Profile created successfully!",
    privacy:
      "Your real contact details are private and will only be shared with a professional after quote acceptance.",
  },
  de: {
    title: "Profil vervollständigen",
    subtitle: "Einige Angaben zum Abschluss Ihrer Registrierung",
    step: "Schritt 2/2 — Ihr Profil",
    pseudoLabel: "Benutzername (öffentlich angezeigt)",
    pseudoPlaceholder: "z.B. HandwerkerBob…",
    pseudoHint: "Ihr echter Name wird nie öffentlich angezeigt.",
    roleLabel: "Sie sind:",
    client: "Privatperson",
    clientDesc: "Ich suche Dienstleistungen",
    pro: "Profi",
    proDesc: "Ich biete Dienstleistungen an",
    phoneLabel: "Telefon (optional)",
    phonePlaceholder: "+49 30 000000",
    cityLabel: "Stadt (optional)",
    cityPlaceholder: "Berlin",
    submit: "Konto erstellen",
    loading: "Wird erstellt…",
    errorPseudo: "Benutzername ist erforderlich.",
    errorPseudoLen: "Mindestens 3 Zeichen erforderlich.",
    success: "Profil erfolgreich erstellt!",
    privacy: "Ihre echten Kontaktdaten sind privat.",
  },
  es: {
    title: "Completa tu perfil",
    subtitle: "Algunos datos para finalizar tu registro",
    step: "Paso 2/2 — Tu perfil",
    pseudoLabel: "Apodo (visible públicamente)",
    pseudoPlaceholder: "Ej: BricoJuan…",
    pseudoHint: "Tu nombre real nunca se mostrará públicamente.",
    roleLabel: "Eres:",
    client: "Particular",
    clientDesc: "Busco servicios",
    pro: "Profesional",
    proDesc: "Ofrezco servicios",
    phoneLabel: "Teléfono (opcional)",
    phonePlaceholder: "+34 600 000 000",
    cityLabel: "Ciudad (opcional)",
    cityPlaceholder: "Madrid",
    submit: "Crear mi cuenta",
    loading: "Creando…",
    errorPseudo: "El apodo es obligatorio.",
    errorPseudoLen: "Mínimo 3 caracteres.",
    success: "¡Perfil creado con éxito!",
    privacy: "Tus datos reales son confidenciales.",
  },
  it: {
    title: "Completa il tuo profilo",
    subtitle: "Alcuni dettagli per completare la registrazione",
    step: "Passo 2/2 — Il tuo profilo",
    pseudoLabel: "Pseudonimo (visibile pubblicamente)",
    pseudoPlaceholder: "Es: BricoLuca…",
    pseudoHint: "Il tuo vero nome non sarà mai mostrato pubblicamente.",
    roleLabel: "Sei:",
    client: "Privato",
    clientDesc: "Cerco servizi",
    pro: "Professionista",
    proDesc: "Offro servizi",
    phoneLabel: "Telefono (facoltativo)",
    phonePlaceholder: "+39 320 000 0000",
    cityLabel: "Città (facoltativa)",
    cityPlaceholder: "Roma",
    submit: "Crea il mio account",
    loading: "Creazione in corso…",
    errorPseudo: "Il pseudonimo è obbligatorio.",
    errorPseudoLen: "Minimo 3 caratteri.",
    success: "Profilo creato con successo!",
    privacy: "I tuoi dati reali sono riservati.",
  },
  pt: {
    title: "Complete o seu perfil",
    subtitle: "Alguns dados para finalizar o seu registo",
    step: "Passo 2/2 — O seu perfil",
    pseudoLabel: "Pseudónimo (exibido publicamente)",
    pseudoPlaceholder: "Ex: BricoJoão…",
    pseudoHint: "O seu nome real nunca será exibido publicamente.",
    roleLabel: "É:",
    client: "Particular",
    clientDesc: "Procuro serviços",
    pro: "Profissional",
    proDesc: "Ofereço serviços",
    phoneLabel: "Telefone (opcional)",
    phonePlaceholder: "+351 910 000 000",
    cityLabel: "Cidade (opcional)",
    cityPlaceholder: "Lisboa",
    submit: "Criar a minha conta",
    loading: "A criar…",
    errorPseudo: "O pseudónimo é obrigatório.",
    errorPseudoLen: "Mínimo 3 caracteres.",
    success: "Perfil criado com sucesso!",
    privacy: "Os seus dados reais são confidenciais.",
  },
  nl: {
    title: "Voltooi uw profiel",
    subtitle: "Enkele gegevens om uw registratie te voltooien",
    step: "Stap 2/2 — Uw profiel",
    pseudoLabel: "Gebruikersnaam (openbaar zichtbaar)",
    pseudoPlaceholder: "Bijv. KlusserJan…",
    pseudoHint: "Uw echte naam wordt nooit openbaar weergegeven.",
    roleLabel: "U bent:",
    client: "Particulier",
    clientDesc: "Ik zoek diensten",
    pro: "Professional",
    proDesc: "Ik bied diensten aan",
    phoneLabel: "Telefoon (optioneel)",
    phonePlaceholder: "+31 6 00000000",
    cityLabel: "Stad (optioneel)",
    cityPlaceholder: "Amsterdam",
    submit: "Account aanmaken",
    loading: "Aanmaken…",
    errorPseudo: "Gebruikersnaam is verplicht.",
    errorPseudoLen: "Minimaal 3 tekens vereist.",
    success: "Profiel succesvol aangemaakt!",
    privacy: "Uw echte contactgegevens zijn privé.",
  },
  el: {
    title: "Ολοκλήρωση προφίλ",
    subtitle: "Μερικές πληροφορίες για να ολοκληρώσετε την εγγραφή σας",
    step: "Βήμα 2/2 — Το προφίλ σας",
    pseudoLabel: "Ψευδώνυμο (εμφανίζεται δημόσια)",
    pseudoPlaceholder: "π.χ. ΤεχνικόςΒοβ…",
    pseudoHint: "Το πραγματικό σας όνομα δεν θα εμφανιστεί ποτέ δημόσια.",
    roleLabel: "Είστε:",
    client: "Ιδιώτης",
    clientDesc: "Ψάχνω υπηρεσίες",
    pro: "Επαγγελματίας",
    proDesc: "Προσφέρω υπηρεσίες",
    phoneLabel: "Τηλέφωνο (προαιρετικό)",
    phonePlaceholder: "+30 210 0000000",
    cityLabel: "Πόλη (προαιρετική)",
    cityPlaceholder: "Αθήνα",
    submit: "Δημιουργία λογαριασμού",
    loading: "Δημιουργία…",
    errorPseudo: "Το ψευδώνυμο είναι υποχρεωτικό.",
    errorPseudoLen: "Ελάχιστοι 3 χαρακτήρες.",
    success: "Το προφίλ δημιουργήθηκε με επιτυχία!",
    privacy: "Τα πραγματικά σας στοιχεία επικοινωνίας είναι εμπιστευτικά.",
  },
  ie: {
    title: "Complete your profile",
    subtitle: "A few details to finish your registration",
    step: "Step 2/2 — Your profile",
    pseudoLabel: "Username (displayed publicly)",
    pseudoPlaceholder: "e.g. HandyPat, GardenPro…",
    pseudoHint: "Your real name will never be shown publicly.",
    roleLabel: "You are:",
    client: "Individual",
    clientDesc: "I'm looking for services",
    pro: "Professional",
    proDesc: "I offer services",
    phoneLabel: "Phone (optional)",
    phonePlaceholder: "+353 85 000 0000",
    cityLabel: "City (optional)",
    cityPlaceholder: "Dublin",
    submit: "Create my account",
    loading: "Creating…",
    errorPseudo: "Username is required.",
    errorPseudoLen: "Username must be at least 3 characters.",
    success: "Profile created successfully!",
    privacy:
      "Your real contact details are private and will only be shared with a professional after quote acceptance.",
  },
} as const;

type Lang = keyof typeof T;

export function CompleteProfilePage() {
  const { lang } = useTranslation();
  const { loginUser } = useAuthStore();
  const { selectedCountry, selectedLang } = useCountryStore();
  const { actor } = useActor();
  const navigate = useNavigate();

  const t = T[(lang as Lang) in T ? (lang as Lang) : "en"];

  const [pseudo, setPseudo] = useState("");
  const [role, setRole] = useState<"client" | "pro">("client");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [pseudoError, setPseudoError] = useState("");

  function validatePseudo(value: string): string {
    if (!value.trim()) return t.errorPseudo;
    if (value.trim().length < 3) return t.errorPseudoLen;
    return "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validatePseudo(pseudo);
    if (err) {
      setPseudoError(err);
      return;
    }
    setPseudoError("");
    setLoading(true);
    try {
      const country = selectedCountry ?? "FR";
      const language = selectedLang ?? "fr";
      let userId = 0;
      // Try to register via ICP principal using the actor
      if (actor) {
        try {
          const result = await (actor as any).register(
            role === "pro" ? { pro: null } : { client: null },
            "",
            role === "client" ? firstName.trim() : pseudo.trim(),
            role === "client" ? lastName.trim() : "",
            country,
            language,
          );
          userId = Number(result?.id ?? 0);
        } catch {
          // If register fails, proceed with local session
        }
      }

      const isClient = role === "client";
      const user = {
        id: userId,
        email: "",
        firstName:
          (isClient ? firstName.trim() : pseudo.trim()) || pseudo.trim(),
        lastName: isClient ? lastName.trim() : "",
        pseudo: pseudo.trim(),
        phone: phone.trim(),
        city: city.trim(),
        role: role as "client" | "pro",
        country,
        language,
        createdAt: Date.now(),
        status: "active",
        emailVerified: true,
        approvalStatus: isClient
          ? ("approved" as const)
          : ("pending_approval" as const),
        icpPrincipal:
          localStorage.getItem("taskvoila_pending_principal") ?? "icp",
        profileComplete: isClient
          ? !!(
              pseudo.trim() &&
              firstName.trim() &&
              lastName.trim() &&
              phone.trim() &&
              city.trim()
            )
          : false, // pro needs DAC7 to be complete
      };
      loginUser(user);
      // Notify admin about new pro registration

      toast.success(t.success);
      const dest = role === "pro" ? "/dashboard/pro" : "/dashboard/client";
      void navigate({ to: dest });
    } catch {
      toast.error(t.errorPseudo ?? "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
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
            {t.title}
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">{t.subtitle}</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-xl p-6 md:p-8">
          {/* Step indicator */}
          <div className="mb-6 flex items-center gap-2 bg-muted/50 rounded-xl px-4 py-3">
            <div className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
              2
            </div>
            <p className="text-xs text-muted-foreground">{t.step}</p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-1.5 mb-6">
            <div className="bg-amber-500 h-1.5 rounded-full w-full transition-all" />
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
            {/* Pseudo */}
            <div className="space-y-1.5">
              <Label htmlFor="pseudo" className="text-sm font-semibold">
                {t.pseudoLabel} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pseudo"
                value={pseudo}
                onChange={(e) => {
                  setPseudo(e.target.value);
                  setPseudoError(validatePseudo(e.target.value));
                }}
                placeholder={t.pseudoPlaceholder}
                className={`h-11 ${
                  pseudoError ? "border-red-400 focus-visible:ring-red-400" : ""
                }`}
                maxLength={30}
                autoComplete="username"
              />
              {pseudoError ? (
                <p className="text-xs text-red-500">{pseudoError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">{t.pseudoHint}</p>
              )}
            </div>

            {/* Role toggle */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{t.roleLabel}</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("client")}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    role === "client"
                      ? "border-amber-500 bg-amber-50"
                      : "border-border bg-card hover:border-amber-200"
                  }`}
                >
                  <User
                    className={`h-6 w-6 ${
                      role === "client"
                        ? "text-amber-600"
                        : "text-muted-foreground"
                    }`}
                  />
                  <div className="text-center">
                    <p
                      className={`text-sm font-bold ${
                        role === "client" ? "text-amber-700" : "text-foreground"
                      }`}
                    >
                      {t.client}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t.clientDesc}
                    </p>
                  </div>
                  {role === "client" && (
                    <CheckCircle className="h-4 w-4 text-amber-500" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setRole("pro")}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    role === "pro"
                      ? "border-amber-500 bg-amber-50"
                      : "border-border bg-card hover:border-amber-200"
                  }`}
                >
                  <Briefcase
                    className={`h-6 w-6 ${
                      role === "pro"
                        ? "text-amber-600"
                        : "text-muted-foreground"
                    }`}
                  />
                  <div className="text-center">
                    <p
                      className={`text-sm font-bold ${
                        role === "pro" ? "text-amber-700" : "text-foreground"
                      }`}
                    >
                      {t.pro}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t.proDesc}
                    </p>
                  </div>
                  {role === "pro" && (
                    <CheckCircle className="h-4 w-4 text-amber-500" />
                  )}
                </button>
              </div>
            </div>

            {/* First name + Last name (client only) */}
            {role === "client" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-sm font-semibold">
                    {lang === "fr"
                      ? "Prénom"
                      : lang === "de"
                        ? "Vorname"
                        : lang === "es"
                          ? "Nombre"
                          : lang === "it"
                            ? "Nome"
                            : lang === "pt"
                              ? "Nome"
                              : lang === "nl"
                                ? "Voornaam"
                                : "First name"}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder=""
                    className="h-11"
                    autoComplete="given-name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-sm font-semibold">
                    {lang === "fr"
                      ? "Nom"
                      : lang === "de"
                        ? "Nachname"
                        : lang === "es"
                          ? "Apellido"
                          : lang === "it"
                            ? "Cognome"
                            : lang === "pt"
                              ? "Apelido"
                              : lang === "nl"
                                ? "Achternaam"
                                : "Last name"}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder=""
                    className="h-11"
                    autoComplete="family-name"
                  />
                </div>
              </div>
            )}

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-semibold">
                {t.phoneLabel}
                {role === "client" && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.phonePlaceholder}
                className="h-11"
                autoComplete="tel"
              />
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-sm font-semibold">
                {t.cityLabel}
                {role === "client" && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t.cityPlaceholder}
                className="h-11"
                autoComplete="address-level2"
              />
            </div>

            {/* Privacy notice */}
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3">
              <CheckCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">{t.privacy}</p>
            </div>

            {/* DAC7 note for pros */}
            {role === "pro" && (
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3">
                <span className="text-blue-600 text-sm">🛡️</span>
                <p className="text-xs text-blue-800">
                  {lang === "fr"
                    ? "En tant que professionnel, vous devrez compléter vos informations fiscales (DAC7) dans votre profil avant de pouvoir répondre aux demandes."
                    : lang === "de"
                      ? "Als Profi müssen Sie Ihre Steuerinformationen (DAC7) in Ihrem Profil ausfüllen, bevor Sie auf Anfragen antworten können."
                      : lang === "es"
                        ? "Como profesional, deberá completar su información fiscal (DAC7) en su perfil antes de poder responder a solicitudes."
                        : lang === "it"
                          ? "Come professionista, dovrà completare le sue informazioni fiscali (DAC7) nel suo profilo prima di poter rispondere alle richieste."
                          : lang === "pt"
                            ? "Como profissional, terá de preencher as suas informações fiscais (DAC7) no seu perfil antes de poder responder a pedidos."
                            : lang === "nl"
                              ? "Als professional moet u uw fiscale informatie (DAC7) in uw profiel invullen voordat u op aanvragen kunt reageren."
                              : "As a professional, you will need to complete your tax information (DAC7) in your profile before you can respond to requests."}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-bold text-base rounded-xl shadow-md"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  {t.loading}
                </>
              ) : (
                t.submit
              )}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
