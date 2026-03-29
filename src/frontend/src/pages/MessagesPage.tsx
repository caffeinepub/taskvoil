import { CallModal } from "@/components/call/CallModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";
import {
  type Conversation,
  containsContactInfo,
  useChatStore,
} from "@/lib/chat-store";
import { useTranslation } from "@/lib/i18n";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  ArrowLeft,
  MessageSquare,
  Phone,
  Send,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function formatDate(iso: string, lang: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return lang === "fr" ? "À l'instant" : "Just now";
  if (diffMin < 60)
    return lang === "fr" ? `Il y a ${diffMin} min` : `${diffMin} min ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return lang === "fr" ? `Il y a ${diffH}h` : `${diffH}h ago`;
  return d.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", {
    day: "2-digit",
    month: "short",
  });
}

export function MessagesPage() {
  const { lang } = useTranslation();
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();
  const { getConversationsForUser, getConversation, sendMessage } =
    useChatStore();

  // Try to get convId from search params (e.g. /messages?conv=conv_1)
  const search = useSearch({ strict: false }) as { conv?: string };
  const initialConvId = search?.conv;

  // Derive userId from authenticated user
  const userId = currentUser ? String(currentUser.id) : "";

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      void navigate({ to: "/login" });
    }
  }, [currentUser, navigate]);

  const conversations = getConversationsForUser(userId);

  const [selectedConvId, setSelectedConvId] = useState<string | null>(
    initialConvId ?? conversations[0]?.id ?? null,
  );
  const [newMessage, setNewMessage] = useState("");
  const [blockedWarning, setBlockedWarning] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedConv: Conversation | undefined = selectedConvId
    ? getConversation(selectedConvId)
    : undefined;

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConv?.messages.length]);

  // Update selected conv when initialConvId changes
  useEffect(() => {
    if (initialConvId) setSelectedConvId(initialConvId);
  }, [initialConvId]);

  function handleSend() {
    const trimmed = newMessage.trim();
    if (!trimmed || !selectedConvId) return;

    if (containsContactInfo(trimmed)) {
      setBlockedWarning(true);
      setTimeout(() => setBlockedWarning(false), 4000);
      return;
    }

    const userName = currentUser
      ? (currentUser.pseudo ??
        `${currentUser.firstName} ${currentUser.lastName}`.trim())
      : "Utilisateur";
    const role = currentUser?.role === "pro" ? "pro" : "client";

    const sent = sendMessage(selectedConvId, userId, userName, role, trimmed);
    if (!sent) {
      toast.error(
        lang === "fr"
          ? "Coordonnées bloquées pour votre sécurité."
          : "Contact info blocked for your safety.",
      );
      return;
    }
    setNewMessage("");
  }

  function getOtherParticipant(conv: Conversation) {
    return conv.participants.find((p) => p.id !== userId);
  }

  const isLoggedIn = !!currentUser;

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <p className="text-5xl mb-4">🔐</p>
          <h2 className="font-display text-xl font-bold text-foreground mb-2">
            {lang === "fr" ? "Connexion requise" : "Login required"}
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            {lang === "fr"
              ? "Connectez-vous pour accéder à vos messages."
              : "Please log in to access your messages."}
          </p>
          <Button
            onClick={() => void navigate({ to: "/login" })}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {lang === "fr" ? "Se connecter" : "Log in"}
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() =>
              void navigate({
                to:
                  currentUser?.role === "pro"
                    ? "/dashboard/pro"
                    : "/dashboard/client",
              })
            }
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {lang === "fr" ? "Retour" : "Back"}
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              {lang === "fr" ? "Messages" : "Messages"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {conversations.length}{" "}
              {lang === "fr" ? "conversation(s)" : "conversation(s)"}
            </p>
          </div>
        </div>

        {conversations.length === 0 ? (
          <div className="bg-white rounded-2xl card-shadow border border-border/50 p-12 text-center">
            <p className="text-5xl mb-4">💬</p>
            <h2 className="font-display text-xl font-bold text-foreground mb-2">
              {lang === "fr" ? "Aucun message" : "No messages yet"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {lang === "fr"
                ? "Vos conversations avec les professionnels apparaîtront ici."
                : "Your conversations with professionals will appear here."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl card-shadow border border-border/50 overflow-hidden flex h-[calc(100vh-220px)] min-h-[500px]">
            {/* Sidebar — conversation list */}
            <div
              className={`border-r border-border flex flex-col shrink-0 w-full md:w-80 ${selectedConvId ? "hidden md:flex" : "flex"}`}
            >
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  {lang === "fr" ? "Conversations" : "Conversations"}
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-border">
                {conversations.map((conv) => {
                  const other = getOtherParticipant(conv);
                  const lastMsg = conv.messages[conv.messages.length - 1];
                  const isSelected = conv.id === selectedConvId;
                  return (
                    <button
                      type="button"
                      key={conv.id}
                      className={`w-full text-left p-4 hover:bg-muted/40 transition-colors ${
                        isSelected
                          ? "bg-primary/5 border-l-2 border-l-primary"
                          : ""
                      }`}
                      onClick={() => setSelectedConvId(conv.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {other ? other.name.slice(0, 1) : "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-semibold text-sm text-foreground truncate">
                              {other?.name ?? "Inconnu"}
                            </span>
                            <span className="text-xs text-muted-foreground shrink-0 ml-2">
                              {formatDate(conv.lastMessageAt, lang)}
                            </span>
                          </div>
                          {conv.taskTitle && (
                            <p className="text-xs text-primary font-medium truncate mb-0.5">
                              📋 {conv.taskTitle}
                            </p>
                          )}
                          {lastMsg && (
                            <p className="text-xs text-muted-foreground truncate">
                              {lastMsg.senderId === userId ? (
                                <span className="text-primary/70">
                                  {lang === "fr" ? "Vous : " : "You: "}
                                </span>
                              ) : null}
                              {lastMsg.text}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main chat area */}
            <div
              className={`flex-1 flex flex-col min-w-0 ${selectedConvId ? "flex" : "hidden md:flex"}`}
            >
              {selectedConv ? (
                <>
                  {/* Chat header */}
                  <div className="p-4 border-b border-border flex items-center gap-3">
                    {/* Mobile back button */}
                    <button
                      type="button"
                      className="md:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted/50 text-muted-foreground shrink-0"
                      onClick={() => setSelectedConvId(null)}
                      aria-label={lang === "fr" ? "Retour" : "Back"}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {getOtherParticipant(selectedConv)?.name.slice(0, 1) ??
                        "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {getOtherParticipant(selectedConv)?.name ?? "Inconnu"}
                      </p>
                      {selectedConv.taskTitle && (
                        <p className="text-xs text-muted-foreground truncate">
                          📋 {selectedConv.taskTitle}
                        </p>
                      )}
                    </div>
                    {/* Call button */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 text-xs border-primary/30 text-primary gap-1"
                      onClick={() => setCallOpen(true)}
                      data-ocid="messages.call_button"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {lang === "fr" ? "Appeler" : "Call"}
                    </Button>
                    {selectedConv.taskId && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 text-xs border-primary/30 text-primary"
                        onClick={() =>
                          void navigate({
                            to: "/mission/$id",
                            params: { id: String(selectedConv.taskId) },
                          })
                        }
                      >
                        {lang === "fr" ? "Voir la mission" : "View task"}
                      </Button>
                    )}
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10">
                    {selectedConv.messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center">
                        <p className="text-3xl mb-3">💬</p>
                        <p className="text-muted-foreground text-sm">
                          {lang === "fr"
                            ? "Démarrez la conversation !"
                            : "Start the conversation!"}
                        </p>
                      </div>
                    ) : (
                      selectedConv.messages.map((msg) => {
                        const isMe = msg.senderId === userId;
                        return (
                          <div
                            key={msg.id}
                            className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                                msg.senderRole === "pro"
                                  ? "bg-secondary"
                                  : "bg-primary"
                              }`}
                            >
                              {msg.senderName.slice(0, 1)}
                            </div>
                            <div
                              className={`max-w-[70%] flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}
                            >
                              <span className="text-xs text-muted-foreground">
                                {msg.senderName} · {formatTime(msg.timestamp)}
                              </span>
                              <div
                                className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                                  isMe
                                    ? "bg-primary text-white rounded-tr-sm"
                                    : "bg-white border border-border text-foreground rounded-tl-sm shadow-sm"
                                }`}
                              >
                                {msg.text}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Blocked warning */}
                  {blockedWarning && (
                    <div className="mx-4 mb-2 p-2 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-xs text-destructive">
                      <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                      {lang === "fr"
                        ? "Pour votre sécurité, les coordonnées directes sont bloquées. Merci de communiquer uniquement via TaskVoilà."
                        : "For your safety, direct contact details are blocked. Please communicate only via TaskVoilà."}
                    </div>
                  )}

                  {/* Input */}
                  <div className="p-3 border-t border-border flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2.5 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder={
                        lang === "fr"
                          ? "Écrivez votre message..."
                          : "Write your message..."
                      }
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1 shrink-0 px-4 h-10"
                      onClick={handleSend}
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <p className="text-5xl mb-4">💬</p>
                  <p className="text-muted-foreground">
                    {lang === "fr"
                      ? "Sélectionnez une conversation"
                      : "Select a conversation"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Security note */}
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-xl px-4 py-2.5">
          <Badge className="bg-secondary/20 text-secondary border-secondary/30 text-xs gap-1">
            <ShieldAlert className="h-3 w-3" />
            {lang === "fr" ? "Sécurité" : "Security"}
          </Badge>
          {lang === "fr"
            ? "Toute communication hors de TaskVoilà (numéro de téléphone, email, lien externe) est automatiquement bloquée pour votre protection."
            : "Any communication outside TaskVoilà (phone numbers, emails, external links) is automatically blocked for your protection."}
        </div>
      </div>

      {/* Call Modal */}
      <CallModal
        isOpen={callOpen}
        onClose={() => setCallOpen(false)}
        contactName={
          selectedConv
            ? (getOtherParticipant(selectedConv)?.name ?? "Inconnu")
            : "Inconnu"
        }
        contactRole={currentUser?.role === "pro" ? "client" : "pro"}
      />
    </main>
  );
}
