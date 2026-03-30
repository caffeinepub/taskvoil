import { NewsFeed } from "@/components/NewsFeed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/lib/auth-store";
import { useTranslation } from "@/lib/i18n";
import { useMissionStore } from "@/lib/mission-store";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Lightbulb,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Newspaper } from "lucide-react";
import { motion } from "motion/react";

function SectionHeader({
  title,
  ctaLabel,
  ctaHref,
}: { title: string; ctaLabel: string; ctaHref: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <Button
        variant="ghost"
        size="sm"
        className="text-blue-600 hover:text-blue-700 p-0 h-auto"
        asChild
      >
        <Link to={ctaHref as any} className="flex items-center gap-1">
          {ctaLabel} <ArrowRight size={14} />
        </Link>
      </Button>
    </div>
  );
}

function EmptyBlock({
  message,
  ctaLabel,
  ctaHref,
  fallback,
}: {
  message: string;
  ctaLabel: string;
  ctaHref: string;
  fallback: React.ReactNode;
}) {
  return (
    <div>
      <div
        className="bg-muted/40 rounded-xl p-5 text-center mb-4"
        data-ocid="pro.empty_state"
      >
        <p className="text-muted-foreground text-sm mb-3">{message}</p>
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
          asChild
        >
          <Link to={ctaHref as any}>{ctaLabel}</Link>
        </Button>
      </div>
      {fallback}
    </div>
  );
}

