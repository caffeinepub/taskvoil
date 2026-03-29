/**
 * Shared chat store — simulates a real-time messaging system between
 * clients and pros. Conversations are keyed by a unique conversation ID
 * so both parties see the same thread.
 */
import {
  type ReactNode,
  createContext,
  createElement,
  useContext,
  useState,
} from "react";

export type ChatParticipant = {
  id: string; // "client_1", "pro_1", "pro_2" etc.
  name: string;
  role: "client" | "pro";
  avatar?: string; // initials fallback
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string; // matches ChatParticipant.id
  senderName: string;
  senderRole: "client" | "pro";
  text: string;
  timestamp: string; // ISO string
  isBlocked?: boolean;
};

export type Conversation = {
  id: string;
  taskId?: number;
  taskTitle?: string;
  participants: ChatParticipant[];
  messages: ChatMessage[];
  createdAt: string;
  lastMessageAt: string;
};

// ── demo seed data ──────────────────────────────────────────────────────────

const now = new Date();
function minutesAgo(n: number) {
  return new Date(now.getTime() - n * 60000).toISOString();
}

const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: "conv_1",
    taskId: 1,
    taskTitle: "Réparation fuite robinet cuisine",
    participants: [
      { id: "client_1", name: "Jean Dupont", role: "client" },
      { id: "pro_1", name: "Marc Dubois", role: "pro" },
    ],
    createdAt: minutesAgo(120),
    lastMessageAt: minutesAgo(8),
    messages: [
      {
        id: "m1",
        conversationId: "conv_1",
        senderId: "pro_1",
        senderName: "Marc Dubois",
        senderRole: "pro",
        text: "Bonjour ! J'ai bien pris en compte votre demande. Je peux intervenir dès demain matin.",
        timestamp: minutesAgo(110),
      },
      {
        id: "m2",
        conversationId: "conv_1",
        senderId: "client_1",
        senderName: "Jean Dupont",
        senderRole: "client",
        text: "Parfait, merci. Pouvez-vous me donner une estimation du temps nécessaire ?",
        timestamp: minutesAgo(90),
      },
      {
        id: "m3",
        conversationId: "conv_1",
        senderId: "pro_1",
        senderName: "Marc Dubois",
        senderRole: "pro",
        text: "Environ 3 heures pour ce type de travaux, matériel inclus. Je vous envoie un devis détaillé.",
        timestamp: minutesAgo(75),
      },
      {
        id: "m4",
        conversationId: "conv_1",
        senderId: "client_1",
        senderName: "Jean Dupont",
        senderRole: "client",
        text: "Super ! À demain alors.",
        timestamp: minutesAgo(8),
      },
    ],
  },
  {
    id: "conv_2",
    taskId: 4,
    taskTitle: "Peinture chambre enfant",
    participants: [
      { id: "client_1", name: "Jean Dupont", role: "client" },
      { id: "pro_2", name: "Sophie Martin", role: "pro" },
    ],
    createdAt: minutesAgo(60),
    lastMessageAt: minutesAgo(30),
    messages: [
      {
        id: "m5",
        conversationId: "conv_2",
        senderId: "pro_2",
        senderName: "Sophie Martin",
        senderRole: "pro",
        text: "Bonjour ! Je suis disponible pour la peinture de votre chambre. Quelle surface exactement ?",
        timestamp: minutesAgo(55),
      },
      {
        id: "m6",
        conversationId: "conv_2",
        senderId: "client_1",
        senderName: "Jean Dupont",
        senderRole: "client",
        text: "C'est une chambre de 15m², deux murs à faire entièrement. On partirait sur un bleu pastel.",
        timestamp: minutesAgo(30),
      },
    ],
  },
  {
    id: "conv_3",
    taskId: 5,
    taskTitle: "Déménagement studio Paris",
    participants: [
      { id: "client_2", name: "Marie Lefebvre", role: "client" },
      { id: "pro_1", name: "Marc Dubois", role: "pro" },
    ],
    createdAt: minutesAgo(45),
    lastMessageAt: minutesAgo(15),
    messages: [
      {
        id: "m7",
        conversationId: "conv_3",
        senderId: "client_2",
        senderName: "Marie Lefebvre",
        senderRole: "client",
        text: "Bonjour, je cherche quelqu'un pour un déménagement le 10 mars. Disponible ?",
        timestamp: minutesAgo(40),
      },
      {
        id: "m8",
        conversationId: "conv_3",
        senderId: "pro_1",
        senderName: "Marc Dubois",
        senderRole: "pro",
        text: "Bonjour Marie ! Oui je suis disponible ce jour-là. Quel est le volume approximatif ?",
        timestamp: minutesAgo(15),
      },
    ],
  },
];

