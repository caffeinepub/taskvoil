import {
  type ReactNode,
  createContext,
  createElement,
  useCallback,
  useContext,
  useState,
} from "react";
// Local user type for comment authorship
type CommentAuthor = {
  id: number;
  firstName: string;
  lastName: string;
  role: "client" | "pro" | "admin";
};

// ─── Types ────────────────────────────────────────────────────────────────────

export type Reply = {
  id: string;
  commentId: string;
  authorId: number;
  authorName: string;
  authorRole: "client" | "pro" | "admin";
  content: string;
  createdAt: Date;
  likes: number;
  likedBy: number[];
};

export type Comment = {
  id: string;
  missionId: string;
  authorId: number;
  authorName: string;
  authorRole: "client" | "pro" | "admin";
  content: string;
  createdAt: Date;
  replies: Reply[];
  likes: number;
  likedBy: number[];
};

// ─── Moderation ───────────────────────────────────────────────────────────────

const BLOCKED_WORDS = [
  // FR
  "con",
  "merde",
  "putain",
  "salaud",
  "enculé",
  "connard",
  "connasse",
  "idiot",
  "stupide",
  "nul",
  "crétin",
  "abruti",
  "imbécile",
  "ordure",
  "salope",
  "pute",
  "bâtard",
  // EN
  "shit",
  "fuck",
  "asshole",
  "bastard",
  "bitch",
  "cunt",
  "damn",
  "dickhead",
  "moron",
  "idiot",
  "stupid",
  // DE
  "scheisse",
  "scheiße",
  "arschloch",
  "blödmann",
  "wichser",
  "hurensohn",
  // ES
  "mierda",
  "puta",
  "coño",
  "joder",
  "gilipollas",
  "cabrón",
  // IT
  "cazzo",
  "stronzo",
  "vaffanculo",
  "coglione",
  "merda",
  // PT
  "merda",
  "porra",
  "caralho",
  "filho da puta",
  // NL
  "klootzak",
  "godverdomme",
  "kut",
  "lul",
  "eikel",
];

const PLATFORM_CRITIQUE_PATTERNS = [
  /taskvo[iï]la/i,
  /la plateforme/i,
  /le site/i,
  /cette app/i,
  /cette application/i,
  /nul ce site/i,
  /site de merde/i,
  /platform sucks/i,
  /this app sucks/i,
];

const CLIENT_CRITIQUE_PATTERNS = [
  /mauvais client/i,
  /client nul/i,
  /client de merde/i,
  /bad client/i,
  /schlechter kunde/i,
  /mal cliente/i,
];

const CONTACT_PATTERNS = [
  /\b0[67]\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\b/,
  /\+33\s?[67]\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}/,
  /\+44\s?\d{4}\s?\d{6}/,
  /\+\d{1,3}\s?\d{6,14}/,
  /\b\d{3}[-.]\d{3}[-.]\d{4}\b/,
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
];

export function moderateContent(text: string): {
  valid: boolean;
  reason?: string;
} {
  const lower = text.toLowerCase();

  for (const word of BLOCKED_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    if (regex.test(lower)) {
      return { valid: false, reason: "insult" };
    }
  }

  for (const pattern of PLATFORM_CRITIQUE_PATTERNS) {
    if (pattern.test(text)) {
      return { valid: false, reason: "platform_critique" };
    }
  }

  for (const pattern of CLIENT_CRITIQUE_PATTERNS) {
    if (pattern.test(text)) {
      return { valid: false, reason: "client_critique" };
    }
  }

  for (const pattern of CONTACT_PATTERNS) {
    if (pattern.test(text)) {
      return { valid: false, reason: "contact_info" };
    }
  }

  return { valid: true };
}

// ─── Context ──────────────────────────────────────────────────────────────────

