import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { n1Categories } from "@/lib/demo-data";
import { useTranslation } from "@/lib/i18n";
import { Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle, Shield, Star, Zap } from "lucide-react";
import { motion } from "motion/react";

export function VisitorHomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const steps = [
    {
      title: t.home.visitor.step1Title,
      desc: t.home.visitor.step1Desc,
      num: "01",
    },
    {
      title: t.home.visitor.step2Title,
      desc: t.home.visitor.step2Desc,
      num: "02",
    },
    {
      title: t.home.visitor.step3Title,
      desc: t.home.visitor.step3Desc,
      num: "03",
    },
  ];

  const trustFeatures = [
    { icon: Shield, label: t.ui.uiVerifiedPros },
    { icon: CheckCircle, label: t.ui.uiSecurePayment },
    { icon: Star, label: t.ui.uiSatisfactionRate },
    { icon: Zap, label: t.hero.titleHighlight },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-amber-900/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent" />
        <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-100">
              TaskVoilà — Europe
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              {t.home.visitor.hero}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t.home.visitor.slogan}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="bg-amber-500 hover:bg-amber-600 text-white text-base font-semibold px-8"
                data-ocid="visitor.client_cta_button"
                onClick={() => void navigate({ to: "/register" })}
              >
                {t.home.visitor.ctaClient}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-amber-500 text-amber-700 hover:bg-amber-50 text-base font-semibold px-8"
                data-ocid="visitor.pro_cta_button"
                onClick={() => void navigate({ to: "/register" })}
              >
                {t.home.visitor.ctaPro}
              </Button>
            </div>
          </motion.div>

          {/* Trust bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            {trustFeatures.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 text-sm text-amber-800 dark:text-amber-300"
              >
                <Icon size={16} className="text-amber-500" />
                <span>{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {t.home.visitor.howItWorksTitle}
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="relative bg-card border border-border rounded-2xl p-6 text-center"
            >
              <div className="text-5xl font-black text-amber-100 dark:text-amber-900/40 absolute top-4 right-4 leading-none">
                {step.num}
              </div>
              <div className="relative">
                <p className="font-bold text-foreground text-lg mb-2">
                  {step.title}
                </p>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-muted/30 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            {t.categories.title}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {n1Categories.map((cat) => (
              <motion.div
                key={cat.key}
                whileHover={{ scale: 1.03 }}
                className="bg-card border border-border rounded-xl p-4 text-center cursor-pointer hover:border-amber-400 hover:shadow-sm transition-all"
                data-ocid={`visitor.category.${cat.order}`}
              >
                <div className="text-3xl mb-2">{cat.emoji}</div>
                <p className="text-sm font-medium text-foreground">
                  {cat.labelFR}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="max-w-5xl mx-auto px-4 py-14 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          {t.home.visitor.trustTitle}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
          {t.home.visitor.trustDesc}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            size="lg"
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold"
            data-ocid="visitor.signup_button"
            onClick={() => void navigate({ to: "/register" })}
          >
            {t.home.visitor.ctaClient}
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="text-amber-700 hover:text-amber-800"
            data-ocid="visitor.login_button"
            asChild
          >
            <Link to="/login">{t.nav.login}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
