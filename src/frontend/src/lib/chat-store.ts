/**
 * Shared chat store — real-time messaging system between clients and pros.
 * Conversations are keyed by a unique conversation ID so both parties
 * see the same thread. Unread count tracks per-user read state.
 */
import {
  type ReactNode,
  createContext,
  createElement,
  useContext,
  useState,
} from "react";

export type ChatParticipant = {
  id: string;
  name: string;
  role: "client" | "pro";
  avatar?: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: "client" | "pro";
  text: string;
  timestamp: string;
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

// ── contact info blocker ──────────────────────────────────────────────────

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
  markConversationRead: (conversationId: string, userId: string) => void;
};

const ChatStoreContext = createContext<ChatStoreCtx | undefined>(undefined);

export function ChatStoreProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  // readTimestamps[conversationId][userId] = ISO timestamp of last read
  const [readTimestamps, setReadTimestamps] = useState<
    Record<string, Record<string, string>>
  >({});

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
    // Mark as read for the sender immediately
    setReadTimestamps((prev) => ({
      ...prev,
      [conversationId]: {
        ...(prev[conversationId] ?? {}),
        [senderId]: msg.timestamp,
      },
    }));
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

  function unreadCount(userId: string): number {
    let count = 0;
    for (const conv of conversations) {
      if (!conv.participants.some((p) => p.id === userId)) continue;
      const lastRead = readTimestamps[conv.id]?.[userId];
      for (const msg of conv.messages) {
        if (msg.senderId === userId) continue; // own messages don't count
        if (!lastRead || new Date(msg.timestamp) > new Date(lastRead)) {
          count++;
        }
      }
    }
    return count;
  }

  function markConversationRead(conversationId: string, userId: string): void {
    setReadTimestamps((prev) => ({
      ...prev,
      [conversationId]: {
        ...(prev[conversationId] ?? {}),
        [userId]: new Date().toISOString(),
      },
    }));
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
        markConversationRead,
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