type CommentStoreContextType = {
  getComments: (missionId: string) => Comment[];
  addComment: (
    missionId: string,
    user: CommentAuthor,
    content: string,
  ) => { valid: boolean; reason?: string };
  addReply: (
    commentId: string,
    user: CommentAuthor,
    content: string,
  ) => { valid: boolean; reason?: string };
  toggleCommentLike: (commentId: string, userId: number) => void;
  toggleReplyLike: (commentId: string, replyId: string, userId: number) => void;
  getMissionLikes: (missionId: string) => number[];
  toggleMissionLike: (missionId: string, userId: number) => void;
};

const CommentStoreContext = createContext<CommentStoreContextType | undefined>(
  undefined,
);

export function CommentStoreProvider({ children }: { children: ReactNode }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [missionLikes, setMissionLikes] = useState<Record<string, number[]>>(
    {},
  );

  const getComments = useCallback(
    (missionId: string) => comments.filter((c) => c.missionId === missionId),
    [comments],
  );

  const addComment = useCallback(
    (missionId: string, user: CommentAuthor, content: string) => {
      const mod = moderateContent(content);
      if (!mod.valid) return mod;
      const comment: Comment = {
        id: `c${Date.now()}`,
        missionId,
        authorId: user.id,
        authorName: `${user.firstName} ${user.lastName}`,
        authorRole: user.role,
        content,
        createdAt: new Date(),
        likes: 0,
        likedBy: [],
        replies: [],
      };
      setComments((prev) => [...prev, comment]);
      return { valid: true };
    },
    [],
  );

  const addReply = useCallback(
    (commentId: string, user: CommentAuthor, content: string) => {
      const mod = moderateContent(content);
      if (!mod.valid) return mod;
      const reply: Reply = {
        id: `r${Date.now()}`,
        commentId,
        authorId: user.id,
        authorName: `${user.firstName} ${user.lastName}`,
        authorRole: user.role,
        content,
        createdAt: new Date(),
        likes: 0,
        likedBy: [],
      };
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, replies: [...c.replies, reply] } : c,
        ),
      );
      return { valid: true };
    },
    [],
  );

  const toggleCommentLike = useCallback((commentId: string, userId: number) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id !== commentId) return c;
        const liked = c.likedBy.includes(userId);
        return {
          ...c,
          likes: liked ? c.likes - 1 : c.likes + 1,
          likedBy: liked
            ? c.likedBy.filter((id) => id !== userId)
            : [...c.likedBy, userId],
        };
      }),
    );
  }, []);

  const toggleReplyLike = useCallback(
    (commentId: string, replyId: string, userId: number) => {
      setComments((prev) =>
        prev.map((c) => {
          if (c.id !== commentId) return c;
          return {
            ...c,
            replies: c.replies.map((r) => {
              if (r.id !== replyId) return r;
              const liked = r.likedBy.includes(userId);
              return {
                ...r,
                likes: liked ? r.likes - 1 : r.likes + 1,
                likedBy: liked
                  ? r.likedBy.filter((id) => id !== userId)
                  : [...r.likedBy, userId],
              };
            }),
          };
        }),
      );
    },
    [],
  );

  const getMissionLikes = useCallback(
    (missionId: string) => missionLikes[missionId] ?? [],
    [missionLikes],
  );

  const toggleMissionLike = useCallback((missionId: string, userId: number) => {
    setMissionLikes((prev) => {
      const current = prev[missionId] ?? [];
      const liked = current.includes(userId);
      return {
        ...prev,
        [missionId]: liked
          ? current.filter((id) => id !== userId)
          : [...current, userId],
      };
    });
  }, []);

  const value: CommentStoreContextType = {
    getComments,
    addComment,
    addReply,
    toggleCommentLike,
    toggleReplyLike,
    getMissionLikes,
    toggleMissionLike,
  };

  return createElement(CommentStoreContext.Provider, { value }, children);
}

export function useCommentStore() {
  const ctx = useContext(CommentStoreContext);
  if (!ctx)
    throw new Error("useCommentStore must be used within CommentStoreProvider");
  return ctx;
}
