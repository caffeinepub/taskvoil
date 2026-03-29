import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/lib/auth-store";
import { useTranslation } from "@/lib/i18n";
import {
  getPushPermissionStatus,
  requestPushPermission,
} from "@/lib/push-notifications";
import { type LockType, useSecurityStore } from "@/lib/security-store";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle,
  Lock,
  LogOut,
  Shield,
  Smartphone,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

const PIN_LENGTH = 6;
const PAD_KEYS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "empty",
  "0",
  "back",
];

function PinSetupInline({ onComplete }: { onComplete: () => void }) {
  const { savePin } = useSecurityStore();
  const { t } = useTranslation();
  const [step, setStep] = useState<"enter" | "confirm">("enter");
  const [firstPin, setFirstPin] = useState("");
  const [currentInput, setCurrentInput] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleDigit = useCallback(
    async (d: string) => {
      const next = currentInput + d;
      setCurrentInput(next);
      if (next.length === PIN_LENGTH) {
        if (step === "enter") {
          setFirstPin(next);
          setCurrentInput("");
          setStep("confirm");
          setError("");
        } else {
          if (next === firstPin) {
            await savePin(next);
            setSuccess(true);
            setTimeout(onComplete, 800);
          } else {
            setError(t.settings.pinMismatch);
            setCurrentInput("");
            setStep("enter");
            setFirstPin("");
          }
        }
      }
    },
    [currentInput, step, firstPin, savePin, onComplete, t],
  );

  if (success) {
    return (
      <div className="flex flex-col items-center py-6 gap-3">
        <CheckCircle className="w-12 h-12 text-green-500" />
        <p className="text-sm font-medium text-foreground">
          {t.settings.pinSuccess}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <p className="text-sm text-muted-foreground text-center">
        {step === "enter"
          ? "Entrez un code PIN à 6 chiffres"
          : "Confirmez votre code PIN"}
      </p>

      {/* Dots */}
      <div className="flex gap-3 my-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            aria-hidden="true"
            className={`w-3 h-3 rounded-full border-2 transition-all ${
              i < currentInput.length
                ? "bg-primary border-primary"
                : "border-border"
            }`}
          />
        ))}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {/* Mini pad */}
      <div className="grid grid-cols-3 gap-2 w-56">
        {PAD_KEYS.map((key) => {
          if (key === "empty") return <div key="empty" />;
          if (key === "back") {
            return (
              <button
                key="back"
                type="button"
                onClick={() => setCurrentInput((p) => p.slice(0, -1))}
                className="h-12 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted active:scale-95 transition-all text-sm"
              >
                ⌫
              </button>
            );
          }
          return (
            <button
              key={key}
              type="button"
              onClick={() => void handleDigit(key)}
              className="h-12 rounded-xl bg-card border border-border text-base font-semibold hover:bg-primary/10 hover:border-primary active:scale-95 transition-all"
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { currentUser, logoutUser } = useAuthStore();
  const { lockType, setLockType, clearPin } = useSecurityStore();
  const navigate = useNavigate();
  const { t, lang } = useTranslation();

  const [pushStatus, setPushStatus] = useState<
    NotificationPermission | "unsupported"
  >("default");
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [hasBiometric, setHasBiometric] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    setPushStatus(getPushPermissionStatus());
    if (window.PublicKeyCredential) {
      void PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().then(
        setHasBiometric,
      );
    }
  }, []);

  const handleLockChange = useCallback(
    async (val: string) => {
      const type = val as LockType;
      if (type === "none" && lockType !== "none") {
        await clearPin();
        setLockType("none");
        setShowPinSetup(false);
      } else if (type === "pin") {
        setLockType("pin");
        setShowPinSetup(true);
      } else if (type === "biometric") {
        setLockType("biometric");
        setShowPinSetup(false);
      }
    },
    [lockType, clearPin, setLockType],
  );

  const handleTogglePush = useCallback(async () => {
    if (pushStatus !== "granted") {
      const ok = await requestPushPermission();
      setPushStatus(ok ? "granted" : "denied");
    }
  }, [pushStatus]);

  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const handleLogout = useCallback(() => {
    logoutUser();
    void navigate({ to: "/login" });
  }, [logoutUser, navigate]);

  const handleDeleteAccount = useCallback(() => {
    setDeleteOpen(false);
    setDeleteSuccess(true);
    setTimeout(() => {
      logoutUser();
      void navigate({ to: "/" });
    }, 2000);
  }, [logoutUser, navigate]);

  if (!currentUser) return null;

  const displayName = currentUser.pseudo ?? currentUser.firstName ?? "";

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              {t.settings.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{displayName}</p>
          </div>

          {/* Security Section */}
          <Card className="mb-4" data-ocid="settings.panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lock className="w-4 h-4 text-primary" />
                {t.settings.security}
              </CardTitle>
              <CardDescription>{t.settings.security}</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={lockType}
                onValueChange={(v) => void handleLockChange(v)}
                className="space-y-3"
              >
                {/* No lock */}
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all">
                  <RadioGroupItem value="none" id="lock-none" />
                  <Label htmlFor="lock-none" className="flex-1 cursor-pointer">
                    <p className="text-sm font-medium">{t.settings.noLock}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.settings.noLockDesc}
                    </p>
                  </Label>
                </div>

                {/* Biometric */}
                {hasBiometric && (
                  <div
                    className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
                    data-ocid="settings.biometric.radio"
                  >
                    <RadioGroupItem value="biometric" id="lock-bio" />
                    <Label htmlFor="lock-bio" className="flex-1 cursor-pointer">
                      <p className="text-sm font-medium">
                        {t.settings.biometric}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t.settings.biometricDesc}
                      </p>
                    </Label>
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}

                {/* PIN */}
                <div
                  className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
                  data-ocid="settings.pin.radio"
                >
                  <RadioGroupItem value="pin" id="lock-pin" />
                  <Label htmlFor="lock-pin" className="flex-1 cursor-pointer">
                    <p className="text-sm font-medium">{t.settings.pin}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.settings.pinDesc}
                    </p>
                  </Label>
                </div>
              </RadioGroup>

              {/* PIN setup inline */}
              {showPinSetup && lockType === "pin" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 border-t border-border pt-4"
                  data-ocid="settings.pin_setup.panel"
                >
                  <PinSetupInline onComplete={() => setShowPinSetup(false)} />
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="text-base">🔔</span>
                {t.settings.notifications}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-toggle" className="text-sm font-medium">
                    {t.settings.pushNotifs}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {pushStatus === "granted"
                      ? t.settings.pushEnabled
                      : pushStatus === "denied"
                        ? t.settings.pushBlocked
                        : pushStatus === "unsupported"
                          ? t.settings.pushUnsupported
                          : t.settings.pushDisabled}
                  </p>
                </div>
                <Switch
                  id="push-toggle"
                  checked={pushStatus === "granted"}
                  onCheckedChange={() => void handleTogglePush()}
                  disabled={
                    pushStatus === "denied" || pushStatus === "unsupported"
                  }
                  data-ocid="settings.push_notifications.switch"
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Section */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="text-base">👤</span>
                {t.settings.account}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleLogout}
                data-ocid="settings.logout.button"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t.settings.logout}
              </Button>
            </CardContent>
          </Card>

          {/* Account Recovery */}
          {(() => {
            const RECOVERY_TEXTS: Record<
              string,
              {
                title: string;
                ii: string;
                nfid: string;
                plug: string;
                link: string;
              }
            > = {
              fr: {
                title: "Récupération de compte",
                ii: "Internet Identity : configurez un appareil de secours sur identity.ic0.app avant toute perte d'appareil.",
                nfid: "NFID (Google) : reconnectez-vous avec votre compte Google depuis n'importe quel appareil.",
                plug: "Plug Wallet : utilisez votre phrase de récupération de 12 mots.",
                link: "Configurer la récupération II",
              },
              en: {
                title: "Account Recovery",
                ii: "Internet Identity: set up a recovery device on identity.ic0.app before losing your device.",
                nfid: "NFID (Google): simply log in with your Google account from any device.",
                plug: "Plug Wallet: use your 12-word seed phrase to restore on any device.",
                link: "Set up II Recovery",
              },
              de: {
                title: "Kontowiederherstellung",
                ii: "Internet Identity: richten Sie ein Wiederherstellungsgerät auf identity.ic0.app ein.",
                nfid: "NFID (Google): melden Sie sich von einem beliebigen Gerät mit Ihrem Google-Konto an.",
                plug: "Plug Wallet: Verwenden Sie Ihre 12-Wort-Wiederherstellungsphrase.",
                link: "II-Wiederherstellung einrichten",
              },
              es: {
                title: "Recuperación de cuenta",
                ii: "Internet Identity: configure un dispositivo de recuperación en identity.ic0.app.",
                nfid: "NFID (Google): inicie sesión con su cuenta de Google desde cualquier dispositivo.",
                plug: "Plug Wallet: use su frase de recuperación de 12 palabras.",
                link: "Configurar recuperación II",
              },
              it: {
                title: "Recupero account",
                ii: "Internet Identity: configura un dispositivo di recupero su identity.ic0.app.",
                nfid: "NFID (Google): accedi con il tuo account Google da qualsiasi dispositivo.",
                plug: "Plug Wallet: usa la tua frase di recupero di 12 parole.",
                link: "Configura recupero II",
              },
              pt: {
                title: "Recuperação de conta",
                ii: "Internet Identity: configure um dispositivo de recuperação em identity.ic0.app.",
                nfid: "NFID (Google): faça login com a sua conta Google em qualquer dispositivo.",
                plug: "Plug Wallet: use a sua frase de recuperação de 12 palavras.",
                link: "Configurar recuperação II",
              },
              nl: {
                title: "Accountherstel",
                ii: "Internet Identity: stel een hersteldapparaat in op identity.ic0.app.",
                nfid: "NFID (Google): log in met uw Google-account op elk apparaat.",
                plug: "Plug Wallet: gebruik uw herstelzin van 12 woorden.",
                link: "II-herstel instellen",
              },
              el: {
                title: "Ανάκτηση λογαριασμού",
                ii: "Internet Identity: ρυθμίστε συσκευή ανάκτησης στο identity.ic0.app.",
                nfid: "NFID (Google): συνδεθείτε με τον λογαριασμό Google από οποιαδήποτε συσκευή.",
                plug: "Plug Wallet: χρησιμοποιήστε τη φράση ανάκτησης 12 λέξεων.",
                link: "Ρύθμιση ανάκτησης II",
              },
              lu: {
                title: "Récupération de compte",
                ii: "Internet Identity : configurez un appareil de secours sur identity.ic0.app.",
                nfid: "NFID (Google) : reconnectez-vous avec votre compte Google.",
                plug: "Plug Wallet : utilisez votre phrase de 12 mots.",
                link: "Configurer la récupération II",
              },
            };
            const rt = RECOVERY_TEXTS[lang] ?? RECOVERY_TEXTS.en;
            return (
              <Card className="mb-4" data-ocid="settings.recovery.card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span>🔐</span>
                    {rt.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">🔑</span>
                    <p>
                      <span className="font-medium text-foreground">
                        Internet Identity:
                      </span>{" "}
                      {rt.ii}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">🟦</span>
                    <p>
                      <span className="font-medium text-foreground">
                        NFID (Google):
                      </span>{" "}
                      {rt.nfid}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">🔌</span>
                    <p>
                      <span className="font-medium text-foreground">
                        Plug Wallet:
                      </span>{" "}
                      {rt.plug}
                    </p>
                  </div>
                  <a
                    href="https://identity.ic0.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium underline underline-offset-2 mt-1"
                    data-ocid="settings.recovery.link"
                  >
                    {rt.link} ↗
                  </a>
                </CardContent>
              </Card>
            );
          })()}

          {/* Danger Zone */}
          <Card className="border-destructive/40">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-destructive">
                <AlertTriangle className="w-4 h-4" />
                {t.settings.dangerZone}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deleteSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-3 py-4 text-center"
                  data-ocid="settings.delete_account.success_state"
                >
                  <CheckCircle className="w-10 h-10 text-green-500" />
                  <p className="text-sm font-medium text-foreground">
                    {t.settings.deleteSuccess}
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {t.settings.deleteConfirmDesc}
                  </p>
                  <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="w-full"
                        data-ocid="settings.delete_account.open_modal_button"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t.settings.deleteAccount}
                      </Button>
                    </DialogTrigger>
                    <DialogContent data-ocid="settings.delete_account.dialog">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                          <AlertTriangle className="w-5 h-5" />
                          {t.settings.deleteConfirmTitle}
                        </DialogTitle>
                        <DialogDescription asChild>
                          <div className="space-y-3 pt-1">
                            <p className="text-sm">
                              {t.settings.deleteConfirmDesc}
                            </p>
                            <ul className="space-y-1.5 text-sm text-muted-foreground">
                              <li className="flex items-start gap-2">
                                <span className="text-destructive mt-0.5">
                                  ✗
                                </span>
                                {t.settings.deleteWarning1}
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-destructive mt-0.5">
                                  ✗
                                </span>
                                {t.settings.deleteWarning2}
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-destructive mt-0.5">
                                  ✗
                                </span>
                                {t.settings.deleteWarning3}
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-destructive mt-0.5">
                                  ✗
                                </span>
                                {t.settings.deleteWarning4}
                              </li>
                            </ul>
                            {currentUser?.role === "pro" && (
                              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 leading-relaxed">
                                {t.settings.dac7Notice}
                              </div>
                            )}
                          </div>
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                          variant="outline"
                          onClick={() => setDeleteOpen(false)}
                          data-ocid="settings.delete_account.cancel_button"
                        >
                          {t.common.cancel}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          data-ocid="settings.delete_account.confirm_button"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t.settings.deleteConfirm}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
