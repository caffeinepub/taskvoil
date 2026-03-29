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
            {lang === "fr"
              ? "Réservé aux professionnels"
              : "For professionals only"}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            {lang === "fr"
              ? "Les abonnements sont disponibles uniquement pour les profils professionnels."
              : "Subscriptions are only available for professional profiles."}
          </p>
          <Button
            variant="outline"
            onClick={() => void navigate({ to: "/" })}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {lang === "fr" ? "Retour à l'accueil" : "Back to home"}
          </Button>
        </div>
      </main>
    );
  }

  const mySub = getMySubscription("pro_1");
  const currentPlan: SubscriptionPlan = mySub?.plan ?? "solo";

  function handleUpgrade(plan: SubscriptionPlan) {
    if (plan === currentPlan) return;
    upgradePlan("pro_1", plan);
    const label =
      lang === "fr" ? PLAN_DETAILS[plan].labelFR : PLAN_DETAILS[plan].labelEN;
    toast.success(
      lang === "fr"
        ? `Plan ${label} activé avec succès !`
        : `${label} plan activated successfully!`,
    );
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
                {lang === "fr" ? "Abonnements Pro" : "Pro Subscriptions"}
              </Badge>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
              {lang === "fr" ? "Boostez votre activité" : "Boost your business"}
            </h1>
            <p className="text-white/70 text-base max-w-xl">
              {lang === "fr"
                ? "Choisissez le plan adapté à votre activité. Changez ou annulez à tout moment."
                : "Choose the plan that fits your business. Change or cancel anytime."}
            </p>
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
                      ⭐{" "}
                      {lang === "fr"
                        ? (details.badge ?? "Populaire")
                        : "Popular"}
                    </span>
                  </div>
                )}

                {/* Current plan indicator */}
                {isCurrentPlan && (
                  <div className="absolute -top-3.5 right-4">
                    <span className="bg-secondary text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      ✓ {lang === "fr" ? "Votre plan actuel" : "Your plan"}
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
                      {lang === "fr" ? details.labelFR : details.labelEN}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {lang === "fr" ? details.descFR : details.descEN}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {price === 0 ? (
                    <p className="text-3xl font-black text-foreground">
                      {lang === "fr" ? "Gratuit" : "Free"}
                    </p>
                  ) : (
                    <div className="flex items-end gap-1">
                      <p className="text-3xl font-black text-foreground">
                        {price}€
                      </p>
                      <p className="text-sm text-muted-foreground mb-1">
                        /{lang === "fr" ? "mois" : "mo"}
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
                      <span>{lang === "fr" ? feature.fr : feature.en}</span>
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
                    ? lang === "fr"
                      ? "Plan actuel"
                      : "Current plan"
                    : price === 0
                      ? lang === "fr"
                        ? "Rétrograder"
                        : "Downgrade"
                      : lang === "fr"
                        ? "Choisir ce plan"
                        : "Choose this plan"}
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Info footer */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          {lang === "fr"
            ? "Tous les prix sont TTC. Annulation possible à tout moment sans frais."
            : "All prices include VAT. Cancel anytime at no charge."}
        </p>
      </div>
    </main>
  );
}