export function ProHomePage() {
  const { t } = useTranslation();
  const { currentUser } = useAuthStore();
  const { missions } = useMissionStore();

  const pseudo =
    currentUser?.pseudo ||
    currentUser?.companyName ||
    currentUser?.firstName ||
    "";

  const availableMissions = missions.filter(
    (m) =>
      m.status === "open" &&
      m.authorRole === "client" &&
      m.country === currentUser?.country,
  );
  const urgentMissions = availableMissions.filter((m) => m.budgetMax > 300);

  const stats = [
    { icon: TrendingUp, value: "0", label: t.ui.uiMission },
    { icon: Star, value: "—", label: t.ui.uiSatisfactionRate },
    { icon: Users, value: "0", label: t.ui.uiServiceProvider },
  ];

  const tipLabels = [
    { emoji: "📸", title: t.ui.uiVerifiedWork, desc: t.ui.uiVerifiedProsDesc },
    { emoji: "🏆", title: t.ui.uiPremiumPros, desc: t.ui.uiSubscriptions },
    { emoji: "💬", title: t.ui.uiSendOffer, desc: t.ui.uiStartConvo },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-foreground">
          {t.home.pro.greeting}
          {pseudo ? `, ${pseudo}` : ""} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{t.hero.subtitle}</p>
      </motion.div>

      {/* Quick stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="grid grid-cols-3 gap-3"
        data-ocid="pro.stats.section"
      >
        {stats.map(({ icon: Icon, value, label }, idx) => (
          <Card key={label} className="border-border">
            <CardContent className="p-3 text-center">
              <Icon
                size={18}
                className={`mx-auto mb-1 ${
                  idx === 1 ? "text-emerald-500" : "text-blue-500"
                }`}
              />
              <p className="text-xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground leading-tight">
                {label}
              </p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white h-12 text-sm font-semibold"
          data-ocid="pro.marketplace_button"
          asChild
        >
          <Link to="/marketplace">{t.nav.marketplace}</Link>
        </Button>
        <Button
          variant="outline"
          className="h-12 text-sm font-semibold border-blue-300 text-blue-700 hover:bg-blue-50"
          data-ocid="pro.schedule_button"
          asChild
        >
          <Link to="/pro/schedule">{t.ui.uiManageSchedule}</Link>
        </Button>
      </div>

      {/* Targeted Requests */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        data-ocid="pro.targeted_requests.section"
      >
        <SectionHeader
          title={t.home.pro.targetedRequests}
          ctaLabel={t.home.pro.viewAll}
          ctaHref="/marketplace"
        />
        {availableMissions.length > 0 ? (
          <div className="space-y-2">
            {availableMissions.slice(0, 3).map((m, i) => (
              <Card
                key={m.id}
                className="border-border hover:border-blue-300 transition-colors"
                data-ocid={`pro.request.item.${i + 1}`}
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {m.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {m.city} · {m.budgetMin}–{m.budgetMax}€
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                    {t.ui.uiPosted}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyBlock
            message={t.home.pro.emptyRequests}
            ctaLabel={t.home.pro.ctaRequests}
            ctaHref="/profile/edit"
            fallback={
              <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/10">
                <CardContent className="p-4 flex items-start gap-3">
                  <Lightbulb
                    size={20}
                    className="text-emerald-500 shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {t.home.pro.proTips}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t.ui.uiVerifiedProsDesc}
                    </p>
                  </div>
                </CardContent>
              </Card>
            }
          />
        )}
      </motion.section>

      {/* Nearby Missions */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        data-ocid="pro.nearby_missions.section"
      >
        <SectionHeader
          title={t.home.pro.nearbyMissions}
          ctaLabel={t.home.pro.viewAll}
          ctaHref="/marketplace"
        />
        {availableMissions.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {availableMissions.slice(0, 4).map((m, i) => (
              <Card
                key={m.id}
                className="min-w-[180px] border-border"
                data-ocid={`pro.nearby.item.${i + 1}`}
              >
                <CardContent className="p-3">
                  <p className="text-sm font-semibold text-foreground">
                    {m.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{m.city}</p>
                  <p className="text-xs font-medium text-blue-600 mt-1">
                    {m.budgetMin}–{m.budgetMax}€
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyBlock
            message={t.home.pro.emptyMissions}
            ctaLabel={t.home.pro.ctaMissions}
            ctaHref="/marketplace"
            fallback={
              <p className="text-xs text-muted-foreground text-center py-2">
                {t.ui.uiNoOffersYet}
              </p>
            }
          />
        )}
      </motion.section>

      {/* Urgencies */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        data-ocid="pro.urgencies.section"
      >
        <div className="flex items-center gap-2 mb-3">
          <Zap size={18} className="text-orange-500" />
          <h2 className="text-lg font-bold text-foreground">
            {t.home.pro.urgencies}
          </h2>
        </div>
        {urgentMissions.length > 0 ? (
          <div className="space-y-2">
            {urgentMissions.slice(0, 2).map((m, i) => (
              <Card
                key={m.id}
                className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/10"
                data-ocid={`pro.urgency.item.${i + 1}`}
              >
                <CardContent className="p-3">
                  <p className="text-sm font-medium text-foreground">
                    {m.title}
                  </p>
                  <p className="text-xs text-orange-600 font-medium">
                    {m.budgetMin}–{m.budgetMax}€
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyBlock
            message={t.home.pro.emptyUrgencies}
            ctaLabel={t.home.pro.ctaUrgencies}
            ctaHref="/marketplace"
            fallback={
              <p className="text-xs text-muted-foreground text-center py-2">
                {t.ui.uiNoOffersYet}
              </p>
            }
          />
        )}
      </motion.section>

      {/* Pro Tips */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        data-ocid="pro.tips.section"
      >
        <h2 className="text-lg font-bold text-foreground mb-3">
          {t.home.pro.proTips}
        </h2>
        <div className="space-y-3">
          {tipLabels.map((tip) => (
            <Card
              key={tip.emoji}
              className="border-blue-200 bg-blue-50/30 dark:bg-blue-950/10"
            >
              <CardContent className="p-4 flex items-start gap-3">
                <span className="text-2xl">{tip.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {tip.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {tip.desc}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.section>

      {/* News Feed */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        data-ocid="pro.feed.section"
      >
        <div className="flex items-center gap-2 mb-4">
          <Newspaper size={18} className="text-blue-600" />
          <h2 className="text-lg font-bold text-foreground">{t.feed.title}</h2>
        </div>
        <NewsFeed />
      </motion.section>
    </div>
  );
}
