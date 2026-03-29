import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useAuthStore } from "@/lib/auth-store";
import { useTranslation } from "@/lib/i18n";
import {
  PLAN_DETAILS,
  type SubscriptionPlan,
  useSubscriptionStore,
} from "@/lib/subscription-store";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Crown, Shield, Sparkles, Zap } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

const SUB_L: Record<
  string,
  {
    prosOnly: string;
    prosOnlyDesc: string;
    backHome: string;
    badge: string;
    headline: string;
    subheadline: string;
    popular: string;
    currentPlan: string;
    free: string;
    mo: string;
    currentPlanBtn: string;
    downgrade: string;
    choosePlan: string;
    vatNote: string;
    planActivated: (label: string) => string;
    planSolo: string;
    planTeam: string;
    planEnterprise: string;
    descSolo: string;
    descTeam: string;
    descEnterprise: string;
    features: Record<"solo" | "team" | "enterprise", string[]>;
  }
> = {
  fr: {
    prosOnly: "Réservé aux professionnels",
    prosOnlyDesc:
      "Les abonnements sont disponibles uniquement pour les profils professionnels.",
    backHome: "Retour à l'accueil",
    badge: "Abonnements Pro",
    headline: "Boostez votre activité",
    subheadline:
      "Choisissez le plan adapté à votre activité. Changez ou annulez à tout moment.",
    popular: "Populaire",
    currentPlan: "Votre plan actuel",
    free: "Gratuit",
    mo: "/mois",
    currentPlanBtn: "Plan actuel",
    downgrade: "Rétrograder",
    choosePlan: "Choisir ce plan",
    vatNote:
      "Tous les prix sont TTC. Annulation possible à tout moment sans frais.",
    planActivated: (label: string) => `Plan ${label} activé avec succès !`,
    planSolo: "Indépendant",
    planTeam: "Pro Équipe",
    planEnterprise: "Grand Groupe",
    descSolo: "Pour démarrer gratuitement",
    descTeam: "Pour les entreprises avec employés",
    descEnterprise: "Pour les franchises et grandes entreprises",
    features: {
      solo: ["Profil de base", "Répondre aux missions", "Messagerie on-chain"],
      team: [
        "Tout du plan Solo",
        "Jusqu'à 10 employés",
        "Calendrier partagé équipe",
        "Assistant IA (19€/mois inclus)",
        "Badge vérifié Pro Équipe",
        "Carrousel homepage",
        "Statistiques avancées",
      ],
      enterprise: [
        "Tout du plan Pro Équipe",
        "Agences multiples",
        "Branding complet (logo, couleurs)",
        "Stats globales + par agence",
        "Account manager dédié",
        "API partenaires (bientôt)",
        "Priorité dans les résultats",
      ],
    },
  },
  en: {
    prosOnly: "For professionals only",
    prosOnlyDesc: "Subscriptions are only available for professional profiles.",
    backHome: "Back to home",
    badge: "Pro Subscriptions",
    headline: "Boost your business",
    subheadline:
      "Choose the plan that fits your business. Change or cancel anytime.",
    popular: "Popular",
    currentPlan: "Your plan",
    free: "Free",
    mo: "/mo",
    currentPlanBtn: "Current plan",
    downgrade: "Downgrade",
    choosePlan: "Choose this plan",
    vatNote: "All prices include VAT. Cancel anytime at no charge.",
    planActivated: (label: string) => `${label} plan activated successfully!`,
    planSolo: "Solo",
    planTeam: "Pro Team",
    planEnterprise: "Enterprise",
    descSolo: "Start for free",
    descTeam: "For companies with employees",
    descEnterprise: "For franchises and large companies",
    features: {
      solo: ["Basic profile", "Reply to tasks", "On-chain messaging"],
      team: [
        "Everything in Solo",
        "Up to 10 employees",
        "Shared team calendar",
        "AI Assistant (included)",
        "Pro Team verified badge",
        "Homepage carousel",
        "Advanced statistics",
      ],
      enterprise: [
        "Everything in Pro Team",
        "Multiple agencies",
        "Full branding",
        "Global + per-agency stats",
        "Dedicated account manager",
        "Partner API (soon)",
        "Priority in search results",
      ],
    },
  },
  de: {
    prosOnly: "Nur für Fachleute",
    prosOnlyDesc: "Abonnements sind nur für professionelle Profile verfügbar.",
    backHome: "Zurück zur Startseite",
    badge: "Pro-Abonnements",
    headline: "Stärken Sie Ihr Geschäft",
    subheadline:
      "Wählen Sie den passenden Plan. Jederzeit ändern oder kündigen.",
    popular: "Beliebt",
    currentPlan: "Ihr aktueller Plan",
    free: "Kostenlos",
    mo: "/Monat",
    currentPlanBtn: "Aktueller Plan",
    downgrade: "Downgrade",
    choosePlan: "Plan wählen",
    vatNote: "Alle Preise inkl. MwSt. Jederzeit ohne Gebühren kündigen.",
    planActivated: (label: string) => `Plan ${label} erfolgreich aktiviert!`,
    planSolo: "Solo",
    planTeam: "Pro Team",
    planEnterprise: "Enterprise",
    descSolo: "Kostenlos starten",
    descTeam: "Für Unternehmen mit Mitarbeitern",
    descEnterprise: "Für Franchises und große Unternehmen",
    features: {
      solo: ["Basisprofil", "Auf Aufgaben antworten", "On-Chain-Messaging"],
      team: [
        "Alles aus Solo",
        "Bis zu 10 Mitarbeiter",
        "Geteilter Teamkalender",
        "KI-Assistent (inklusive)",
        "Verifiziertes Pro-Team-Badge",
        "Homepage-Karussell",
        "Erweiterte Statistiken",
      ],
      enterprise: [
        "Alles aus Pro Team",
        "Mehrere Filialen",
        "Vollständiges Branding",
        "Globale + filialspezifische Stats",
        "Dedizierter Account-Manager",
        "Partner-API (bald)",
        "Priorität in Suchergebnissen",
      ],
    },
  },
  es: {
    prosOnly: "Solo para profesionales",
    prosOnlyDesc:
      "Las suscripciones solo están disponibles para perfiles profesionales.",
    backHome: "Volver al inicio",
    badge: "Suscripciones Pro",
    headline: "Impulsa tu actividad",
    subheadline:
      "Elige el plan que mejor se adapte. Cambia o cancela en cualquier momento.",
    popular: "Popular",
    currentPlan: "Tu plan actual",
    free: "Gratis",
    mo: "/mes",
    currentPlanBtn: "Plan actual",
    downgrade: "Cambiar a inferior",
    choosePlan: "Elegir este plan",
    vatNote:
      "Todos los precios incluyen IVA. Cancela en cualquier momento sin cargo.",
    planActivated: (label: string) => `¡Plan ${label} activado con éxito!`,
    planSolo: "Solo",
    planTeam: "Pro Team",
    planEnterprise: "Enterprise",
    descSolo: "Empieza gratis",
    descTeam: "Para empresas con empleados",
    descEnterprise: "Para franquicias y grandes empresas",
    features: {
      solo: ["Perfil básico", "Responder a tareas", "Mensajería on-chain"],
      team: [
        "Todo de Solo",
        "Hasta 10 empleados",
        "Calendario compartido",
        "Asistente IA (incluido)",
        "Badge verificado Pro Team",
        "Carrusel homepage",
        "Estadísticas avanzadas",
      ],
      enterprise: [
        "Todo de Pro Team",
        "Múltiples agencias",
        "Branding completo",
        "Stats globales + por agencia",
        "Account manager dedicado",
        "API socios (pronto)",
        "Prioridad en resultados",
      ],
    },
  },
  it: {
    prosOnly: "Solo per professionisti",
    prosOnlyDesc:
      "Gli abbonamenti sono disponibili solo per profili professionali.",
    backHome: "Torna alla home",
    badge: "Abbonamenti Pro",
    headline: "Potenzia la tua attività",
    subheadline:
      "Scegli il piano adatto. Modifica o annulla in qualsiasi momento.",
    popular: "Popolare",
    currentPlan: "Il tuo piano attuale",
    free: "Gratuito",
    mo: "/mese",
    currentPlanBtn: "Piano attuale",
    downgrade: "Downgrade",
    choosePlan: "Scegli questo piano",
    vatNote: "Tutti i prezzi includono IVA. Annulla in qualsiasi momento.",
    planActivated: (label: string) => `Piano ${label} attivato con successo!`,
    planSolo: "Solo",
    planTeam: "Pro Team",
    planEnterprise: "Enterprise",
    descSolo: "Inizia gratuitamente",
    descTeam: "Per aziende con dipendenti",
    descEnterprise: "Per franchising e grandi aziende",
    features: {
      solo: [
        "Profilo base",
        "Rispondere agli incarichi",
        "Messaggistica on-chain",
      ],
      team: [
        "Tutto di Solo",
        "Fino a 10 dipendenti",
        "Calendario condiviso",
        "Assistente IA (incluso)",
        "Badge verificato Pro Team",
        "Carosello homepage",
        "Statistiche avanzate",
      ],
      enterprise: [
        "Tutto di Pro Team",
        "Agenzie multiple",
        "Branding completo",
        "Stats globali + per agenzia",
        "Account manager dedicato",
        "API partner (presto)",
        "Priorità nei risultati",
      ],
    },
  },
  pt: {
    prosOnly: "Apenas para profissionais",
    prosOnlyDesc:
      "As subscrições estão disponíveis apenas para perfis profissionais.",
    backHome: "Voltar ao início",
    badge: "Subscrições Pro",
    headline: "Impulsiona o teu negócio",
    subheadline:
      "Escolhe o plano adequado. Muda ou cancela a qualquer momento.",
    popular: "Popular",
    currentPlan: "O teu plano atual",
    free: "Gratuito",
    mo: "/mês",
    currentPlanBtn: "Plano atual",
    downgrade: "Downgrade",
    choosePlan: "Escolher este plano",
    vatNote: "Todos os preços incluem IVA. Cancela a qualquer momento.",
    planActivated: (label: string) => `Plano ${label} ativado com sucesso!`,
    planSolo: "Solo",
    planTeam: "Pro Team",
    planEnterprise: "Enterprise",
    descSolo: "Começa gratuitamente",
    descTeam: "Para empresas com funcionários",
    descEnterprise: "Para franquias e grandes empresas",
    features: {
      solo: ["Perfil básico", "Responder a tarefas", "Mensagens on-chain"],
      team: [
        "Tudo do Solo",
        "Até 10 funcionários",
        "Calendário partilhado",
        "Assistente IA (incluído)",
        "Badge verificado Pro Team",
        "Carrossel homepage",
        "Estatísticas avançadas",
      ],
      enterprise: [
        "Tudo do Pro Team",
        "Agências múltiplas",
        "Branding completo",
        "Stats globais + por agência",
        "Account manager dedicado",
        "API parceiros (em breve)",
        "Prioridade nos resultados",
      ],
    },
  },
  nl: {
    prosOnly: "Alleen voor professionals",
    prosOnlyDesc:
      "Abonnementen zijn alleen beschikbaar voor professionele profielen.",
    backHome: "Terug naar home",
    badge: "Pro Abonnementen",
    headline: "Versterk uw bedrijf",
    subheadline:
      "Kies het plan dat bij uw bedrijf past. Wijzig of annuleer op elk moment.",
    popular: "Populair",
    currentPlan: "Uw huidige plan",
    free: "Gratis",
    mo: "/maand",
    currentPlanBtn: "Huidig plan",
    downgrade: "Downgrade",
    choosePlan: "Kies dit plan",
    vatNote: "Alle prijzen zijn inclusief btw. Annuleer op elk moment.",
    planActivated: (label: string) => `Plan ${label} succesvol geactiveerd!`,
    planSolo: "Solo",
    planTeam: "Pro Team",
    planEnterprise: "Enterprise",
    descSolo: "Gratis beginnen",
    descTeam: "Voor bedrijven met medewerkers",
    descEnterprise: "Voor franchises en grote bedrijven",
    features: {
      solo: ["Basisprofiel", "Reageren op taken", "On-chain berichten"],
      team: [
        "Alles van Solo",
        "Tot 10 medewerkers",
        "Gedeelde teamagenda",
        "AI-assistent (inbegrepen)",
        "Geverifieerde Pro Team badge",
        "Homepage carrousel",
        "Geavanceerde statistieken",
      ],
      enterprise: [
        "Alles van Pro Team",
        "Meerdere vestigingen",
        "Volledig branding",
        "Globale + vestigingsstatistieken",
        "Toegewezen accountmanager",
        "Partner API (binnenkort)",
        "Prioriteit in zoekresultaten",
      ],
    },
  },
  el: {
    prosOnly: "Μόνο για επαγγελματίες",
    prosOnlyDesc:
      "Οι συνδρομές είναι διαθέσιμες μόνο για επαγγελματικά προφίλ.",
    backHome: "Επιστροφή στην αρχική",
    badge: "Επαγγελματικές Συνδρομές",
    headline: "Ενισχύστε την επιχείρησή σας",
    subheadline: "Επιλέξτε το κατάλληλο πλάνο. Αλλάξτε ή ακυρώστε οποτεδήποτε.",
    popular: "Δημοφιλές",
    currentPlan: "Το τρέχον πλάνο σας",
    free: "Δωρεάν",
    mo: "/μήνα",
    currentPlanBtn: "Τρέχον πλάνο",
    downgrade: "Υποβάθμιση",
    choosePlan: "Επιλογή πλάνου",
    vatNote: "Όλες οι τιμές περιλαμβάνουν ΦΠΑ. Ακύρωση οποτεδήποτε.",
    planActivated: (label: string) => `Το πλάνο ${label} ενεργοποιήθηκε!`,
    planSolo: "Solo",
    planTeam: "Pro Team",
    planEnterprise: "Enterprise",
    descSolo: "Ξεκινήστε δωρεάν",
    descTeam: "Για εταιρείες με εργαζόμενους",
    descEnterprise: "Για franchising και μεγάλες εταιρείες",
    features: {
      solo: ["Βασικό προφίλ", "Απάντηση σε αποστολές", "On-chain μηνύματα"],
      team: [
        "Όλα του Solo",
        "Έως 10 εργαζόμενοι",
        "Κοινό ημερολόγιο",
        "AI Βοηθός (συμπεριλαμβάνεται)",
        "Verified Pro Team badge",
        "Καρουσέλ homepage",
        "Προηγμένα στατιστικά",
      ],
      enterprise: [
        "Όλα του Pro Team",
        "Πολλαπλά υποκαταστήματα",
        "Πλήρες branding",
        "Στατιστικά ανά υποκατάστημα",
        "Αφιερωμένος account manager",
        "Partner API (σύντομα)",
        "Προτεραιότητα στα αποτελέσματα",
      ],
    },
  },
  lu: {
    prosOnly: "Réservé aux professionnels",
    prosOnlyDesc:
      "Les abonnements sont disponibles uniquement pour les profils professionnels.",
    backHome: "Retour à l'accueil",
    badge: "Abonnements Pro",
    headline: "Boostez votre activité",
    subheadline:
      "Choisissez le plan adapté à votre activité. Changez ou annulez à tout moment.",
    popular: "Populaire",
    currentPlan: "Votre plan actuel",
    free: "Gratuit",
    mo: "/mois",
    currentPlanBtn: "Plan actuel",
    downgrade: "Rétrograder",
    choosePlan: "Choisir ce plan",
    vatNote:
      "Tous les prix sont TTC. Annulation possible à tout moment sans frais.",
    planActivated: (label: string) => `Plan ${label} activé avec succès !`,
    planSolo: "Indépendant",
    planTeam: "Pro Équipe",
    planEnterprise: "Grand Groupe",
    descSolo: "Pour démarrer gratuitement",
    descTeam: "Pour les entreprises avec employés",
    descEnterprise: "Pour les franchises et grandes entreprises",
    features: {
      solo: ["Profil de base", "Répondre aux missions", "Messagerie on-chain"],
      team: [
        "Tout du plan Solo",
        "Jusqu'à 10 employés",
        "Calendrier partagé équipe",
        "Assistant IA (19€/mois inclus)",
        "Badge vérifié Pro Équipe",
        "Carrousel homepage",
        "Statistiques avancées",
      ],
      enterprise: [
        "Tout du plan Pro Équipe",
        "Agences multiples",
        "Branding complet (logo, couleurs)",
        "Stats globales + par agence",
        "Account manager dédié",
        "API partenaires (bientôt)",
        "Priorité dans les résultats",
      ],
    },
  },
};

