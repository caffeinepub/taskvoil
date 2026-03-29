import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";
import { useCountryStore } from "@/lib/country-store";
import { useTranslation } from "@/lib/i18n";
import { RENTAL_CATEGORIES, useRentalStore } from "@/lib/rental-store";
import { useNavigate } from "@tanstack/react-router";
import { PlusCircle } from "lucide-react";
import { motion } from "motion/react";

export function RentalHomePage() {
  const { t } = useTranslation();
  const { currentUser } = useAuthStore();
  const { selectedCountry } = useCountryStore();
  const { getListings } = useRentalStore();
  const navigate = useNavigate();

  const country = selectedCountry ?? "FR";

  function getCategoryCount(categoryId: string) {
    return getListings(country, categoryId).length;
  }

  function handlePost() {
    if (!currentUser) {
      void navigate({ to: "/login" });
    } else {
      void navigate({ to: "/rental/post" });
    }
  }

  return (
    <main className="min-h-screen bg-background" data-ocid="rental_home.page">
      {/* Hero header */}
      <section
        className="relative overflow-hidden py-10 px-4"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.25 0.04 45) 0%, oklch(0.18 0.03 40) 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Badge
              className="mb-3 text-xs font-semibold px-3 py-1"
              style={{
                background: "oklch(0.72 0.18 65 / 0.2)",
                color: "oklch(0.82 0.16 70)",
                border: "1px solid oklch(0.72 0.18 65 / 0.3)",
              }}
            >
              TaskVoilà
            </Badge>
            <h1
              className="text-3xl md:text-4xl font-bold mb-2"
              style={{ color: "oklch(0.95 0.02 80)" }}
            >
              {t.rental.title}
            </h1>
            <p
              className="text-base mb-6"
              style={{ color: "oklch(0.75 0.04 70)" }}
            >
              {t.rental.subtitle}
            </p>
            <Button
              data-ocid="rental_home.post_button"
              onClick={handlePost}
              size="lg"
              className="font-semibold rounded-xl h-12 px-6"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.18 65), oklch(0.65 0.20 55))",
                color: "white",
                boxShadow: "0 4px 20px oklch(0.65 0.20 55 / 0.35)",
              }}
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              {t.rental.postListing}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Commission info */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium mb-6"
          style={{
            background: "oklch(0.97 0.02 80)",
            border: "1px solid oklch(0.88 0.06 70)",
            color: "oklch(0.50 0.10 60)",
          }}
        >
          <span>💼</span>
          <span>{t.rental.listing.commission}</span>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-10">
          {RENTAL_CATEGORIES.map((cat, idx) => {
            const count = getCategoryCount(cat.id);
            const label =
              t.rental.categories[cat.id as keyof typeof t.rental.categories];
            return (
              <motion.button
                key={cat.id}
                type="button"
                data-ocid={`rental_home.category_card.${idx + 1}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.07 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() =>
                  void navigate({
                    to: "/rental/category/$categoryId",
                    params: { categoryId: cat.id },
                  })
                }
                className="flex flex-col items-start p-5 rounded-2xl text-left cursor-pointer"
                style={{
                  background: "oklch(0.99 0.005 80)",
                  border: "1.5px solid oklch(0.90 0.04 70)",
                  boxShadow: "0 2px 12px oklch(0.65 0.12 60 / 0.07)",
                  transition: "box-shadow 0.2s",
                }}
              >
                <span className="text-3xl mb-3">{cat.icon}</span>
                <span
                  className="font-semibold text-sm leading-snug mb-1"
                  style={{ color: "oklch(0.22 0.03 45)" }}
                >
                  {label}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "oklch(0.55 0.05 60)" }}
                >
                  {count} {count === 1 ? "annonce" : "annonces"}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
