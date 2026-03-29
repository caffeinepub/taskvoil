import { BookingCalendar } from "@/components/calendar/BookingCalendar";
import { BookingRequestModal } from "@/components/calendar/BookingRequestModal";
import { CallModal } from "@/components/call/CallModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";
import { useChatStore } from "@/lib/chat-store";
import { categoryEmojis } from "@/lib/demo-data";
import { useTranslation } from "@/lib/i18n";
import { useKYCStore } from "@/lib/kyc-store";
import {
  detectContactInfo,
  sanitizeContactInfo,
  useProfileStore,
} from "@/lib/profile-store";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  Building2,
  Calendar,
  Check,
  Image,
  Lock,
  MapPin,
  MessageSquare,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Star,
  User,
} from "lucide-react";
import { useState } from "react";

// Contact-info warning banner shown on profiles with violations
function ContactInfoViolationBanner({ lang: _lang }: { lang: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 mb-4">
      <ShieldAlert className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-destructive">
          {t.ui.uiProfileFlagged}
        </p>
        <p className="text-xs text-destructive/80 mt-0.5">
          {t.ui.uiContactHiddenProfile}
        </p>
      </div>
    </div>
  );
}

export function ProDetailPage() {
  const { id } = useParams({ strict: false }) as { id?: string };
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const { getOrCreateConversation } = useChatStore();
  const { getProfile } = useProfileStore();
  const { getKYCForUser } = useKYCStore();
  const { currentUser } = useAuthStore();
  const profileImages = id ? getProfile(id) : undefined;
  // Use currentUser data if viewing own profile, otherwise show not found
  const isOwnProfile = currentUser && String(currentUser.id) === id;
  const pro =
    isOwnProfile && currentUser
      ? {
          id: String(currentUser.id),
          firstName: currentUser.firstName ?? "",
          lastName: currentUser.lastName ?? "",
          pseudo: currentUser.pseudo ?? "",
          companyName: currentUser.companyName ?? "",
          bio: currentUser.businessDescription ?? "",
          avatar: profileImages?.avatarDataUrl ?? "",
          coverImage: profileImages?.coverDataUrl ?? "",
          city: currentUser.city ?? "",
          country: currentUser.country ?? "",
          role: currentUser.role,
          rating: 0,
          reviewCount: 0,
          serviceRadius: Number(currentUser.coverageArea ?? 20),
          categories: currentUser.serviceCategories ?? [],
          skills: [] as string[],
          languages: [] as string[],
          website: currentUser.website ?? "",
          isVerified: currentUser.verificationStatus === "verified",
          isPremium: false,
          radius: 20,
          description: currentUser.businessDescription ?? "",
          totalMissions: 0,
          hourlyRate: 0,
          category: (currentUser.serviceCategories ?? [])[0] ?? "",
          yearsExperience: 0,
        }
      : null;
  const [callOpen, setCallOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState<string | null>(null);
  const [bookingTime, setBookingTime] = useState<string | null>(null);
  const proKYC = getKYCForUser(id ?? "");

  function handleContact() {
    if (!pro || !id) return;
    const clientId = currentUser ? String(currentUser.id) : "guest";
    const clientName =
      currentUser?.pseudo ?? currentUser?.firstName ?? "Client";
    const convId = getOrCreateConversation(
      undefined,
      clientId,
      id,
      undefined,
      clientName,
      `${pro.firstName} ${pro.lastName}`,
    );
    void navigate({ to: "/messages", search: { conv: convId } });
  }

  if (!pro) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">👷</p>
          <h2 className="font-display text-xl font-bold text-foreground mb-2">
            {t.ui.uiProNotFound}
          </h2>
          <Button
            variant="outline"
            onClick={() => void navigate({ to: "/pros" })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.common.back}
          </Button>
        </div>
      </main>
    );
  }

  const userId = `pro_${pro.id}`;
  const images = getProfile(userId);

  // Check description for contact info violations
  const { hasContact: descHasContact } = detectContactInfo(pro.description);
  const sanitizedDescription = descHasContact
    ? sanitizeContactInfo(pro.description)
    : pro.description;

  const stats = [
    {
      value: pro.totalMissions.toString(),
      label: t.proDetail.missionsCompleted,
    },
    {
      value: `${pro.yearsExperience} ${lang === "fr" || lang === "lu" ? "ans" : lang === "de" ? "J." : "yrs"}`,
      label: t.proDetail.yearsExperience,
    },
    { value: "97%", label: t.proDetail.satisfactionRate },
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Back */}
      <div className="container mx-auto px-4 pt-6">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground mb-4"
          onClick={() => void navigate({ to: "/pros" })}
          data-ocid="pro.back.button"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.common.back}
        </Button>
      </div>

      {/* ── LinkedIn-style Cover + Avatar ─────────────────────────────────── */}
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl card-shadow border border-border/50 overflow-hidden mb-6">
          {/* Cover Image */}
          <div className="relative h-36 md:h-52 bg-primary-gradient overflow-hidden">
            {images.coverDataUrl ? (
              <img
                src={images.coverDataUrl}
                alt="cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-primary via-secondary to-primary/60" />
            )}
            {/* Premium / Verified badges top-right */}
            <div className="absolute top-3 right-3 flex gap-2">
              {pro.isPremium && (
                <Badge className="bg-warning/90 text-foreground border-warning/30 shadow">
                  ⭐ {t.common.premium}
                </Badge>
              )}
              {pro.isVerified && (
                <Badge className="bg-secondary/90 text-white border-secondary/30 shadow">
                  <Check className="h-3 w-3 mr-1" />
                  {t.common.verified}
                </Badge>
              )}
            </div>
          </div>

          {/* Avatar overlapping cover */}
          <div className="px-6 pb-6">
            <div className="relative -mt-12 md:-mt-16 mb-4 flex items-end justify-between">
              {/* Avatar */}
              <div className="relative z-10 w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
                {images.avatarDataUrl ? (
                  <img
                    src={images.avatarDataUrl}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-2xl md:text-3xl select-none">
                    {pro.firstName[0]}
                    {pro.lastName[0]}
                  </span>
                )}
              </div>

              {/* Action buttons (right side, vertically aligned with avatar bottom) */}
              <div className="flex gap-2 flex-wrap justify-end pb-1">
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                  onClick={() => void navigate({ to: "/marketplace" })}
                  data-ocid="pro.propose_mission.button"
                >
                  {t.proDetail.proposeMission}
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 border-primary/30 text-primary hover:bg-primary/5"
                  onClick={handleContact}
                  data-ocid="pro.send_message.button"
                >
                  <MessageSquare className="h-4 w-4" />
                  Message
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 border-secondary/40 text-secondary hover:bg-secondary/5"
                  onClick={() => setCallOpen(true)}
                  data-ocid="pro.call.button"
                >
                  <Phone className="h-4 w-4" />
                  {t.ui.uiCallBtn}
                </Button>
              </div>
            </div>

            {/* Name & meta */}
            <div className="mb-2">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-display text-2xl font-bold text-foreground">
                  {pro.companyName}
                </h1>
                {proKYC?.status === "verified" && (
                  <Badge className="bg-secondary/20 text-secondary border-secondary/30 gap-1 text-xs">
                    <ShieldCheck className="h-3 w-3" />
                    {t.kyc.badge}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {pro.firstName} {pro.lastName}
              </p>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                {categoryEmojis[pro.category]}
                <span className="capitalize font-medium text-primary">
                  {(t.categories as Record<string, string>)[pro.category]}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {pro.city} ({pro.radius} km)
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <strong>{pro.rating}</strong>/5
                <span>({pro.totalMissions} avis)</span>
              </span>
              <span className="font-bold text-primary">
                {pro.hourlyRate}€{t.common.per_hour}
              </span>
            </div>
          </div>
        </div>

        {/* Violation banner */}
        {descHasContact && <ContactInfoViolationBanner lang={lang} />}

        <div className="grid lg:grid-cols-3 gap-6 pb-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-white rounded-xl p-6 card-shadow border border-border/50">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                {t.proDetail.about}
              </h2>
              <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
                {sanitizedDescription}
              </p>
              {descHasContact && (
                <div className="mt-3 flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {t.ui.uiContactHidden}
                </div>
              )}
            </div>

            {/* Portfolio */}
            <div className="bg-white rounded-xl p-6 card-shadow border border-border/50">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                {t.proDetail.portfolio}
              </h2>
              <div className="bg-muted/50 rounded-xl p-12 text-center border-2 border-dashed border-border">
                <Image className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-semibold text-foreground/80 mb-1">
                  {t.proDetail.portfolioEmpty}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t.proDetail.portfolioEmptyDesc}
                </p>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-xl p-6 card-shadow border border-border/50">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                {t.proDetail.reviews}
              </h2>
              <div className="text-center py-8 text-muted-foreground">
                <Star className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                <p>{t.proDetail.noReviews}</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Stats */}
            <div className="bg-white rounded-xl p-5 card-shadow border border-border/50">
              <h3 className="font-display font-bold text-base text-foreground mb-4">
                {t.proDetail.stats}
              </h3>
              <div className="space-y-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-muted-foreground">
                      {stat.label}
                    </span>
                    <span className="font-bold text-primary">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Area */}
            <div className="bg-white rounded-xl p-5 card-shadow border border-border/50">
              <h3 className="font-display font-bold text-base text-foreground mb-3">
                {t.proDetail.interventionArea}
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span>
                  {pro.city} + {pro.radius} km
                </span>
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-xl p-5 card-shadow border border-border/50">
              <h3 className="font-display font-bold text-base text-foreground mb-3">
                {t.ui.uiCertifications}
              </h3>
              <div className="space-y-2">
                {pro.isVerified && (
                  <div className="flex items-center gap-2 text-sm text-secondary">
                    <Award className="h-4 w-4" />
                    <span>{t.ui.uiVerifiedIdentity}</span>
                  </div>
                )}
                {proKYC?.status === "verified" && (
                  <div className="flex items-center gap-2 text-sm text-secondary">
                    <ShieldCheck className="h-4 w-4" />
                    <span>{t.kyc.badge}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-secondary" />
                  <span>{t.ui.uiProfLiability}</span>
                </div>
              </div>
            </div>

            {/* Contact info reminder */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-700 mb-1">
                    {t.ui.uiForYourSecurity}
                  </p>
                  <p className="text-xs text-amber-600">
                    {t.ui.uiSecurityWarning}
                  </p>
                </div>
              </div>
            </div>

            {/* Company */}
            <div className="bg-white rounded-xl p-5 card-shadow border border-border/50">
              <h3 className="font-display font-bold text-base text-foreground mb-3">
                {t.ui.uiCompany}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4 text-primary" />
                <span>{pro.companyName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Availability & Booking */}
      <div className="container mx-auto px-4 pb-8 max-w-2xl">
        <div className="bg-white rounded-xl p-6 card-shadow border border-border/50">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">
            {lang === "fr"
              ? "Disponibilitu00e9s & Ru00e9servation"
              : lang === "de"
                ? "Verfu00fcgbarkeit & Buchung"
                : lang === "es"
                  ? "Disponibilidad & Reserva"
                  : lang === "it"
                    ? "Disponibilitu00e0 & Prenotazione"
                    : lang === "pt"
                      ? "Disponibilidade & Reserva"
                      : lang === "nl"
                        ? "Beschikbaarheid & Boeking"
                        : "Availability & Booking"}
          </h2>
          {!currentUser ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
              <Lock className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                {t.ui.uiLoginCalendar}
              </p>
              <Button
                size="sm"
                onClick={() => void navigate({ to: "/login" })}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {t.login.loginBtn}
              </Button>
            </div>
          ) : (
            <BookingCalendar
              proId={`pro_${pro.id}`}
              proCountry={pro.country ?? "FR"}
              onSelectDate={(date, time) => {
                setBookingDate(date);
                setBookingTime(time);
              }}
            />
          )}
          {String(currentUser?.id) === `pro_${pro.id}` && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void navigate({ to: "/pro/schedule" })}
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                {t.ui.uiManageSchedule}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Booking Request Modal */}
      {bookingDate && bookingTime && currentUser && pro && (
        <BookingRequestModal
          proId={`pro_${pro.id}`}
          proName={pro.companyName ?? `${pro.firstName} ${pro.lastName}`}
          clientId={String(currentUser.id)}
          clientName={currentUser.pseudo ?? currentUser.firstName ?? "Client"}
          selectedDate={bookingDate}
          selectedTime={bookingTime}
          onClose={() => {
            setBookingDate(null);
            setBookingTime(null);
          }}
        />
      )}
      {/* Call Modal */}
      {pro && (
        <CallModal
          isOpen={callOpen}
          onClose={() => setCallOpen(false)}
          contactName={`${pro.firstName} ${pro.lastName}`}
          contactRole="pro"
        />
      )}
    </main>
  );
}
