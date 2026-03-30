import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFeedStore } from "@/lib/feed-store";
import { useTranslation } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";
import { Crown, Heart, Pin, Star, UserCheck, UserPlus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";

interface ProFeedItem {
  type: "PRO_CARD";
  id: string;
  specialty: string;
  location: string;
  rating: number;
  isPremium: boolean;
}

interface PinnedFeedItem {
  type: "PINNED_CARD";
  id: string;
  titleKey: string;
  descKey: string;
}

interface PromoFeedItem {
  type: "PROMO_CARD";
  id: string;
  packageKey: string;
  descKey: string;
}

interface TipFeedItem {
  type: "TIP_CARD";
  id: string;
  titleKey: string;
  descKey: string;
}

type FeedItem = ProFeedItem | PinnedFeedItem | PromoFeedItem | TipFeedItem;

function fisherYates<T>(arr: T[], seed: string): T[] {
  const result = [...arr];
  let seedNum = 0;
  for (let i = 0; i < seed.length; i++) {
    seedNum = (seedNum * 31 + seed.charCodeAt(i)) & 0xffffffff;
  }
  let s = Math.abs(seedNum) || 1;
  const rng = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return Math.abs(s) / 0x80000000;
  };
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getSessionSeed(): string {
  const key = "taskvoila_feed_seed";
  let seed = sessionStorage.getItem(key);
  if (!seed) {
    seed = Date.now().toString().slice(0, 8);
    sessionStorage.setItem(key, seed);
  }
  return seed;
}

const PROMO_ITEMS: PromoFeedItem[] = [
  {
    type: "PROMO_CARD",
    id: "promo_starter",
    packageKey: "promoStarter",
    descKey: "promoStarterDesc",
  },
  {
    type: "PROMO_CARD",
    id: "promo_pro",
    packageKey: "promoPro",
    descKey: "promoProDesc",
  },
  {
    type: "PROMO_CARD",
    id: "promo_expert",
    packageKey: "promoExpert",
    descKey: "promoExpertDesc",
  },
];

function ProCard({ item }: { item: ProFeedItem }) {
  const { t } = useTranslation();
  const { likedItems, followedPros, toggleLike, toggleFollow, getLikeCount } =
    useFeedStore();
  const isLiked = !!likedItems[item.id];
  const isFollowing = !!followedPros[item.id];
  const likeCount = getLikeCount(item.id);
  const initials = item.specialty.slice(0, 2).toUpperCase();

  return (
    <Card
      className="border-border hover:shadow-md transition-shadow"
      data-ocid={`feed.${item.id}.card`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-foreground truncate">
                {item.specialty}
              </p>
              {item.isPremium && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                  <Crown size={10} />
                  {t.feed.featuredPro}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">
                {item.location}
              </span>
              <span className="text-xs text-muted-foreground">·</span>
              <div className="flex items-center gap-0.5">
                <Star size={11} className="text-amber-400 fill-amber-400" />
                <span className="text-xs font-medium text-foreground">
                  {item.rating}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors"
            onClick={() => toggleLike(item.id)}
            data-ocid={`feed.${item.id}.toggle`}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={isLiked ? "liked" : "unliked"}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <Heart
                  size={15}
                  className={isLiked ? "fill-red-500 text-red-500" : ""}
                />
              </motion.span>
            </AnimatePresence>
            <span>{likeCount}</span>
          </button>
          <button
            type="button"
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              isFollowing
                ? "bg-blue-600 text-white border-blue-600"
                : "border-blue-300 text-blue-700 hover:bg-blue-50"
            }`}
            onClick={() => toggleFollow(item.id)}
            data-ocid={`feed.${item.id}.button`}
          >
            {isFollowing ? (
              <>
                <UserCheck size={12} /> {t.feed.following}
              </>
            ) : (
              <>
                <UserPlus size={12} /> {t.feed.follow}
              </>
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function PinnedCard({ item }: { item: PinnedFeedItem }) {
  const { t } = useTranslation();
  const { likedItems, toggleLike, getLikeCount } = useFeedStore();
  const isLiked = !!likedItems[item.id];
  const likeCount = getLikeCount(item.id);
  const feed = t.feed as Record<string, string>;

  return (
    <Card
      className="bg-blue-50/60 border-blue-200 hover:shadow-md transition-shadow relative"
      data-ocid={`feed.${item.id}.card`}
    >
      <Pin size={14} className="absolute top-3 right-3 text-blue-400" />
      <CardContent className="p-4 pr-8">
        <p className="text-sm font-semibold text-foreground">
          {feed[item.titleKey]}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {feed[item.descKey]}
        </p>
        <button
          type="button"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors mt-3"
          onClick={() => toggleLike(item.id)}
          data-ocid={`feed.${item.id}.toggle`}
        >
          <motion.span
            animate={{ scale: isLiked ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.2 }}
          >
            <Heart
              size={14}
              className={isLiked ? "fill-red-500 text-red-500" : ""}
            />
          </motion.span>
          <span>{likeCount}</span>
          <span>{isLiked ? t.feed.liked : t.feed.like}</span>
        </button>
      </CardContent>
    </Card>
  );
}

function PromoCard({ item }: { item: PromoFeedItem }) {
  const { t } = useTranslation();
  const feed = t.feed as Record<string, string>;

  return (
    <Card
      className="border-0 overflow-hidden hover:shadow-md transition-shadow"
      data-ocid={`feed.${item.id}.card`}
    >
      <CardContent className="p-0">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4">
          <p className="text-white font-bold text-sm">
            {feed[item.packageKey]}
          </p>
          <p className="text-blue-100 text-xs mt-1">{feed[item.descKey]}</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3 border-white/50 text-white hover:bg-white/20 hover:text-white bg-transparent text-xs h-8"
            asChild
          >
            <Link to="/subscription" data-ocid={`feed.${item.id}.button`}>
              {t.feed.promoCtaLabel}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TipCard({ item }: { item: TipFeedItem }) {
  const { t } = useTranslation();
  const feed = t.feed as Record<string, string>;

  return (
    <Card
      className="bg-emerald-50/50 border-l-4 border-l-emerald-400 border-r-border border-t-border border-b-border hover:shadow-md transition-shadow"
      data-ocid={`feed.${item.id}.card`}
    >
      <CardContent className="p-4">
        <p className="text-sm font-semibold text-foreground">
          {feed[item.titleKey]}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {feed[item.descKey]}
        </p>
      </CardContent>
    </Card>
  );
}

const BASE_ITEMS: FeedItem[] = [
  {
    type: "PRO_CARD",
    id: "pro_feed_1",
    specialty: "electricite",
    location: "Paris",
    rating: 4.9,
    isPremium: true,
  },
  {
    type: "PRO_CARD",
    id: "pro_feed_2",
    specialty: "plomberie",
    location: "Lyon",
    rating: 4.7,
    isPremium: false,
  },
  {
    type: "PRO_CARD",
    id: "pro_feed_3",
    specialty: "jardinage",
    location: "Bordeaux",
    rating: 4.8,
    isPremium: true,
  },
  {
    type: "PRO_CARD",
    id: "pro_feed_4",
    specialty: "menage",
    location: "Marseille",
    rating: 4.6,
    isPremium: false,
  },
  {
    type: "PRO_CARD",
    id: "pro_feed_5",
    specialty: "peinture",
    location: "Toulouse",
    rating: 4.9,
    isPremium: true,
  },
  {
    type: "PRO_CARD",
    id: "pro_feed_6",
    specialty: "bricolage",
    location: "Nantes",
    rating: 4.5,
    isPremium: false,
  },
  {
    type: "PINNED_CARD",
    id: "pinned_1",
    titleKey: "pinnedTitle1",
    descKey: "pinnedDesc1",
  },
  {
    type: "PINNED_CARD",
    id: "pinned_2",
    titleKey: "pinnedTitle2",
    descKey: "pinnedDesc2",
  },
  {
    type: "PINNED_CARD",
    id: "pinned_3",
    titleKey: "pinnedTitle3",
    descKey: "pinnedDesc3",
  },
  {
    type: "TIP_CARD",
    id: "tip_1",
    titleKey: "tipTitle1",
    descKey: "tipDesc1",
  },
  {
    type: "TIP_CARD",
    id: "tip_2",
    titleKey: "tipTitle2",
    descKey: "tipDesc2",
  },
  {
    type: "TIP_CARD",
    id: "tip_3",
    titleKey: "tipTitle3",
    descKey: "tipDesc3",
  },
];

export function NewsFeed() {
  const { t } = useTranslation();
  const categories = t.categories as Record<string, string>;

  const feedItems = useMemo(() => {
    const seed = getSessionSeed();
    const shuffled = fisherYates(BASE_ITEMS, seed);
    // Resolve pro specialty keys to translated labels
    const resolved = shuffled.map((item) => {
      if (item.type === "PRO_CARD") {
        return {
          ...item,
          specialty: categories[item.specialty] || item.specialty,
        };
      }
      return item;
    });
    // Insert a PROMO_CARD every 5 items
    const result: (FeedItem | PromoFeedItem)[] = [];
    let promoIndex = 0;
    for (let i = 0; i < resolved.length; i++) {
      result.push(resolved[i]);
      if ((i + 1) % 5 === 0 && promoIndex < PROMO_ITEMS.length) {
        result.push(PROMO_ITEMS[promoIndex++]);
      }
    }
    return result;
  }, [categories]);

  return (
    <div className="space-y-4" data-ocid="feed.list">
      {feedItems.map((item, idx) => {
        if (item.type === "PRO_CARD")
          return <ProCard key={item.id} item={item as ProFeedItem} />;
        if (item.type === "PINNED_CARD")
          return <PinnedCard key={item.id} item={item as PinnedFeedItem} />;
        if (item.type === "PROMO_CARD")
          return (
            <PromoCard key={`${item.id}_${idx}`} item={item as PromoFeedItem} />
          );
        if (item.type === "TIP_CARD")
          return <TipCard key={item.id} item={item as TipFeedItem} />;
        return null;
      })}
    </div>
  );
}
