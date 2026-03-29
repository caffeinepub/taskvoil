import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/lib/auth-store";
import { useCountryStore } from "@/lib/country-store";
import { useTranslation } from "@/lib/i18n";
import {
  RENTAL_CATEGORIES,
  type RentalCondition,
  useRentalStore,
} from "@/lib/rental-store";
import { Navigate, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function PostRentalPage() {
  const { t } = useTranslation();
  const { currentUser } = useAuthStore();
  const { selectedCountry } = useCountryStore();
  const { createListing } = useRentalStore();
  const navigate = useNavigate();

  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [pricePerHalfDay, setPricePerHalfDay] = useState("");
  const [deposit, setDeposit] = useState("");
  const [city, setCity] = useState("");
  const [condition, setCondition] = useState<RentalCondition>("good");
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [deliveryPrice, setDeliveryPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return <Navigate to="/login" />;

  const selectedCategory = RENTAL_CATEGORIES.find((c) => c.id === categoryId);

  function isValid() {
    return (
      title.trim() && categoryId && subcategoryId && pricePerDay && city.trim()
    );
  }

  function handlePhotoUploadClick() {
    if (photos.length >= 3) return;
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 10 * 1024 * 1024;

    const validFiles = files.filter((file) => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          `${file.name} : format non supporté (.jpg, .png, .webp uniquement)`,
        );
        return false;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name} : fichier trop volumineux (max 10 Mo)`);
        return false;
      }
      return true;
    });

    const remaining = 3 - photos.length;
    const toProcess = validFiles.slice(0, remaining);

    for (const file of toProcess) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setPhotos((prev) => (prev.length < 3 ? [...prev, dataUrl] : prev));
      };
      reader.readAsDataURL(file);
    }

    // Reset so the same file can be re-selected if removed
    e.target.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!isValid() || !currentUser) return;
    setSubmitting(true);
    createListing({
      ownerId: currentUser.pseudo || String(currentUser.id),
      ownerCountry: selectedCountry ?? "FR",
      title: title.trim(),
      description: description.trim(),
      photos,
      categoryId,
      subcategoryId,
      pricePerDay: Number(pricePerDay),
      pricePerHalfDay: Number(pricePerHalfDay) || 0,
      deposit: Number(deposit) || 0,
      availabilityDates: [],
      city: city.trim(),
      condition,
      deliveryAvailable,
      deliveryPrice: deliveryAvailable ? Number(deliveryPrice) || 0 : 0,
      brand: brand.trim() || undefined,
      model: model.trim() || undefined,
      country: selectedCountry ?? "FR",
    });
    await new Promise((r) => setTimeout(r, 400));
    setSubmitting(false);
    toast.success(t.rental.form.success);
    void navigate({ to: "/rental" });
  }

  const conditionOptions: { value: RentalCondition; label: string }[] = [
    { value: "good", label: t.rental.listing.conditionGood },
    { value: "very_good", label: t.rental.listing.conditionVeryGood },
    { value: "new_item", label: t.rental.listing.conditionNew },
  ];

  return (
    <main className="min-h-screen bg-background" data-ocid="post_rental.page">
      {/* Header */}
      <div
        className="sticky top-16 z-10 px-4 py-3"
        style={{
          background: "oklch(0.99 0.005 80)",
          borderBottom: "1px solid oklch(0.90 0.04 70)",
        }}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            type="button"
            data-ocid="post_rental.back_button"
            onClick={() => void navigate({ to: "/rental" })}
            className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
            style={{ border: "1.5px solid oklch(0.88 0.05 70)" }}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1
            className="text-lg font-bold"
            style={{ color: "oklch(0.22 0.03 45)" }}
          >
            {t.rental.form.title}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Photos section */}
        <div>
          <Label
            className="text-sm font-semibold mb-2 block"
            style={{ color: "oklch(0.30 0.04 45)" }}
          >
            {t.rental.form.photos}
          </Label>
          <p className="text-xs mb-3" style={{ color: "oklch(0.55 0.04 60)" }}>
            {t.rental.form.photosHint}
          </p>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex gap-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="relative">
                {photos[index] ? (
                  <div
                    className="h-20 w-20 rounded-xl overflow-hidden relative"
                    style={{ border: "2px solid oklch(0.72 0.18 65)" }}
                  >
                    <img
                      src={photos[index]}
                      alt={`Apercu ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      data-ocid={`post_rental.remove_photo.${index + 1}`}
                      onClick={() => removePhoto(index)}
                      className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full flex items-center justify-center"
                      style={{
                        background: "oklch(0.20 0.02 30 / 0.75)",
                        color: "white",
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    data-ocid="post_rental.upload_button"
                    onClick={handlePhotoUploadClick}
                    disabled={photos.length >= 3}
                    className="h-20 w-20 rounded-xl flex flex-col items-center justify-center gap-1 transition-opacity"
                    style={{
                      border: "2px dashed oklch(0.82 0.08 70)",
                      background: "oklch(0.96 0.02 80)",
                      opacity: photos.length >= 3 ? 0.4 : 1,
                    }}
                  >
                    <ImagePlus
                      className="h-5 w-5"
                      style={{ color: "oklch(0.65 0.10 65)" }}
                    />
                    <span
                      className="text-xs"
                      style={{ color: "oklch(0.65 0.06 60)" }}
                    >
                      {index + 1}
                    </span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <Label
            htmlFor="rentalTitle"
            className="text-sm font-semibold mb-1.5 block"
            style={{ color: "oklch(0.30 0.04 45)" }}
          >
            {t.rental.form.itemTitle} *
          </Label>
          <Input
            id="rentalTitle"
            data-ocid="post_rental.title_input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder={t.rental.form.itemTitle}
            className="h-11"
          />
        </div>

        {/* Category */}
        <div>
          <Label
            className="text-sm font-semibold mb-2 block"
            style={{ color: "oklch(0.30 0.04 45)" }}
          >
            {t.rental.form.category} *
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {RENTAL_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                data-ocid="post_rental.category_toggle"
                onClick={() => {
                  setCategoryId(cat.id);
                  setSubcategoryId("");
                }}
                className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-xs font-medium transition-all"
                style={{
                  background:
                    categoryId === cat.id
                      ? "oklch(0.72 0.18 65)"
                      : "oklch(0.96 0.02 80)",
                  color:
                    categoryId === cat.id ? "white" : "oklch(0.40 0.06 60)",
                  border: `1.5px solid ${
                    categoryId === cat.id
                      ? "oklch(0.65 0.20 55)"
                      : "oklch(0.88 0.05 70)"
                  }`,
                }}
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="text-center leading-tight">
                  {
                    t.rental.categories[
                      cat.id as keyof typeof t.rental.categories
                    ]
                  }
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Subcategory */}
        {selectedCategory && (
          <div>
            <Label
              className="text-sm font-semibold mb-2 block"
              style={{ color: "oklch(0.30 0.04 45)" }}
            >
              {t.rental.form.subcategory} *
            </Label>
            <div className="flex flex-wrap gap-2">
              {selectedCategory.subcategories.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  data-ocid="post_rental.subcategory_toggle"
                  onClick={() => setSubcategoryId(sub)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background:
                      subcategoryId === sub
                        ? "oklch(0.72 0.18 65)"
                        : "oklch(0.95 0.03 75)",
                    color:
                      subcategoryId === sub ? "white" : "oklch(0.40 0.06 60)",
                    border: `1.5px solid ${
                      subcategoryId === sub
                        ? "oklch(0.65 0.20 55)"
                        : "oklch(0.88 0.05 70)"
                    }`,
                  }}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label
              htmlFor="priceDay"
              className="text-sm font-semibold mb-1.5 block"
              style={{ color: "oklch(0.30 0.04 45)" }}
            >
              {t.rental.listing.pricePerDay} (€) *
            </Label>
            <Input
              id="priceDay"
              data-ocid="post_rental.price_per_day_input"
              type="number"
              min="0"
              value={pricePerDay}
              onChange={(e) => setPricePerDay(e.target.value)}
              placeholder="0"
              className="h-11"
            />
          </div>
          <div>
            <Label
              htmlFor="priceHalf"
              className="text-sm font-semibold mb-1.5 block"
              style={{ color: "oklch(0.30 0.04 45)" }}
            >
              {t.rental.listing.pricePerHalfDay} (€)
            </Label>
            <Input
              id="priceHalf"
              data-ocid="post_rental.price_per_half_day_input"
              type="number"
              min="0"
              value={pricePerHalfDay}
              onChange={(e) => setPricePerHalfDay(e.target.value)}
              placeholder="0"
              className="h-11"
            />
          </div>
        </div>

        {/* Deposit and city */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label
              htmlFor="deposit"
              className="text-sm font-semibold mb-1.5 block"
              style={{ color: "oklch(0.30 0.04 45)" }}
            >
              {t.rental.listing.deposit} (€)
            </Label>
            <Input
              id="deposit"
              data-ocid="post_rental.deposit_input"
              type="number"
              min="0"
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
              placeholder="0"
              className="h-11"
            />
          </div>
          <div>
            <Label
              htmlFor="rentalCity"
              className="text-sm font-semibold mb-1.5 block"
              style={{ color: "oklch(0.30 0.04 45)" }}
            >
              {t.rental.listing.city} *
            </Label>
            <AddressAutocomplete
              id="rentalCity"
              data-ocid="post_rental.city_input"
              value={city}
              onChange={(val) => setCity(val)}
              onSelect={(result) => {
                const c =
                  result.address.city ??
                  result.address.town ??
                  result.address.village ??
                  city;
                setCity(c);
              }}
              placeholder="Paris, Lyon..."
              className="h-11"
              countryCode={selectedCountry?.toLowerCase()}
            />
          </div>
        </div>

        {/* Condition */}
        <div>
          <Label
            className="text-sm font-semibold mb-2 block"
            style={{ color: "oklch(0.30 0.04 45)" }}
          >
            {t.rental.listing.condition} *
          </Label>
          <div className="flex gap-2">
            {conditionOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                data-ocid="post_rental.condition_toggle"
                onClick={() => setCondition(opt.value)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background:
                    condition === opt.value
                      ? "oklch(0.72 0.18 65)"
                      : "oklch(0.95 0.03 75)",
                  color:
                    condition === opt.value ? "white" : "oklch(0.40 0.06 60)",
                  border: `1.5px solid ${
                    condition === opt.value
                      ? "oklch(0.65 0.20 55)"
                      : "oklch(0.88 0.05 70)"
                  }`,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Delivery toggle */}
        <div
          className="flex items-center justify-between rounded-xl p-4"
          style={{
            background: "oklch(0.97 0.02 80)",
            border: "1px solid oklch(0.90 0.04 70)",
          }}
        >
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: "oklch(0.30 0.04 45)" }}
            >
              {t.rental.listing.deliveryAvailable}
            </p>
          </div>
          <Switch
            data-ocid="post_rental.delivery_switch"
            checked={deliveryAvailable}
            onCheckedChange={setDeliveryAvailable}
          />
        </div>

        {deliveryAvailable && (
          <div>
            <Label
              htmlFor="deliveryPrice"
              className="text-sm font-semibold mb-1.5 block"
              style={{ color: "oklch(0.30 0.04 45)" }}
            >
              {t.rental.listing.deliveryPrice} (€)
            </Label>
            <Input
              id="deliveryPrice"
              data-ocid="post_rental.delivery_price_input"
              type="number"
              min="0"
              value={deliveryPrice}
              onChange={(e) => setDeliveryPrice(e.target.value)}
              placeholder="0"
              className="h-11"
            />
          </div>
        )}

        {/* Brand / model */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label
              htmlFor="brand"
              className="text-sm font-semibold mb-1.5 block"
              style={{ color: "oklch(0.30 0.04 45)" }}
            >
              {t.rental.listing.brand}
            </Label>
            <Input
              id="brand"
              data-ocid="post_rental.brand_input"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Bosch, Makita..."
              className="h-11"
            />
          </div>
          <div>
            <Label
              htmlFor="model"
              className="text-sm font-semibold mb-1.5 block"
              style={{ color: "oklch(0.30 0.04 45)" }}
            >
              {t.rental.listing.model}
            </Label>
            <Input
              id="model"
              data-ocid="post_rental.model_input"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="GSR 18V..."
              className="h-11"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <Label
            htmlFor="rentalDesc"
            className="text-sm font-semibold mb-1.5 block"
            style={{ color: "oklch(0.30 0.04 45)" }}
          >
            {t.rental.form.description}
          </Label>
          <Textarea
            id="rentalDesc"
            data-ocid="post_rental.description_textarea"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.rental.form.description}
            maxLength={2000}
          />
        </div>

        {/* Submit */}
        <Button
          data-ocid="post_rental.submit_button"
          onClick={() => void handleSubmit()}
          disabled={!isValid() || submitting}
          size="lg"
          className="w-full h-13 text-base font-semibold rounded-xl"
          style={{
            background:
              isValid() && !submitting
                ? "linear-gradient(135deg, oklch(0.72 0.18 65), oklch(0.65 0.20 55))"
                : "oklch(0.85 0.04 70)",
            color: "white",
            boxShadow:
              isValid() && !submitting
                ? "0 4px 20px oklch(0.65 0.20 55 / 0.3)"
                : "none",
          }}
        >
          {submitting ? "..." : t.rental.form.submit}
        </Button>
      </div>
    </main>
  );
}
