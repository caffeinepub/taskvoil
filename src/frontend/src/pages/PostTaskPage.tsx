import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isProfileComplete, useAuthStore } from "@/lib/auth-store";
import { useCountryStore } from "@/lib/country-store";
import { type N1Category, getN2ForN1, n1Categories } from "@/lib/demo-data";
import { useMissionStore } from "@/lib/mission-store";

import { useTranslation } from "@/lib/i18n";
import { MAX_LENGTHS, sanitizeText } from "@/lib/sanitize";
import { useTurnstile } from "@/lib/turnstile";
import { validateUpload } from "@/lib/upload-validation";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Film,
  ImageIcon,
  Lock,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Max video size: 50 MB
const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024;

type Step = 1 | 2 | 3;

type MediaFile = {
  id: string;
  file: File;
  preview: string;
  type: "photo" | "video";
};

function useSearchParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    n1: params.get("n1") ?? "",
    n2: params.get("n2") ?? "",
  };
}

export function PostTaskPage() {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const { currentUser } = useAuthStore();
  const { createMission } = useMissionStore();
  const { selectedCountry } = useCountryStore();

  // Turnstile for anti-bot on mission submission
  const { token: turnstileToken } = useTurnstile("turnstile-posttask");
  void turnstileToken;

  const [selectedN1, setSelectedN1] = useState<string>(searchParams.n1 ?? "");
  const [selectedN2, setSelectedN2] = useState<string>(searchParams.n2 ?? "");
  const [step, setStep] = useState<Step>(() => {
    if (searchParams.n1 && searchParams.n2) return 3;
    if (searchParams.n1) return 2;
    return 1;
  });

  const [form, setForm] = useState({
    title: "",
    description: "",
    city: "",
    budgetMin: "",
    budgetMax: "",
    scheduledDate: "",
  });

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  function handleAddPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const photoCount = mediaFiles.filter((m) => m.type === "photo").length;
    const validFiles: File[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      const result = validateUpload(file, {
        errorSize: t.upload.errorSize,
        errorType: t.upload.errorType,
      });
      if (!result.valid) {
        toast.error(result.error);
        continue;
      }
      validFiles.push(file);
    }

    const newFiles: MediaFile[] = validFiles
      .slice(0, 5 - photoCount)
      .map((file) => ({
        id: `${Date.now()}-${file.name}`,
        file,
        preview: URL.createObjectURL(file),
        type: "photo" as const,
      }));
    setMediaFiles((prev) => [...prev, ...newFiles]);
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  function handleAddVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate: must be a video
    if (!file.type.startsWith("video/")) {
      toast.error(
        lang === "fr"
          ? "Format non supporté. Seules les vidéos sont acceptées."
          : "Unsupported format. Only video files are accepted.",
      );
      if (videoInputRef.current) videoInputRef.current.value = "";
      return;
    }

    // Validate: max 50 MB
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      toast.error(
        lang === "fr"
          ? "La vidéo dépasse la limite de 50 Mo."
          : "Video exceeds the 50 MB limit.",
      );
      if (videoInputRef.current) videoInputRef.current.value = "";
      return;
    }

    const newFile: MediaFile = {
      id: `${Date.now()}-${file.name}`,
      file,
      preview: URL.createObjectURL(file),
      type: "video",
    };
    setMediaFiles((prev) => [
      ...prev.filter((m) => m.type !== "video"),
      newFile,
    ]);
    if (videoInputRef.current) videoInputRef.current.value = "";
  }

  function removeMedia(id: string) {
    setMediaFiles((prev) => {
      const removed = prev.find((m) => m.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((m) => m.id !== id);
    });
  }

  // Update URL when step/selection changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedN1) params.set("n1", selectedN1);
    if (selectedN2) params.set("n2", selectedN2);
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.replaceState(null, "", newUrl);
  }, [selectedN1, selectedN2]);

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSelectN1(cat: N1Category) {
    setSelectedN1(cat.key);
    setSelectedN2("");
    setStep(2);
  }

  function handleSelectN2(n2Key: string) {
    setSelectedN2(n2Key);
    setStep(3);
  }

  function handleBack() {
    if (step === 2) {
      setStep(1);
      setSelectedN2("");
    } else if (step === 3) {
      setStep(2);
      setSelectedN2("");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) {
      void navigate({ to: "/login" });
      return;
    }
    const sanitizedTitle = sanitizeText(form.title, MAX_LENGTHS.missionTitle);
    const sanitizedDescription = sanitizeText(
      form.description,
      MAX_LENGTHS.missionDescription,
    );
    createMission({
      title: sanitizedTitle,
      description: sanitizedDescription,
      category: selectedN1,
      subcategory: selectedN2 || undefined,
      city: form.city,
      country: selectedCountry ?? currentUser.country,
      budgetMin: Number(form.budgetMin) || 0,
      budgetMax: Number(form.budgetMax) || 0,
      date: form.scheduledDate || undefined,
      status: "open",
      authorId: String(currentUser.id),
      authorPseudo:
        currentUser.pseudo ?? currentUser.firstName ?? "Utilisateur",
      authorRole: currentUser.role as "client" | "pro",
    });
    for (const m of mediaFiles) URL.revokeObjectURL(m.preview);
    toast.success(t.postTask.success);
    if (currentUser.role === "pro") {
      void navigate({ to: "/dashboard/pro" });
    } else {
      void navigate({ to: "/dashboard/client" });
    }
  }

  const n1Cat = n1Categories.find((c) => c.key === selectedN1);
  const n2s = selectedN1 ? getN2ForN1(selectedN1) : [];
  const selectedN2Data = n2s.find((n) => n.key === selectedN2);

  const steps = [
    { num: 1, label: lang === "fr" ? "Cat\u00e9gorie" : "Category" },
    { num: 2, label: lang === "fr" ? "Type" : "Type" },
    { num: 3, label: lang === "fr" ? "D\u00e9tails" : "Details" },
  ];

  // Full address guard — required before posting
  const needsAddress =
    !currentUser?.fullAddress?.trim() && currentUser?.role !== "pro";

  // Profile completion guard
  if (!isProfileComplete(currentUser)) {
    const blockMsg = {
      fr: {
        title: "Complétez votre profil pour publier une annonce",
        desc: "Vous devez renseigner vos informations personnelles avant de pouvoir poster une demande de service.",
        btn: "Compléter mon profil",
      },
      en: {
        title: "Complete your profile to post a task",
        desc: "You must fill in your personal information before you can post a service request.",
        btn: "Complete my profile",
      },
      de: {
        title: "Vervollständigen Sie Ihr Profil, um eine Anzeige aufzugeben",
        desc: "Sie müssen Ihre persönlichen Daten ausfüllen, bevor Sie eine Serviceanfrage stellen können.",
        btn: "Profil vervollständigen",
      },
      es: {
        title: "Completa tu perfil para publicar un anuncio",
        desc: "Debes rellenar tu información personal antes de publicar una solicitud de servicio.",
        btn: "Completar mi perfil",
      },
      it: {
        title: "Completa il profilo per pubblicare un annuncio",
        desc: "Devi inserire le tue informazioni personali prima di poter pubblicare una richiesta di servizio.",
        btn: "Completa il mio profilo",
      },
      pt: {
        title: "Completa o teu perfil para publicar um anúncio",
        desc: "Deves preencher as tuas informações pessoais antes de publicares um pedido de serviço.",
        btn: "Completar o meu perfil",
      },
      nl: {
        title: "Vul uw profiel in om een advertentie te plaatsen",
        desc: "U moet uw persoonlijke gegevens invullen voordat u een serviceverzoek kunt plaatsen.",
        btn: "Profiel aanvullen",
      },
      ie: {
        title: "Complete your profile to post a task",
        desc: "You must fill in your personal information before you can post a service request.",
        btn: "Complete my profile",
      },
      el: {
        title: "Συμπληρώστε το προφίλ σας για να δημοσιεύσετε αγγελία",
        desc: "Πρέπει να συμπληρώσετε τα προσωπικά σας στοιχεία πριν δημοσιεύσετε αίτημα υπηρεσίας.",
        btn: "Συμπλήρωση προφίλ",
      },
    } as Record<string, { title: string; desc: string; btn: string }>;
    const bm = blockMsg[lang] ?? blockMsg.en;
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div
          className="max-w-md w-full text-center py-16"
          data-ocid="posttask.blocked.panel"
        >
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <Lock className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="font-display text-xl font-bold text-foreground mb-3">
            {bm.title}
          </h1>
          <p className="text-muted-foreground text-sm mb-6">{bm.desc}</p>
          <button
            type="button"
            onClick={() => void navigate({ to: "/profile/edit" })}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            data-ocid="posttask.complete.profile.button"
          >
            {bm.btn}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-white border-b border-border py-10">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            {t.postTask.title}
          </h1>

          {/* Progress indicator */}
          <div className="flex items-center gap-0 mt-6">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      step > s.num
                        ? "bg-secondary text-secondary-foreground"
                        : step === s.num
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step > s.num ? <Check className="h-4 w-4" /> : s.num}
                  </div>
                  <span
                    className={`text-xs whitespace-nowrap ${
                      step === s.num
                        ? "text-primary font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`w-16 sm:w-24 h-0.5 mb-5 transition-colors ${
                      step > s.num ? "bg-secondary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto">
          {/* Step 1: Choose N1 */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                {t.postTask.step1Title}
              </h2>
              <p className="text-muted-foreground mb-8">
                {t.postTask.step1Subtitle}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {n1Categories
                  .sort((a, b) => a.order - b.order)
                  .map((cat) => {
                    const label = lang === "fr" ? cat.labelFR : cat.labelEN;
                    return (
                      <button
                        type="button"
                        key={cat.key}
                        onClick={() => handleSelectN1(cat)}
                        className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-white card-shadow hover:card-shadow-hover hover:border-primary/40 border border-border/50 transition-all duration-200 cursor-pointer text-center"
                      >
                        <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                          {cat.emoji}
                        </span>
                        <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                          {label}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Step 2: Choose N2 */}
          {step === 2 && n1Cat && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
                <span className="text-2xl">{n1Cat.emoji}</span>
                <div>
                  <div className="font-bold text-foreground">
                    {lang === "fr" ? n1Cat.labelFR : n1Cat.labelEN}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleBack}
                  className="ml-auto text-xs text-primary hover:underline font-medium"
                >
                  {t.postTask.back}
                </button>
              </div>

              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                {t.postTask.step2Title}
              </h2>
              <p className="text-muted-foreground mb-8">
                {t.postTask.step2Subtitle}
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                {n2s.map((n2) => {
                  const n2Label = lang === "fr" ? n2.labelFR : n2.labelEN;
                  return (
                    <button
                      type="button"
                      key={n2.key}
                      onClick={() => handleSelectN2(n2.key)}
                      className="flex items-center justify-between gap-2 px-5 py-4 rounded-xl bg-white border border-border/60 hover:border-primary/40 hover:bg-primary/5 card-shadow transition-all duration-150 text-left group"
                    >
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {n2Label}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    </button>
                  );
                })}
              </div>

              <Button
                variant="ghost"
                onClick={handleBack}
                className="mt-6 gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> {t.postTask.back}
              </Button>
            </div>
          )}

          {/* Step 3: Task details form */}
          {step === 3 && (
            <div className="animate-fade-in">
              {/* Selected category breadcrumb */}
              {n1Cat && (
                <div className="flex items-center gap-2 mb-6 flex-wrap">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                    <span className="text-base">{n1Cat.emoji}</span>
                    <span className="text-sm font-semibold text-primary">
                      {lang === "fr" ? n1Cat.labelFR : n1Cat.labelEN}
                    </span>
                  </div>
                  {selectedN2Data && (
                    <>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <div className="px-3 py-1.5 bg-secondary/10 rounded-full">
                        <span className="text-sm font-semibold text-secondary">
                          {lang === "fr"
                            ? selectedN2Data.labelFR
                            : selectedN2Data.labelEN}
                        </span>
                      </div>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={handleBack}
                    className="ml-auto text-xs text-primary hover:underline font-medium"
                  >
                    {t.postTask.back}
                  </button>
                </div>
              )}

              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                {t.postTask.step3Title}
              </h2>
              <p className="text-muted-foreground mb-8">
                {t.postTask.step3Subtitle}
              </p>

              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl p-6 md:p-8 card-shadow border border-border/50"
              >
                <div className="space-y-5">
                  {/* Title with character counter */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="task-title">{t.postTask.taskTitle}</Label>
                      <span
                        className={`text-xs ${
                          form.title.length > MAX_LENGTHS.missionTitle
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        {form.title.length}/{MAX_LENGTHS.missionTitle}
                      </span>
                    </div>
                    <Input
                      id="task-title"
                      data-ocid="posttask.title.input"
                      required
                      value={form.title}
                      onChange={(e) =>
                        updateForm(
                          "title",
                          e.target.value.slice(0, MAX_LENGTHS.missionTitle),
                        )
                      }
                      placeholder={t.postTask.taskTitlePlaceholder}
                    />
                  </div>

                  {/* Description with character counter */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="task-desc">
                        {t.postTask.description}
                      </Label>
                      <span
                        className={`text-xs ${
                          form.description.length >
                          MAX_LENGTHS.missionDescription
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        {form.description.length}/
                        {MAX_LENGTHS.missionDescription}
                      </span>
                    </div>
                    <Textarea
                      id="task-desc"
                      data-ocid="posttask.description.textarea"
                      required
                      value={form.description}
                      onChange={(e) =>
                        updateForm(
                          "description",
                          e.target.value.slice(
                            0,
                            MAX_LENGTHS.missionDescription,
                          ),
                        )
                      }
                      placeholder={t.postTask.descriptionPlaceholder}
                      rows={4}
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-1.5">
                    <Label htmlFor="task-city">{t.postTask.city}</Label>
                    <AddressAutocomplete
                      id="task-city"
                      data-ocid="posttask.city.input"
                      value={form.city}
                      onChange={(val) => updateForm("city", val)}
                      onSelect={(result) => {
                        const city =
                          result.address.city ??
                          result.address.town ??
                          result.address.village ??
                          form.city;
                        updateForm("city", city);
                      }}
                      placeholder={t.postTask.cityPlaceholder}
                      countryCode={selectedCountry?.toLowerCase()}
                    />
                  </div>

                  {/* Budget */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="budget-min">{t.postTask.budgetMin}</Label>
                      <Input
                        id="budget-min"
                        data-ocid="posttask.budget_min.input"
                        type="number"
                        min={0}
                        value={form.budgetMin}
                        onChange={(e) =>
                          updateForm("budgetMin", e.target.value)
                        }
                        placeholder="50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="budget-max">{t.postTask.budgetMax}</Label>
                      <Input
                        id="budget-max"
                        data-ocid="posttask.budget_max.input"
                        type="number"
                        min={0}
                        value={form.budgetMax}
                        onChange={(e) =>
                          updateForm("budgetMax", e.target.value)
                        }
                        placeholder="200"
                      />
                    </div>
                  </div>

                  {/* Scheduled Date */}
                  <div className="space-y-1.5">
                    <Label htmlFor="scheduled-date">
                      {t.postTask.scheduledDate}
                    </Label>
                    <Input
                      id="scheduled-date"
                      data-ocid="posttask.date.input"
                      type="date"
                      value={form.scheduledDate}
                      onChange={(e) =>
                        updateForm("scheduledDate", e.target.value)
                      }
                    />
                  </div>

                  {/* Media Upload */}
                  <div className="space-y-3 rounded-xl border border-dashed border-border bg-muted/30 p-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-primary" />
                        {t.postTask.mediaTitle}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t.postTask.mediaSubtitle}
                      </p>
                    </div>

                    {/* Photo previews */}
                    {mediaFiles.filter((m) => m.type === "photo").length >
                      0 && (
                      <div className="flex flex-wrap gap-2">
                        {mediaFiles
                          .filter((m) => m.type === "photo")
                          .map((m) => (
                            <div key={m.id} className="relative group">
                              <img
                                src={m.preview}
                                alt="preview"
                                className="w-16 h-16 object-cover rounded-lg border border-border"
                              />
                              <button
                                type="button"
                                onClick={() => removeMedia(m.id)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Video preview */}
                    {mediaFiles.find((m) => m.type === "video") && (
                      <div className="flex items-center gap-3 bg-white rounded-lg p-2.5 border border-border">
                        <Film className="h-5 w-5 text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">
                            {
                              mediaFiles.find((m) => m.type === "video")?.file
                                .name
                            }
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(
                              (mediaFiles.find((m) => m.type === "video")?.file
                                .size ?? 0) /
                              1024 /
                              1024
                            ).toFixed(1)}{" "}
                            Mo
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            removeMedia(
                              mediaFiles.find((m) => m.type === "video")?.id ??
                                "",
                            )
                          }
                          className="text-destructive hover:text-destructive/80 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {/* Upload buttons */}
                    <div className="flex flex-wrap gap-2">
                      {mediaFiles.filter((m) => m.type === "photo").length <
                        5 && (
                        <>
                          <input
                            ref={photoInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            className="hidden"
                            onChange={handleAddPhotos}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-2 text-xs"
                            onClick={() => photoInputRef.current?.click()}
                            data-ocid="posttask.photos.upload_button"
                          >
                            <ImageIcon className="h-3.5 w-3.5" />
                            {t.postTask.mediaPhotos}
                            {mediaFiles.filter((m) => m.type === "photo")
                              .length > 0 && (
                              <span className="text-muted-foreground">
                                (
                                {
                                  mediaFiles.filter((m) => m.type === "photo")
                                    .length
                                }
                                /5)
                              </span>
                            )}
                          </Button>
                        </>
                      )}

                      {!mediaFiles.find((m) => m.type === "video") && (
                        <>
                          <input
                            ref={videoInputRef}
                            type="file"
                            accept="video/mp4,video/quicktime,video/avi,video/*"
                            className="hidden"
                            onChange={handleAddVideo}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-2 text-xs"
                            onClick={() => videoInputRef.current?.click()}
                            data-ocid="posttask.video.upload_button"
                          >
                            <Film className="h-3.5 w-3.5" />
                            {t.postTask.mediaVideo}
                          </Button>
                        </>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground/70 italic">
                      {t.postTask.mediaTip}
                    </p>
                  </div>
                </div>

                {/* Turnstile invisible widget */}
                <div id="turnstile-posttask" className="h-0 overflow-hidden" />

                {/* Form actions */}
                <div className="flex gap-3 mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="h-12 gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" /> {t.postTask.back}
                  </Button>
                  {needsAddress && (
                    <div className="w-full rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800 flex items-start gap-2">
                      <span className="flex-shrink-0">⚠️</span>
                      <span>
                        {lang === "fr"
                          ? "Votre adresse complète est requise pour publier une demande. "
                          : lang === "de"
                            ? "Ihre vollständige Adresse ist erforderlich, um eine Anfrage zu veröffentlichen. "
                            : lang === "es"
                              ? "Su dirección completa es necesaria para publicar una solicitud. "
                              : lang === "it"
                                ? "Il suo indirizzo completo è necessario per pubblicare una richiesta. "
                                : lang === "pt"
                                  ? "O seu endereço completo é necessário para publicar um pedido. "
                                  : lang === "nl"
                                    ? "Uw volledige adres is vereist om een aanvraag te publiceren. "
                                    : "Your full address is required before posting a task. "}
                        <a
                          href="/profile/edit"
                          className="underline font-semibold"
                        >
                          {lang === "fr"
                            ? "Compléter mon profil →"
                            : lang === "de"
                              ? "Profil vervollständigen →"
                              : lang === "es"
                                ? "Completar mi perfil →"
                                : lang === "it"
                                  ? "Completa il profilo →"
                                  : lang === "pt"
                                    ? "Completar perfil →"
                                    : lang === "nl"
                                      ? "Profiel aanvullen →"
                                      : "Complete my profile →"}
                        </a>
                      </span>
                    </div>
                  )}
                  <Button
                    type="submit"
                    disabled={needsAddress}
                    data-ocid="posttask.submit.button"
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-12 font-semibold disabled:opacity-50"
                  >
                    {t.postTask.submit}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
