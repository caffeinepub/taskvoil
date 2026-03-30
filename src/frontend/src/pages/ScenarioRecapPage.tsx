import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/lib/i18n";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Send, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

type TaskItem = { id: string; title: string; desc: string };

export function ScenarioRecapPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [items, setItems] = useState<TaskItem[]>([]);

  useEffect(() => {
    const raw = sessionStorage.getItem("scenario_selection");
    if (raw) {
      try {
        setItems(JSON.parse(raw) as TaskItem[]);
      } catch {
        setItems([]);
      }
    }
  }, []);

  const updateTitle = (id: string, title: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, title } : item)),
    );
  };

  const updateDesc = (id: string, desc: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, desc } : item)),
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handlePublish = () => {
    if (items.length > 0) {
      sessionStorage.setItem("prefill_task", JSON.stringify(items[0]));
    }
    void navigate({ to: "/post-task" });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link to="/scenarios" data-ocid="scenario_recap.back_button">
            <ArrowLeft size={20} />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {t.scenarios.recapTitle}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t.scenarios.recapSubtitle}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div
          className="text-center py-12"
          data-ocid="scenario_recap.empty_state"
        >
          <p className="text-muted-foreground mb-4">
            {t.scenarios.noSelection}
          </p>
          <Button
            asChild
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Link to="/scenarios">{t.scenarios.back}</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Card
                  className="border-border"
                  data-ocid={`scenario_recap.item.${i + 1}`}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-2">
                        <Label
                          htmlFor={`title-${item.id}`}
                          className="text-xs font-medium text-muted-foreground"
                        >
                          {t.scenarios.editTitle}
                        </Label>
                        <Input
                          id={`title-${item.id}`}
                          value={item.title}
                          onChange={(e) => updateTitle(item.id, e.target.value)}
                          className="text-sm h-9"
                          data-ocid={`scenario_recap.title_input.${i + 1}`}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive h-8 w-8 mt-5 shrink-0"
                        data-ocid={`scenario_recap.delete_button.${i + 1}`}
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    <Textarea
                      value={item.desc}
                      onChange={(e) => updateDesc(item.id, e.target.value)}
                      rows={2}
                      className="text-sm resize-none"
                      data-ocid={`scenario_recap.description_input.${i + 1}`}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Button
            size="lg"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
            data-ocid="scenario_recap.publish_button"
            onClick={handlePublish}
          >
            <Send size={16} className="mr-2" />
            {t.scenarios.publishAll}
          </Button>
        </>
      )}
    </div>
  );
}
