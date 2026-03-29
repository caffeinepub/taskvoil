import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/lib/i18n";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const SUGGESTIONS = [
  "Je cherche un plombier",
  "Comment poster une mission ?",
  "Tarifs et commissions",
];

export function AIAssistantFAB() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      text: "Bonjour ! Je suis votre assistant TaskVoilà. Comment puis-je vous aider aujourd'hui ?",
    },
  ]);

  function handleSend(text?: string) {
    const query = text ?? input.trim();
    if (!query) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: query,
    };
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      text: `Merci pour votre question sur "${query}". Notre équipe de professionnels vérifiés peut vous aider. Consultez la marketplace pour trouver le bon expert près de chez vous.`,
    };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
  }

  return (
    <div
      className="md:hidden fixed z-40"
      style={{
        bottom: "calc(5rem + env(safe-area-inset-bottom, 0px))",
        right: "1rem",
      }}
    >
      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute bottom-16 right-0 w-[min(320px,calc(100vw-2rem))] rounded-2xl bg-white border border-border overflow-hidden"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
            data-ocid="ai_assistant.panel"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.18 65), oklch(0.65 0.20 55))",
              }}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-white" />
                <span className="text-sm font-semibold text-white">
                  {t.nav.bottomAI}
                </span>
              </div>
              <button
                type="button"
                data-ocid="ai_assistant.close_button"
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <ScrollArea className="h-48 px-3 py-2">
              <div className="space-y-2">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div
                        className="h-6 w-6 rounded-full flex items-center justify-center mr-1.5 flex-shrink-0 mt-0.5"
                        style={{ background: "oklch(0.72 0.18 65 / 0.15)" }}
                      >
                        <Bot
                          className="h-3 w-3"
                          style={{ color: "oklch(0.72 0.18 65)" }}
                        />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "text-white rounded-tr-sm"
                          : "bg-muted text-foreground rounded-tl-sm"
                      }`}
                      style={{
                        background:
                          msg.role === "user"
                            ? "linear-gradient(135deg, oklch(0.72 0.18 65), oklch(0.65 0.20 55))"
                            : undefined,
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-[10px] px-2.5 py-1 rounded-full border border-border bg-muted/50 hover:bg-muted transition-colors"
                    style={{ color: "oklch(0.72 0.18 65)" }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-3 pb-3 flex gap-2">
              <Input
                data-ocid="ai_assistant.input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Posez votre question..."
                className="h-9 text-xs flex-1 rounded-xl"
              />
              <Button
                data-ocid="ai_assistant.submit_button"
                size="sm"
                onClick={() => handleSend()}
                className="h-9 w-9 p-0 rounded-xl"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.72 0.18 65), oklch(0.65 0.20 55))",
                }}
              >
                <Send className="h-3.5 w-3.5 text-white" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        data-ocid="ai_assistant.open_modal_button"
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative h-12 w-12 rounded-full flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.72 0.18 65), oklch(0.65 0.20 55))",
          boxShadow: "0 4px 16px oklch(0.65 0.20 55 / 0.45)",
        }}
        aria-label={t.nav.bottomAI}
      >
        <Sparkles className="h-5 w-5 text-white" />
        {/* Pulse ring */}
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-30"
          style={{ background: "oklch(0.72 0.18 65)" }}
        />
      </motion.button>
    </div>
  );
}
