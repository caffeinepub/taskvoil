import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactName: string;
  contactRole: "pro" | "client";
}

type CallState = "ringing" | "connected" | "ended";

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function CallModal({
  isOpen,
  onClose,
  contactName,
  contactRole,
}: CallModalProps) {
  const { lang } = useTranslation();
  const [callState, setCallState] = useState<CallState>("ringing");
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ringingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoHangupRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setCallState("ringing");
      setIsMuted(false);
      setIsCameraOn(false);
      setTimer(0);

      // After 3s, answer the call
      ringingRef.current = setTimeout(() => {
        setCallState("connected");
      }, 3000);
    }
    return () => {
      if (ringingRef.current) clearTimeout(ringingRef.current);
    };
  }, [isOpen]);

  // Timer while connected
  useEffect(() => {
    if (callState === "connected") {
      timerRef.current = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);

      // Auto-hangup after 30s (the other party hangs up)
      autoHangupRef.current = setTimeout(() => {
        setCallState("ended");
        toast.info(
          lang === "fr"
            ? `${contactName} a raccroché.`
            : `${contactName} hung up.`,
        );
        setTimeout(onClose, 1500);
      }, 30000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoHangupRef.current) clearTimeout(autoHangupRef.current);
    };
  }, [callState, contactName, lang, onClose]);

  function handleHangUp() {
    setCallState("ended");
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoHangupRef.current) clearTimeout(autoHangupRef.current);
    if (ringingRef.current) clearTimeout(ringingRef.current);
    setTimeout(onClose, 1500);
  }

  const initials = contactName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const roleLabel =
    contactRole === "pro"
      ? lang === "fr"
        ? "Professionnel"
        : "Professional"
      : lang === "fr"
        ? "Client"
        : "Client";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backdropFilter: "blur(12px)",
            background: "rgba(0,0,0,0.6)",
          }}
          data-ocid="call.modal"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-sm mx-4 rounded-3xl overflow-hidden"
            style={{
              background:
                "linear-gradient(160deg, #0f1a2e 0%, #0a2440 50%, #0d1f35 100%)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
            }}
          >
            {/* Top section */}
            <div className="px-6 pt-8 pb-6 text-center relative">
              {/* Animated rings for ringing state */}
              {callState === "ringing" &&
                [1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute left-1/2 top-12 -translate-x-1/2 rounded-full border-2 border-white/10"
                    initial={{ width: 80, height: 80, opacity: 0.6 }}
                    animate={{
                      width: 80 + i * 40,
                      height: 80 + i * 40,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.4,
                      ease: "easeOut",
                    }}
                  />
                ))}

              {/* Avatar */}
              <motion.div
                animate={
                  callState === "ringing"
                    ? { scale: [1, 1.05, 1] }
                    : { scale: 1 }
                }
                transition={{
                  duration: 1.2,
                  repeat:
                    callState === "ringing" ? Number.POSITIVE_INFINITY : 0,
                }}
                className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold relative z-10"
                style={{
                  background:
                    contactRole === "pro"
                      ? "linear-gradient(135deg, #1a7d4e, #0ea47a)"
                      : "linear-gradient(135deg, #1e40af, #3b82f6)",
                  boxShadow:
                    callState === "connected"
                      ? "0 0 0 3px rgba(16,185,129,0.4), 0 0 0 6px rgba(16,185,129,0.15)"
                      : "0 4px 20px rgba(0,0,0,0.3)",
                }}
              >
                {initials}
              </motion.div>

              {/* Name */}
              <h2 className="text-white text-xl font-bold mb-1">
                {contactName}
              </h2>
              <p className="text-white/50 text-sm mb-2">{roleLabel}</p>

              {/* Status */}
              <div className="text-white/70 text-sm font-medium">
                {callState === "ringing" && (
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{
                      duration: 1.2,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  >
                    {lang === "fr" ? "Appel en cours" : "Calling"}
                    <DotDotDot />
                  </motion.span>
                )}
                {callState === "connected" && (
                  <span className="text-emerald-400 font-semibold">
                    {lang === "fr" ? "En communication" : "Connected"} ·{" "}
                    {formatTimer(timer)}
                  </span>
                )}
                {callState === "ended" && (
                  <span className="text-white/50">
                    {lang === "fr" ? "Appel terminé" : "Call ended"} ·{" "}
                    {formatTimer(timer)}
                  </span>
                )}
              </div>

              {/* Secure badge */}
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <span className="text-xs">🔒</span>
                <span className="text-white/50 text-xs">
                  {lang === "fr"
                    ? "Appel sécurisé via TaskVoilà • Numéros masqués"
                    : "Secure call via TaskVoilà • Numbers hidden"}
                </span>
              </div>
            </div>

            {/* Controls */}
            {callState !== "ended" && (
              <div className="px-6 pb-8">
                <div className="flex items-center justify-center gap-5">
                  {/* Mute */}
                  <button
                    type="button"
                    onClick={() => setIsMuted((v) => !v)}
                    className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
                    style={{
                      background: isMuted
                        ? "rgba(239,68,68,0.25)"
                        : "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }}
                    data-ocid="call.mute_toggle"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <MicOff className="h-5 w-5 text-red-400" />
                    ) : (
                      <Mic className="h-5 w-5 text-white" />
                    )}
                  </button>

                  {/* Hang up */}
                  <button
                    type="button"
                    onClick={handleHangUp}
                    className="w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, #ef4444, #dc2626)",
                      boxShadow: "0 4px 20px rgba(239,68,68,0.4)",
                    }}
                    data-ocid="call.hangup_button"
                    aria-label="Hang up"
                  >
                    <PhoneOff className="h-6 w-6 text-white" />
                  </button>

                  {/* Camera (disabled) */}
                  <button
                    type="button"
                    onClick={() => setIsCameraOn((v) => !v)}
                    className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
                    style={{
                      background: isCameraOn
                        ? "rgba(255,255,255,0.18)"
                        : "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                    data-ocid="call.camera_toggle"
                    aria-label={
                      isCameraOn ? "Turn camera off" : "Turn camera on"
                    }
                  >
                    {isCameraOn ? (
                      <Video className="h-5 w-5 text-white" />
                    ) : (
                      <VideoOff className="h-5 w-5 text-white/40" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Legal note */}
            <div className="px-6 pb-6 text-center">
              <p className="text-white/25 text-[10px] leading-relaxed">
                {lang === "fr"
                  ? "Les appels sont anonymisés via le réseau TaskVoilà. Aucun numéro réel n'est partagé."
                  : "Calls are anonymised via the TaskVoilà network. No real numbers are shared."}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DotDotDot() {
  return (
    <span>
      {[0, 0.3, 0.6].map((delay, i) => (
        <motion.span
          // biome-ignore lint/suspicious/noArrayIndexKey: static dots
          key={i}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 1.2,
            repeat: Number.POSITIVE_INFINITY,
            delay,
          }}
        >
          .
        </motion.span>
      ))}
    </span>
  );
}
