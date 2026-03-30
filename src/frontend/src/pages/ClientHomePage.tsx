import { NewsFeed } from "@/components/NewsFeed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/lib/auth-store";
import { n1Categories } from "@/lib/demo-data";
import { useTranslation } from "@/lib/i18n";
import { useMissionStore } from "@/lib/mission-store";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Lightbulb, MapPin, Zap } from "lucide-react";
import { Newspaper } from "lucide-react";
import { motion } from "motion/react";

const SCENARIO_TEASERS = [
  { emoji: "📦", key: "1" },
  { emoji: "🔧", key: "2" },
  { emoji: "⏰", key: "3" },
];

const POPULAR_TASK_IDEAS = [
  { emoji: "🔧", labelKey: "handytask" },
  { emoji: "🧹", labelKey: "nettoyage" },
  { emoji: "📦", labelKey: "demenagement" },
];

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
        data-ocid="client.empty_state"
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

export function ClientHomePage() {
  const { t } = useTranslation();
  const { currentUser } = useAuthStore();
  const { missions } = useMissionStore();
  const navigate = useNavigate();

  const pseudo = currentUser?.pseudo || currentUser?.firstName || "";
  const userMissions = missions.filter(
    (m) => m.authorId === String(currentUser?.id) && m.authorRole === "client",
  );
  const urgentMissions = userMissions.filter(
    (m) => m.status === "open" && m.budgetMax > 200,
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-foreground">
          {t.home.client.greeting}
          {pseudo ? `, ${pseudo}` : ""} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{t.hero.subtitle}</p>
      </motion.div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white h-12 text-sm font-semibold"
          data-ocid="client.post_task_button"
          onClick={() => void navigate({ to: "/post-task" })}
        >
          {t.hero.ctaPost}
        </Button>
        <Button
          variant="outline"
          className="h-12 text-sm font-semibold border-blue-300 text-blue-700 hover:bg-blue-50"
          data-ocid="client.find_pros_button"
          asChild
        >
          <Link to="/pros">{t.home.client.nearbyPros}</Link>
        </Button>
      </div>

      {/* Trusted Pros */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        data-ocid="client.trusted_pros.section"
      >
        <SectionHeader
          title={t.home.client.trustedPros}
          ctaLabel={t.home.client.viewAll}
          ctaHref="/pros"
        />
        <EmptyBlock
          message={t.home.client.emptyTrustedPros}
          ctaLabel={t.home.client.ctaTrustedPros}
          ctaHref="/pros"
          fallback={
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {n1Categories.slice(0, 4).map((cat, i) => (
                <Card
                  key={cat.key}
                  className="min-w-[130px] border-border hover:border-blue-300 transition-colors"
                  data-ocid={`client.category.item.${i + 1}`}
                >
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl mb-1">{cat.emoji}</div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {cat.labelFR}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          }
        />
      </motion.section>

      {/* Nearby Pros */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        data-ocid="client.nearby_pros.section"
      >
        <SectionHeader
          title={t.home.client.nearbyPros}
          ctaLabel={t.home.client.viewAll}
          ctaHref="/pros"
        />
        <EmptyBlock
          message={t.home.client.emptyNearbyPros}
          ctaLabel={t.home.client.ctaNearbyPros}
          ctaHref="/categories"
          fallback={
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {n1Categories.slice(0, 3).map((cat, i) => (
                <Card
                  key={cat.key}
                  className="min-w-[150px] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200"
                  data-ocid={`client.nearby.item.${i + 1}`}
                >
                  <CardContent className="p-4">
                    <div className="text-2xl mb-1">{cat.emoji}</div>
                    <p className="text-sm font-semibold text-foreground">
                      {cat.labelFR}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin size={10} className="text-blue-500" />
                      <span className="text-xs text-muted-foreground">
                        ... km
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          }
        />
      </motion.section>

      {/* Requests Around */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        data-ocid="client.requests_around.section"
      >
        <SectionHeader
          title={t.home.client.requestsAround}
          ctaLabel={t.home.client.viewAll}
          ctaHref="/marketplace"
        />
        {userMissions.length > 0 ? (
          <div className="space-y-2">
            {userMissions.slice(0, 3).map((m, i) => (
              <Card
                key={m.id}
                className="border-border"
                data-ocid={`client.request.item.${i + 1}`}
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {m.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{m.city}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {m.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyBlock
            message={t.home.client.emptyRequests}
            ctaLabel={t.home.client.ctaRequests}
            ctaHref="/post-task"
            fallback={
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {POPULAR_TASK_IDEAS.map((idea, i) => (
                  <Card
                    key={idea.labelKey}
                    className="min-w-[140px] border-blue-200 bg-blue-50/50 dark:bg-blue-950/10"
                    data-ocid={`client.task_idea.item.${i + 1}`}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl mb-1">{idea.emoji}</div>
                      <p className="text-xs font-medium text-foreground">
                        {(t.categories as any)[idea.labelKey]}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            }
          />
        )}
      </motion.section>

      {/* Urgencies */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        data-ocid="client.urgencies.section"
      >
        <div className="flex items-center gap-2 mb-3">
          <Zap size={18} className="text-orange-500" />
          <h2 className="text-lg font-bold text-foreground">
            {t.home.client.urgencies}
          </h2>
        </div>
        {urgentMissions.length > 0 ? (
          <div className="space-y-2">
            {urgentMissions.slice(0, 2).map((m, i) => (
              <Card
                key={m.id}
                className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/10"
                data-ocid={`client.urgency.item.${i + 1}`}
              >
                <CardContent className="p-3">
                  <p className="text-sm font-medium text-foreground">
                    {m.title}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyBlock
            message={t.home.client.emptyUrgencies}
            ctaLabel={t.home.client.ctaUrgencies}
            ctaHref="/marketplace"
            fallback={
              <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/10">
                <CardContent className="p-4 flex items-start gap-3">
                  <Lightbulb
                    size={20}
                    className="text-emerald-500 shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {t.ui.uiSatisfactionRate}
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

      {/* Inspirations / Scenarios */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        data-ocid="client.inspirations.section"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground">
            {t.home.client.inspirations}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 p-0 h-auto"
            asChild
          >
            <Link to="/scenarios" className="flex items-center gap-1">
              {t.home.client.viewAll} <ArrowRight size={14} />
            </Link>
          </Button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {SCENARIO_TEASERS.map((s, i) => (
            <Card
              key={s.key}
              className="min-w-[160px] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 cursor-pointer hover:border-blue-400 transition-colors"
              data-ocid={`client.scenario.item.${i + 1}`}
              onClick={() => void navigate({ to: "/scenarios" })}
            >
              <CardContent className="p-4">
                <div className="text-3xl mb-2">{s.emoji}</div>
                <p className="text-sm font-semibold text-foreground">
                  {(t.scenarios as any)[`scenario${s.key}Name`]}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(t.scenarios as any)[`scenario${s.key}Desc`]}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Button
          className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white"
          data-ocid="client.discover_scenarios_button"
          asChild
        >
          <Link to="/scenarios">{t.home.client.discoverScenarios}</Link>
        </Button>
      </motion.section>

      {/* News Feed */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        data-ocid="client.feed.section"
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
