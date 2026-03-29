import { Badge } from "@/components/ui/badge";
import { useCountryStore } from "@/lib/country-store";
import { useTranslation } from "@/lib/i18n";
import { RENTAL_CATEGORIES, useRentalStore } from "@/lib/rental-store";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Package, Truck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export function RentalCategoryPage() {
  const { t } = useTranslation();
  const { categoryId } = useParams({ strict: false }) as {
    categoryId?: string;
  };
  const { selectedCountry } = useCountryStore();
  const { getListings } = useRentalStore();
  const navigate = useNavigate();

  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);

  const country = selectedCountry ?? "FR";
  const category = RENTAL_CATEGORIES.find((c) => c.id === (categoryId ?? ""));
  const categoryLabel = category
    ? t.rental.categories[category.id as keyof typeof t.rental.categories]
    : categoryId;

  const allListings = getListings(country, categoryId);
  const filtered =
    selectedSubs.length === 0
      ? allListings
      : allListings.filter((l) => selectedSubs.includes(l.subcategoryId));

  function toggleSub(sub: string) {
    setSelectedSubs((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub],
    );
  }

  function conditionLabel(c: string) {
    if (c === "good") return t.rental.listing.conditionGood;
    if (c === "very_good") return t.rental.listing.conditionVeryGood;
    return t.rental.listing.conditionNew;
  }

  return (
    <main
      className="min-h-screen bg-background"
      data-ocid="rental_category.page"
    >
      {/* Header */}
      <div
        className="sticky top-16 z-20 px-4 pt-4 pb-3"
        style={{
          background: "oklch(0.99 0.005 80)",
          borderBottom: "1px solid oklch(0.90 0.04 70)",
        }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <button
              type="button"
              data-ocid="rental_category.back_button"
              onClick={() => void navigate({ to: "/rental" })}
              className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
              style={{ border: "1.5px solid oklch(0.88 0.05 70)" }}
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="text-2xl">{category?.icon}</span>
            <h1
              className="text-xl font-bold"
              style={{ color: "oklch(0.22 0.03 45)" }}
            >
              {categoryLabel}
            </h1>
          </div>

          {/* Subcategory filters */}
          {category && (
            <div
              className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
              style={{ scrollbarWidth: "none" }}
            >
              {category.subcategories.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  data-ocid="rental_category.filter_toggle"
                  onClick={() => toggleSub(sub)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: selectedSubs.includes(sub)
                      ? "oklch(0.72 0.18 65)"
                      : "oklch(0.95 0.03 75)",
                    color: selectedSubs.includes(sub)
                      ? "white"
                      : "oklch(0.40 0.06 60)",
                    border: `1.5px solid ${
                      selectedSubs.includes(sub)
                        ? "oklch(0.65 0.20 55)"
                        : "oklch(0.88 0.05 70)"
                    }`,
                  }}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Listings */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              data-ocid="rental_category.empty_state"
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <Package
                className="h-14 w-14 mb-4"
                style={{ color: "oklch(0.72 0.18 65)" }}
              />
              <p
                className="font-semibold text-lg mb-1"
                style={{ color: "oklch(0.30 0.04 45)" }}
              >
                {t.rental.listing.noListings}
              </p>
              <p className="text-sm" style={{ color: "oklch(0.55 0.04 60)" }}>
                {t.rental.listing.postFirst}
              </p>
            </motion.div>
          ) : (
            <div className="grid gap-4" data-ocid="rental_category.list">
              {filtered.map((listing, idx) => (
                <motion.button
                  key={listing.id}
                  type="button"
                  data-ocid={`rental_category.item.${idx + 1}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() =>
                    void navigate({
                      to: "/rental/listing/$listingId",
                      params: { listingId: String(listing.id) },
                    })
                  }
                  className="w-full text-left rounded-2xl p-4 cursor-pointer"
                  style={{
                    background: "oklch(0.99 0.005 80)",
                    border: "1.5px solid oklch(0.90 0.04 70)",
                    boxShadow: "0 2px 8px oklch(0.65 0.12 60 / 0.06)",
                  }}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-semibold text-sm leading-snug mb-1 truncate"
                        style={{ color: "oklch(0.22 0.03 45)" }}
                      >
                        {listing.title}
                      </h3>
                      <p
                        className="text-xs mb-2"
                        style={{ color: "oklch(0.55 0.04 60)" }}
                      >
                        {listing.city} · {listing.ownerId}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: "oklch(0.94 0.06 80)",
                            color: "oklch(0.45 0.10 65)",
                            border: "none",
                          }}
                        >
                          {conditionLabel(listing.condition)}
                        </Badge>
                        {listing.deliveryAvailable && (
                          <Badge
                            className="text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
                            style={{
                              background: "oklch(0.93 0.05 200)",
                              color: "oklch(0.38 0.10 200)",
                              border: "none",
                            }}
                          >
                            <Truck className="h-3 w-3" />
                            {t.rental.listing.deliveryAvailable}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className="text-base font-bold"
                        style={{ color: "oklch(0.55 0.18 55)" }}
                      >
                        {listing.pricePerDay}€
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "oklch(0.60 0.04 60)" }}
                      >
                        {t.rental.listing.pricePerDay}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
