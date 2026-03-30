import { create } from "zustand";
import { persist } from "zustand/middleware";

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

interface FeedState {
  likedItems: Record<string, boolean>;
  followedPros: Record<string, boolean>;
  toggleLike: (id: string) => void;
  toggleFollow: (proId: string) => void;
  getLikeCount: (id: string) => number;
}

export const useFeedStore = create<FeedState>()(
  persist(
    (set, get) => ({
      likedItems: {},
      followedPros: {},
      toggleLike: (id) =>
        set((state) => ({
          likedItems: {
            ...state.likedItems,
            [id]: !state.likedItems[id],
          },
        })),
      toggleFollow: (proId) =>
        set((state) => ({
          followedPros: {
            ...state.followedPros,
            [proId]: !state.followedPros[proId],
          },
        })),
      getLikeCount: (id) => {
        const base = (hashCode(id) % 47) + 3;
        return base + (get().likedItems[id] ? 1 : 0);
      },
    }),
    {
      name: "taskvoila_feed",
    },
  ),
);
