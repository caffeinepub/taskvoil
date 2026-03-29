import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { useNavigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";

export function FavoritesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
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
        Retrouvez ici vos missions et professionnels favoris pour les retrouver
        facilement.
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