const planOrder: SubscriptionPlan[] = ["solo", "team", "enterprise"];

const planIcons: Record<SubscriptionPlan, React.ElementType> = {
  solo: Zap,
  team: Shield,
  enterprise: Crown,
};

const planGradients: Record<SubscriptionPlan, string> = {
  solo: "from-slate-100 to-slate-50",
  team: "from-blue-50 to-primary/5",
  enterprise: "from-purple-50 to-violet-50",
};

const planBorderColors: Record<SubscriptionPlan, string> = {
  solo: "border-border",
  team: "border-primary/30",
  enterprise: "border-purple-300",
};

const planBadgeColors: Record<SubscriptionPlan, string> = {
  solo: "bg-slate-100 text-slate-700 border-slate-200",
  team: "bg-blue-100 text-blue-700 border-blue-200",
  enterprise: "bg-purple-100 text-purple-700 border-purple-200",
};

export function SubscriptionPage() {
  const { t, lang } = useTranslation();
  const sl = SUB_L[lang] ?? SUB_L.en;
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();
  const { getMySubscription, upgradePlan } = useSubscriptionStore();

  // Only pros can see this page
  if (!currentUser || currentUser.role !== "pro") {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-7 w-7 text-muted-foreground/50" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground mb-2">
            {sl.prosOnly}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            {sl.prosOnlyDesc}
          </p>
          <Button
            variant="outline"
            onClick={() => void navigate({ to: "/" })}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {sl.backHome}
          </Button>
        </div>
      </main>
    );
  }

  const mySub = getMySubscription(currentUser ? String(currentUser.id) : "");
  const currentPlan: SubscriptionPlan = mySub?.plan ?? "solo";

  function handleUpgrade(plan: SubscriptionPlan) {
    if (plan === currentPlan) return;
    upgradePlan(currentUser ? String(currentUser.id) : "", plan);
    const planNames: Record<string, string> = {
      solo: sl.planSolo,
      team: sl.planTeam,
      enterprise: sl.planEnterprise,
    };
    const label = planNames[plan] ?? plan;
    toast.success(sl.planActivated(label));
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div
        className="py-12"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.55 0.18 160) 0%, oklch(0.35 0.15 250) 100%)",
        }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10 mb-4 gap-2"
              onClick={() =>
                void navigate({
                  to:
                    currentUser?.role === "client"
                      ? "/dashboard/client"
                      : "/dashboard/pro",
                })
              }
              data-ocid="subscription.back.button"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.common.back}
            </Button>
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="h-6 w-6 text-white" />
              <Badge className="bg-white/20 text-white border-white/30 text-xs font-semibold">
                {sl.badge}
              </Badge>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
              {sl.headline}
            </h1>
            <p className="text-white/70 text-base max-w-xl">{sl.subheadline}</p>
          </motion.div>
        </div>
      </div>

      {/* Plans */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {planOrder.map((plan, i) => {
            const details = PLAN_DETAILS[plan];
            const isCurrentPlan = plan === currentPlan;
            const isPopular = plan === "team";
            const PlanIcon = planIcons[plan];
            const price = details.price;

            return (
              <motion.div
                key={plan}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className={`relative rounded-2xl border-2 p-6 bg-gradient-to-b ${planGradients[plan]} ${planBorderColors[plan]} ${
                  isPopular
                    ? "shadow-xl shadow-primary/15 scale-[1.02]"
                    : "shadow-md"
                } transition-all duration-300`}
                data-ocid={`subscription.${plan}.card`}
              >
                {/* Popular badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
                      ⭐ {sl.popular}
                    </span>
                  </div>
                )}

                {/* Current plan indicator */}
                {isCurrentPlan && (
                  <div className="absolute -top-3.5 right-4">
                    <span className="bg-secondary text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      ✓ {sl.currentPlan}
                    </span>
                  </div>
                )}

                {/* Icon + Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${planBadgeColors[plan]}`}
                  >
                    <PlanIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg text-foreground">
                      {plan === "solo"
                        ? sl.planSolo
                        : plan === "team"
                          ? sl.planTeam
                          : sl.planEnterprise}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {plan === "solo"
                        ? sl.descSolo
                        : plan === "team"
                          ? sl.descTeam
                          : sl.descEnterprise}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {price === 0 ? (
                    <p className="text-3xl font-black text-foreground">
                      {sl.free}
                    </p>
                  ) : (
                    <div className="flex items-end gap-1">
                      <p className="text-3xl font-black text-foreground">
                        {price}€
                      </p>
                      <p className="text-sm text-muted-foreground mb-1">
                        {sl.mo}
                      </p>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-8">
                  {details.features.map((feature) => (
                    <li
                      key={feature.en}
                      className="flex items-start gap-2 text-sm text-foreground/80"
                    >
                      <Check className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                      <span>
                        {sl.features[plan as "solo" | "team" | "enterprise"]?.[
                          details.features.indexOf(feature)
                        ] ?? feature.en}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  className={`w-full font-bold ${
                    isCurrentPlan
                      ? "bg-muted text-muted-foreground cursor-default"
                      : plan === "enterprise"
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "bg-primary hover:bg-primary/90 text-white"
                  }`}
                  disabled={isCurrentPlan}
                  onClick={() => handleUpgrade(plan)}
                  data-ocid={`subscription.${plan}.primary_button`}
                >
                  {isCurrentPlan
                    ? sl.currentPlanBtn
                    : price === 0
                      ? sl.downgrade
                      : sl.choosePlan}
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Info footer */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          {sl.vatNote}
        </p>
      </div>
    </main>
  );
}