// ── contact info blocker ─────────────────────────────────────────────────────

const BLOCKED_PATTERN =
  /(\+?\d[\d\s\-().]{7,}\d)|([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})|(https?:\/\/\S+|www\.\S+)/gi;

export function containsContactInfo(text: string): boolean {
  BLOCKED_PATTERN.lastIndex = 0;
  return BLOCKED_PATTERN.test(text);
}

// ── context ──────────────────────────────────────────────────────────────────

type ChatStoreCtx = {
  conversations: Conversation[];
  getConversationsForUser: (userId: string) => Conversation[];
  getConversation: (id: string) => Conversation | undefined;
  sendMessage: (
    conversationId: string,
    senderId: string,
    senderName: string,
    senderRole: "client" | "pro",
    text: string,
  ) => boolean;
  startConversation: (
    taskId: number | undefined,
    taskTitle: string | undefined,
    client: ChatParticipant,
    pro: ChatParticipant,
  ) => string;
  getOrCreateConversation: (
    taskId: number | undefined,
    clientId: string,
    proId: string,
    taskTitle?: string,
    clientName?: string,
    proName?: string,
  ) => string;
  unreadCount: (userId: string) => number;
};

const ChatStoreContext = createContext<ChatStoreCtx | undefined>(undefined);

export function ChatStoreProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] =
    useState<Conversation[]>(SEED_CONVERSATIONS);

  function getConversationsForUser(userId: string): Conversation[] {
    return conversations
      .filter((c) => c.participants.some((p) => p.id === userId))
      .sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() -
          new Date(a.lastMessageAt).getTime(),
      );
  }

  function getConversation(id: string): Conversation | undefined {
    return conversations.find((c) => c.id === id);
  }

  function sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    senderRole: "client" | "pro",
    text: string,
  ): boolean {
    if (containsContactInfo(text)) return false;

    const msg: ChatMessage = {
      id: `m_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      conversationId,
      senderId,
      senderName,
      senderRole,
      text,
      timestamp: new Date().toISOString(),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: [...c.messages, msg],
              lastMessageAt: msg.timestamp,
            }
          : c,
      ),
    );
    return true;
  }

  function startConversation(
    taskId: number | undefined,
    taskTitle: string | undefined,
    client: ChatParticipant,
    pro: ChatParticipant,
  ): string {
    const id = `conv_${Date.now()}`;
    const newConv: Conversation = {
      id,
      taskId,
      taskTitle,
      participants: [client, pro],
      messages: [],
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
    };
    setConversations((prev) => [newConv, ...prev]);
    return id;
  }

  function getOrCreateConversation(
    taskId: number | undefined,
    clientId: string,
    proId: string,
    taskTitle?: string,
    clientName?: string,
    proName?: string,
  ): string {
    const existing = conversations.find(
      (c) =>
        c.taskId === taskId &&
        c.participants.some((p) => p.id === clientId) &&
        c.participants.some((p) => p.id === proId),
    );
    if (existing) return existing.id;

    return startConversation(
      taskId,
      taskTitle,
      { id: clientId, name: clientName ?? "Client", role: "client" },
      { id: proId, name: proName ?? "Professionnel", role: "pro" },
    );
  }

  function unreadCount(_userId: string): number {
    // In real app this would track read state. For demo, return 0.
    return 0;
  }

  return createElement(
    ChatStoreContext.Provider,
    {
      value: {
        conversations,
        getConversationsForUser,
        getConversation,
        sendMessage,
        startConversation,
        getOrCreateConversation,
        unreadCount,
      },
    },
    children,
  );
}

export function useChatStore() {
  const ctx = useContext(ChatStoreContext);
  if (!ctx)
    throw new Error("useChatStore must be used within ChatStoreProvider");
  return ctx;
}
