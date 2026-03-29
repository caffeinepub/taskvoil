import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { getN2ForN1, n1Categories } from "@/lib/demo-data";
import { useTranslation } from "@/lib/i18n";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ChevronRight } from "lucide-react";

export function CategoriesPage() {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-white border-b border-border py-10">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            {t.categoriesPage.title}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t.categoriesPage.subtitle}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <Accordion type="multiple" className="space-y-3">
            {n1Categories
              .sort((a, b) => a.order - b.order)
              .map((cat) => {
                const n2s = getN2ForN1(cat.key);
                const label = lang === "fr" ? cat.labelFR : cat.labelEN;
                const examples =
                  lang === "fr" ? cat.examplesFR : cat.examplesEN;

                return (
                  <AccordionItem
                    key={cat.key}
                    value={cat.key}
                    className="bg-white rounded-2xl border border-border/60 card-shadow overflow-hidden px-0"
                  >
                    <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-muted/40 transition-colors group">
                      <div className="flex items-center gap-4 text-left">
                        <span className="text-3xl flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                          {cat.emoji}
                        </span>
                        <div>
                          <div className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                            {label}
                          </div>
                          <div className="text-sm text-muted-foreground mt-0.5">
                            {examples[0]}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-5">
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          {t.categoriesPage.subcategories}
                        </p>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {n2s.map((n2) => {
                            const n2Label =
                              lang === "fr" ? n2.labelFR : n2.labelEN;
                            return (
                              <button
                                type="button"
                                key={n2.key}
                                onClick={() =>
                                  void navigate({
                                    to: "/post-task",
                                    search: {
                                      n1: cat.key,
                                      n2: n2.key,
                                    },
                                  })
                                }
                                className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-150 text-left group/n2"
                              >
                                <span className="text-sm font-medium text-foreground group-hover/n2:text-primary transition-colors">
                                  {n2Label}
                                </span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover/n2:text-primary transition-colors shrink-0" />
                              </button>
                            );
                          })}
                        </div>

                        {/* CTA to post a task in this category */}
                        <div className="mt-4">
                          <Button
                            size="sm"
                            asChild
                            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                          >
                            <Link to="/post-task" search={{ n1: cat.key }}>
                              {lang === "fr"
                                ? `Poster une mission ${label}`
                                : `Post a ${label} task`}
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
          </Accordion>
        </div>
      </div>
    </main>
  );
}
