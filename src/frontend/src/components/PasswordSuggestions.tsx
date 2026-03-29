import { Button } from "@/components/ui/button";
import { generatePasswordSuggestions } from "@/lib/password-validation";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

interface Props {
  onSelect: (password: string) => void;
  lang?: string;
}

const titles: Record<string, string> = {
  fr: "Suggestions de mots de passe forts",
  en: "Strong password suggestions",
  de: "Vorschläge für starke Passwörter",
  es: "Sugerencias de contraseñas seguras",
  it: "Suggerimenti per password sicure",
  pt: "Sugestões de palavras-passe fortes",
  nl: "Suggesties voor sterke wachtwoorden",
  el: "Strong password suggestions",
};

const regenerateLabels: Record<string, string> = {
  fr: "Régénérer",
  en: "Regenerate",
  de: "Neu generieren",
  es: "Regenerar",
  it: "Rigenerare",
  pt: "Regenerar",
  nl: "Opnieuw genereren",
  el: "Regenerate",
};

export function PasswordSuggestions({ onSelect, lang = "fr" }: Props) {
  const [suggestions, setSuggestions] = useState<string[]>(() =>
    generatePasswordSuggestions(),
  );

  function regenerate() {
    setSuggestions(generatePasswordSuggestions());
  }

  const title = titles[lang] ?? titles.fr;
  const regenerateLabel = regenerateLabels[lang] ?? regenerateLabels.fr;

  return (
    <div className="mt-2 p-3 rounded-lg bg-muted/50 border border-border/40 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">
          {title}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={regenerate}
          className="h-6 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="h-3 w-3" />
          {regenerateLabel}
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((pw) => (
          <button
            key={pw}
            type="button"
            onClick={() => onSelect(pw)}
            className="font-mono text-xs px-2.5 py-1 rounded-md bg-background border border-border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
          >
            {pw}
          </button>
        ))}
      </div>
    </div>
  );
}
