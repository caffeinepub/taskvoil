import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Check, Plus, ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { SCENARIOS } from "./ScenariosPage";

export function ScenarioDetailPage() {
  const { t } = useTranslation();
  const { scenarioId } = useParams({ strict: false }) as { scenarioId: string };
  const navigate = useNavigate();

  const scenario = SCENARIOS.find((s) => s.id === scenarioId);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  if (!scenario) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Scénario introuvable</p>
        <Button
          asChild
          className="mt-4 bg-amber-500 hover:bg-amber-600 text-white"
        >
          <Link to="/scenarios">{t.scenarios.back}</Link>
        </Button>
      </div>
    );
  }

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedTasks = scenario.tasks.filter((task) => selected.has(task.id));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link to="/scenarios" data-ocid="scenario_detail.back_button">
            <ArrowLeft size={20} />
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-3xl">{scenario.emoji}</span>
          <h1 className="text-xl font-bold text-foreground">
            {(t.scenarios as any)[scenario.nameKey]}
          </h1>
        </div>
      </div>
      <p className="text-sm text-muted-foreground ml-11 mb-6">
        {(t.scenarios as any)[scenario.descKey]}
      </p>

      <h2 className="text-base font-semibold text-foreground mb-3">
        {t.scenarios.taskIdeas}
      </h2>

      {/* Task ideas */}
      <div className="space-y-3">
        {scenario.tasks.map((task, i) => {
          const isSelected = selected.has(task.id);
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Card
                className={`cursor-pointer transition-all border-2 ${
                  isSelected
                    ? "border-amber-400 bg-amber-50/60 dark:bg-amber-950/20"
                    : "border-border hover:border-amber-300"
                }`}
                data-ocid={`scenario_detail.task.item.${i + 1}`}
                onClick={() => toggle(task.id)}
              >
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {task.desc}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant={isSelected ? "default" : "outline"}
                    className={`h-8 w-8 shrink-0 transition-colors ${
                      isSelected
                        ? "bg-amber-500 hover:bg-amber-600 border-amber-500 text-white"
                        : "border-amber-400 text-amber-600 hover:bg-amber-50"
                    }`}
                    data-ocid={`scenario_detail.toggle.${i + 1}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(task.id);
                    }}
                  >
                    {isSelected ? <Check size={14} /> : <Plus size={14} />}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Sticky selection banner */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-20 left-0 right-0 px-4 z-50"
            data-ocid="scenario_detail.selection_banner"
          >
            <div className="max-w-2xl mx-auto bg-amber-500 text-white rounded-2xl p-4 flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} />
                <span className="font-semibold text-sm">
                  {t.scenarios.mySelection} : {selected.size}{" "}
                  {t.scenarios.selectCount}
                </span>
              </div>
              <Button
                size="sm"
                className="bg-white text-amber-700 hover:bg-amber-50 font-semibold"
                data-ocid="scenario_detail.view_selection_button"
                onClick={() => {
                  sessionStorage.setItem(
                    "scenario_selection",
                    JSON.stringify(selectedTasks),
                  );
                  void navigate({ to: "/scenarios/recap" });
                }}
              >
                {t.scenarios.next}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
