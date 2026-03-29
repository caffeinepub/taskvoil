import { validatePassword } from "@/lib/password-validation";
import { useMemo } from "react";

interface Props {
  password: string;
  userInfo?: { firstName?: string; lastName?: string; email?: string };
  lang?: string;
}

const strengthLabels: Record<string, string[]> = {
  fr: ["Très faible", "Faible", "Moyen", "Fort", "Très fort"],
  en: ["Very weak", "Weak", "Fair", "Strong", "Very strong"],
  de: ["Sehr schwach", "Schwach", "Mittel", "Stark", "Sehr stark"],
  es: ["Muy débil", "Débil", "Regular", "Fuerte", "Muy fuerte"],
  it: ["Molto debole", "Debole", "Discreto", "Forte", "Molto forte"],
  pt: ["Muito fraca", "Fraca", "Razoável", "Forte", "Muito forte"],
  nl: ["Zeer zwak", "Zwak", "Redelijk", "Sterk", "Zeer sterk"],
  el: ["Very weak", "Weak", "Fair", "Strong", "Very strong"],
};

const errorMessages: Record<string, Record<string, string>> = {
  fr: {
    passwordTooShort: "Minimum 12 caractères requis",
    passwordNoUppercase: "Ajoutez au moins une majuscule",
    passwordNoLowercase: "Ajoutez au moins une minuscule",
    passwordNoDigit: "Ajoutez au moins un chiffre",
    passwordNoSpecial: "Ajoutez au moins un caractère spécial (!@#$%&*)",
    passwordRepeated: "Évitez les répétitions (ex: aaaa)",
    passwordCommon: "Ce mot de passe est trop commun",
    passwordContainsUserInfo: "N'utilisez pas vos informations personnelles",
    passwordWeak: "Mot de passe trop faible",
  },
  en: {
    passwordTooShort: "Minimum 12 characters required",
    passwordNoUppercase: "Add at least one uppercase letter",
    passwordNoLowercase: "Add at least one lowercase letter",
    passwordNoDigit: "Add at least one digit",
    passwordNoSpecial: "Add at least one special character (!@#$%&*)",
    passwordRepeated: "Avoid repeated characters (e.g. aaaa)",
    passwordCommon: "This password is too common",
    passwordContainsUserInfo: "Do not include your personal information",
    passwordWeak: "Password too weak",
  },
  de: {
    passwordTooShort: "Mindestens 12 Zeichen erforderlich",
    passwordNoUppercase: "Fügen Sie mindestens einen Großbuchstaben hinzu",
    passwordNoLowercase: "Fügen Sie mindestens einen Kleinbuchstaben hinzu",
    passwordNoDigit: "Fügen Sie mindestens eine Zahl hinzu",
    passwordNoSpecial: "Fügen Sie ein Sonderzeichen hinzu (!@#$%&*)",
    passwordRepeated: "Vermeiden Sie Zeichenwiederholungen (z.B. aaaa)",
    passwordCommon: "Dieses Passwort ist zu häufig",
    passwordContainsUserInfo: "Verwenden Sie keine persönlichen Daten",
    passwordWeak: "Passwort zu schwach",
  },
  es: {
    passwordTooShort: "Mínimo 12 caracteres requeridos",
    passwordNoUppercase: "Añade al menos una mayúscula",
    passwordNoLowercase: "Añade al menos una minúscula",
    passwordNoDigit: "Añade al menos un número",
    passwordNoSpecial: "Añade al menos un carácter especial (!@#$%&*)",
    passwordRepeated: "Evita las repeticiones (ej: aaaa)",
    passwordCommon: "Esta contraseña es demasiado común",
    passwordContainsUserInfo: "No incluyas tus datos personales",
    passwordWeak: "Contraseña demasiado débil",
  },
  it: {
    passwordTooShort: "Minimo 12 caratteri richiesti",
    passwordNoUppercase: "Aggiungi almeno una maiuscola",
    passwordNoLowercase: "Aggiungi almeno una minuscola",
    passwordNoDigit: "Aggiungi almeno un numero",
    passwordNoSpecial: "Aggiungi almeno un carattere speciale (!@#$%&*)",
    passwordRepeated: "Evita le ripetizioni (es: aaaa)",
    passwordCommon: "Questa password è troppo comune",
    passwordContainsUserInfo: "Non includere i tuoi dati personali",
    passwordWeak: "Password troppo debole",
  },
  pt: {
    passwordTooShort: "Mínimo 12 caracteres necessários",
    passwordNoUppercase: "Adicione pelo menos uma maiúscula",
    passwordNoLowercase: "Adicione pelo menos uma minúscula",
    passwordNoDigit: "Adicione pelo menos um número",
    passwordNoSpecial: "Adicione pelo menos um carácter especial (!@#$%&*)",
    passwordRepeated: "Evite repetições (ex: aaaa)",
    passwordCommon: "Esta senha é demasiado comum",
    passwordContainsUserInfo: "Não inclua os seus dados pessoais",
    passwordWeak: "Senha demasiado fraca",
  },
  nl: {
    passwordTooShort: "Minimaal 12 tekens vereist",
    passwordNoUppercase: "Voeg minimaal één hoofdletter toe",
    passwordNoLowercase: "Voeg minimaal één kleine letter toe",
    passwordNoDigit: "Voeg minimaal één cijfer toe",
    passwordNoSpecial: "Voeg een speciaal teken toe (!@#$%&*)",
    passwordRepeated: "Vermijd herhalingen (bijv. aaaa)",
    passwordCommon: "Dit wachtwoord is te gewoon",
    passwordContainsUserInfo: "Gebruik geen persoonlijke informatie",
    passwordWeak: "Wachtwoord te zwak",
  },
};

export function PasswordStrengthMeter({
  password,
  userInfo,
  lang = "fr",
}: Props) {
  const result = useMemo(
    () => (password ? validatePassword(password, userInfo) : null),
    [password, userInfo],
  );

  if (!password) return null;

  const score = result?.score ?? 0;
  const errors = result?.errors ?? [];
  const labels = strengthLabels[lang] ?? strengthLabels.fr;
  const messages = errorMessages[lang] ?? errorMessages.fr;

  const label = labels[score] ?? labels[0];
  const pct = ((score + 1) / 5) * 100;

  let barColor = "bg-red-500";
  if (score >= 3) barColor = "bg-green-500";
  else if (score === 2) barColor = "bg-orange-500";

  return (
    <div className="space-y-1.5 mt-2">
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span
          className={`text-xs font-semibold shrink-0 ${
            score >= 3
              ? "text-green-600"
              : score === 2
                ? "text-orange-500"
                : "text-red-500"
          }`}
        >
          {label}
        </span>
      </div>

      {/* Error list */}
      {errors.length > 0 && (
        <ul className="space-y-0.5">
          {errors.map((err) => (
            <li
              key={err}
              className="text-xs text-destructive flex items-center gap-1"
            >
              <span className="w-1 h-1 rounded-full bg-destructive shrink-0" />
              {messages[err] ?? err}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
