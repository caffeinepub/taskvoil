import { isProfileComplete } from "@/lib/auth-store";
import { useAuthStore } from "@/lib/auth-store";
import { useTranslation } from "@/lib/i18n";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

const TEXTS: Record<string, { warning: string; button: string }> = {
  fr: {
    warning:
      "Votre profil est incomplet. Sans ces informations, vous ne pourrez pas publier d'annonces ni être visible dans les recherches.",
    button: "Compléter mon profil →",
  },
  en: {
    warning:
      "Your profile is incomplete. Without this information, you won't be able to post ads or appear in search results.",
    button: "Complete my profile →",
  },
  de: {
    warning:
      "Ihr Profil ist unvollständig. Ohne diese Angaben können Sie keine Anzeigen schalten oder in Suchergebnissen erscheinen.",
    button: "Profil vervollständigen →",
  },
  es: {
    warning:
      "Tu perfil está incompleto. Sin esta información, no podrás publicar anuncios ni aparecer en los resultados de búsqueda.",
    button: "Completar mi perfil →",
  },
  it: {
    warning:
      "Il tuo profilo è incompleto. Senza queste informazioni, non potrai pubblicare annunci né apparire nei risultati di ricerca.",
    button: "Completa il mio profilo →",
  },
  pt: {
    warning:
      "O teu perfil está incompleto. Sem estas informações, não poderás publicar anúncios nem aparecer nos resultados de pesquisa.",
    button: "Completar o meu perfil →",
  },
  nl: {
    warning:
      "Uw profiel is onvolledig. Zonder deze informatie kunt u geen advertenties plaatsen of verschijnen in zoekresultaten.",
    button: "Profiel aanvullen →",
  },
  el: {
    warning:
      "Το προφίλ σας είναι ελλιπές. Χωρίς αυτές τις πληροφορίες, δεν θα μπορείτε να δημοσιεύσετε αγγελίες ή να εμφανιστείτε στα αποτελέσματα αναζήτησης.",
    button: "Συμπλήρωση προφίλ →",
  },
  ie: {
    warning:
      "Your profile is incomplete. Without this information, you won't be able to post ads or appear in search results.",
    button: "Complete my profile →",
  },
};

export function IncompleteProfileBanner() {
  const { currentUser } = useAuthStore();
  const { lang } = useTranslation();
  const navigate = useNavigate();

  if (!currentUser || isProfileComplete(currentUser)) return null;

  const txt = TEXTS[lang] ?? TEXTS.en;

  return (
    <div
      className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 shadow-sm"
      data-ocid="profile.incomplete.banner"
    >
      <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
      <p className="flex-1 text-sm text-amber-800 font-medium">
        ⚠️ {txt.warning}
      </p>
      <button
        type="button"
        onClick={() => void navigate({ to: "/profile/edit" })}
        className="shrink-0 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors whitespace-nowrap"
        data-ocid="profile.incomplete.button"
      >
        {txt.button}
      </button>
    </div>
  );
}
