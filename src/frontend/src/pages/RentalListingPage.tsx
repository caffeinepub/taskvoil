import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/lib/auth-store";
import { useTranslation } from "@/lib/i18n";
import { RENTAL_CATEGORIES, useRentalStore } from "@/lib/rental-store";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Calendar, MapPin, Package, Tag, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function RentalListingPage() {
  const { t } = useTranslation();
  const { listingId } = useParams({ strict: false }) as { listingId?: string };
  const { getListing, createRequest } = useRentalStore();
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();

  const [requestOpen, setRequestOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const listing = getListing(Number(listingId));

  if (!listing) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        data-ocid="rental_listing.error_state"
      >
        <div className="text-center">
          <Package className="h-14 w-14 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Listing not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => void navigate({ to: "/rental" })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> {t.common.back}
          </Button>
        </div>
      </main>
    );
  }

  const category = RENTAL_CATEGORIES.find((c) => c.id === listing.categoryId);
  const categoryLabel = category
    ? t.rental.categories[category.id as keyof typeof t.rental.categories]
    : listing.categoryId;

  function conditionLabel(c: string) {
    if (c === "good") return t.rental.listing.conditionGood;
    if (c === "very_good") return t.rental.listing.conditionVeryGood;
    return t.rental.listing.conditionNew;
  }

  function handleContact() {
    if (!currentUser) {
      void navigate({ to: "/login" });
      return;
    }
    setRequestOpen(true);
  }

  async function handleSubmitRequest() {
    if (!currentUser || !startDate || !endDate) return;
    setSubmitting(true);
    createRequest({
      requesterId: currentUser.pseudo || String(currentUser.id),
      listingId: listing!.id,
      startDate,
      endDate,
      message,
    });
    await new Promise((r) => setTimeout(r, 400));
    setSubmitting(false);
    setRequestOpen(false);
    toast.success(t.rental.request.success);
  }

  return (
    <main
      className="min-h-screen bg-background"
      data-ocid="rental_listing.page"
    >
      {/* Back button */}
      <div
        className="sticky top-16 z-10 px-4 py-3"
        style={{
          background: "oklch(0.99 0.005 80)",
          borderBottom: "1px solid oklch(0.90 0.04 70)",
        }}
      >
        <div className="max-w-2xl mx-auto">
          <button
            type="button"
            data-ocid="rental_listing.back_button"
            onClick={() =>
              void navigate({
                to: "/rental/category/$categoryId",
                params: { categoryId: listing.categoryId },
              })
            }
            className="flex items-center gap-2 text-sm font-medium hover:text-amber-600 transition-colors"
            style={{ color: "oklch(0.45 0.07 60)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            {categoryLabel}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Photo placeholder */}
        {listing.photos.length === 0 && (
          <div
            className="w-full h-52 rounded-2xl flex items-center justify-center"
            style={{ background: "oklch(0.93 0.04 75)" }}
          >
            <span className="text-5xl">{category?.icon ?? "📦"}</span>
          </div>
        )}

        {/* Title and price */}
        <div>
          <h1
            className="text-2xl font-bold mb-1"
            style={{ color: "oklch(0.22 0.03 45)" }}
          >
            {listing.title}
          </h1>
          <div className="flex items-baseline gap-3">
            <span
              className="text-2xl font-bold"
              style={{ color: "oklch(0.55 0.18 55)" }}
            >
              {listing.pricePerDay}€
            </span>
            <span className="text-sm text-muted-foreground">
              {t.rental.listing.pricePerDay}
            </span>
            <span
              className="text-base font-semibold"
              style={{ color: "oklch(0.62 0.14 55)" }}
            >
              {listing.pricePerHalfDay}€
            </span>
            <span className="text-sm text-muted-foreground">
              {t.rental.listing.pricePerHalfDay}
            </span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge
            className="text-xs px-3 py-1 rounded-full"
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
              className="text-xs px-3 py-1 rounded-full flex items-center gap-1"
              style={{
                background: "oklch(0.93 0.05 200)",
                color: "oklch(0.38 0.10 200)",
                border: "none",
              }}
            >
              <Truck className="h-3 w-3" />
              {t.rental.listing.deliveryAvailable} — {listing.deliveryPrice}€
            </Badge>
          )}
        </div>

        {/* Details */}
        <div
          className="rounded-2xl p-4 space-y-3"
          style={{
            background: "oklch(0.97 0.02 80)",
            border: "1px solid oklch(0.90 0.04 70)",
          }}
        >
          <div className="flex items-center gap-3 text-sm">
            <MapPin
              className="h-4 w-4 flex-shrink-0"
              style={{ color: "oklch(0.62 0.14 55)" }}
            />
            <span style={{ color: "oklch(0.35 0.04 50)" }}>{listing.city}</span>
          </div>
          {listing.deposit > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <Tag
                className="h-4 w-4 flex-shrink-0"
                style={{ color: "oklch(0.62 0.14 55)" }}
              />
              <span style={{ color: "oklch(0.35 0.04 50)" }}>
                {t.rental.listing.deposit}: {listing.deposit}€
              </span>
            </div>
          )}
          {listing.availabilityDates.length > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <Calendar
                className="h-4 w-4 flex-shrink-0"
                style={{ color: "oklch(0.62 0.14 55)" }}
              />
              <span style={{ color: "oklch(0.35 0.04 50)" }}>
                {listing.availabilityDates.slice(0, 3).join(" · ")}
              </span>
            </div>
          )}
          {listing.brand && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-base">🏷️</span>
              <span style={{ color: "oklch(0.35 0.04 50)" }}>
                {t.rental.listing.brand}: {listing.brand}
                {listing.model ? ` ${listing.model}` : ""}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {listing.description && (
          <div>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "oklch(0.38 0.04 50)" }}
            >
              {listing.description}
            </p>
          </div>
        )}

        {/* Commission badge */}
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium"
          style={{
            background: "oklch(0.97 0.02 80)",
            border: "1px solid oklch(0.88 0.06 70)",
            color: "oklch(0.50 0.10 60)",
          }}
        >
          <span>💼</span>
          <span>{t.rental.listing.commission}</span>
        </div>

        {/* CTA */}
        <Button
          data-ocid="rental_listing.contact_button"
          onClick={handleContact}
          size="lg"
          className="w-full h-13 text-base font-semibold rounded-xl"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.72 0.18 65), oklch(0.65 0.20 55))",
            color: "white",
            boxShadow: "0 4px 20px oklch(0.65 0.20 55 / 0.3)",
          }}
        >
          {t.rental.listing.contact}
        </Button>
      </div>

      {/* Request dialog */}
      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent className="max-w-sm" data-ocid="rental_listing.dialog">
          <DialogHeader>
            <DialogTitle>{t.rental.request.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="startDate"
                className="text-sm font-medium mb-1.5 block"
              >
                {t.rental.request.startDate}
              </Label>
              <Input
                id="startDate"
                data-ocid="rental_listing.start_date_input"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label
                htmlFor="endDate"
                className="text-sm font-medium mb-1.5 block"
              >
                {t.rental.request.endDate}
              </Label>
              <Input
                id="endDate"
                data-ocid="rental_listing.end_date_input"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <Label
                htmlFor="reqMessage"
                className="text-sm font-medium mb-1.5 block"
              >
                {t.rental.request.message}
              </Label>
              <Textarea
                id="reqMessage"
                data-ocid="rental_listing.message_textarea"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="..."
              />
            </div>
            <Button
              data-ocid="rental_listing.submit_request_button"
              onClick={() => void handleSubmitRequest()}
              disabled={!startDate || !endDate || submitting}
              className="w-full font-semibold rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.18 65), oklch(0.65 0.20 55))",
                color: "white",
              }}
            >
              {submitting ? "..." : t.rental.request.submit}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
