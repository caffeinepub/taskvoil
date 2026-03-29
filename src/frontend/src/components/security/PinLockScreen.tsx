import { useAuthStore } from "@/lib/auth-store";
import { useSecurityStore } from "@/lib/security-store";
import { useNavigate } from "@tanstack/react-router";
import { Delete } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";

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

export function PinLockScreen() {
  const { verifyPin, unlock, setLockType, clearPin } = useSecurityStore();
  const { logoutUser } = useAuthStore();
  const navigate = useNavigate();
  const [digits, setDigits] = useState<string[]>([]);
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleDigit = useCallback(
    async (d: string) => {
      if (isVerifying) return;
      const next = [...digits, d];
      setDigits(next);
      if (next.length === PIN_LENGTH) {
        setIsVerifying(true);
        const ok = await verifyPin(next.join(""));
        if (ok) {
          unlock();
        } else {
          setError(true);
          setTimeout(() => {
            setError(false);
            setDigits([]);
            setIsVerifying(false);
          }, 700);
        }
      }
    },
    [digits, isVerifying, verifyPin, unlock],
  );

  const handleBackspace = useCallback(() => {
    if (isVerifying) return;
    setDigits((prev) => prev.slice(0, -1));
  }, [isVerifying]);

  const handleForgotPin = useCallback(async () => {
    await clearPin();
    setLockType("none");
    logoutUser();
    void navigate({ to: "/login" });
  }, [clearPin, setLockType, logoutUser, navigate]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      {/* Logo / title */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
          <span className="text-3xl">🔒</span>
        </div>
        <h1 className="text-xl font-bold text-foreground">TaskVoilà</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Entrez votre code PIN
        </p>
      </div>

      {/* PIN dots */}
      <AnimatePresence mode="wait">
        <motion.div
          key={error ? "error" : "normal"}
          animate={error ? { x: [-8, 8, -8, 8, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex gap-4 mb-10"
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              aria-hidden="true"
              className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                i < digits.length
                  ? error
                    ? "bg-destructive border-destructive"
                    : "bg-primary border-primary"
                  : "border-border bg-transparent"
              }`}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Number pad */}
      <div className="grid grid-cols-3 gap-3 w-72">
        {PAD_KEYS.map((key) => {
          if (key === "empty") return <div key="empty" />;
          if (key === "back") {
            return (
              <button
                key="back"
                type="button"
                onPointerDown={handleBackspace}
                className="h-16 rounded-2xl flex items-center justify-center text-muted-foreground hover:bg-muted active:scale-95 transition-all"
                data-ocid="pin.backspace_button"
              >
                <Delete className="w-5 h-5" />
              </button>
            );
          }
          return (
            <button
              key={key}
              type="button"
              onPointerDown={() => void handleDigit(key)}
              className="h-16 rounded-2xl bg-card border border-border text-xl font-semibold text-foreground hover:bg-primary/10 hover:border-primary active:scale-95 transition-all shadow-sm"
              data-ocid={`pin.digit_${key}_button`}
            >
              {key}
            </button>
          );
        })}
      </div>

      {/* Forgot PIN */}
      <button
        type="button"
        onClick={() => void handleForgotPin()}
        className="mt-8 text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
        data-ocid="pin.forgot_button"
      >
        PIN oublié ? Se reconnecter
      </button>
    </div>
  );
}
