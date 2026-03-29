import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Heart } from "lucide-react";

export function FavoritesPage() {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();

  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-full max-w-xs mb-4 text-left">
        <button
          type="button"
          onClick={() => void navigate({ to: "/" })}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          data-ocid="favorites.back_button"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.common.back}
        </button>
      </div>
      <div
        className="h-20 w-20 rounded-full flex items-center justify-center mb-6"
        style={{ background: "oklch(0.72 0.18 65 / 0.12)" }}
      >
        <Heart className="h-9 w-9" style={{ color: "oklch(0.72 0.18 65)" }} />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">
        {t.nav.bottomFavorites}
      </h1>
      <p className="text-muted-foreground text-sm max-w-xs mb-8">
        {lang === "fr"
          ? "Retrouvez ici vos missions et professionnels favoris pour les retrouver facilement."
          : lang === "de"
            ? "Finden Sie hier Ihre Lieblingsmissionen und Fachleute."
            : lang === "es"
              ? "Encuentra aquí tus misiones y profesionales favoritos."
              : lang === "nl"
                ? "Vind hier uw favoriete missies en professionals."
                : lang === "it"
                  ? "Trova qui le tue missioni e professionisti preferiti."
                  : lang === "pt"
                    ? "Encontre aqui as suas missões e profissionais favoritos."
                    : "Find your favourite tasks and professionals here."}
      </p>
      <Button
        data-ocid="favorites.primary_button"
        onClick={() => navigate({ to: "/marketplace" })}
        className="rounded-xl px-6 h-11"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.72 0.18 65), oklch(0.65 0.20 55))",
        }}
      >
        Explorer la marketplace
      </Button>
    </main>
  );
}
