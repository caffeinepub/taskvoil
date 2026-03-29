/**
 * NFT Store — simulates ICRC7 NFT minting for task proof photos.
 * Each NFT is linked to a mission + milestone, with a deterministic hash.
 */
import {
  type ReactNode,
  createContext,
  createElement,
  useContext,
  useState,
} from "react";

export type NFTStatus = "minted" | "pending" | "failed";

export type DemoNFT = {
  id: number;
  tokenId: string; // e.g. "NFT-001"
  missionId: number;
  missionTitle: string;
  milestoneIndex: number; // 0 = jalon 1, 1 = jalon 2, etc.
  milestoneLabel: string;
  imageUrl: string; // local path or placeholder
  ownerUserId: string; // "pro_1" or "client_1"
  ownerName: string;
  mintedAt: string; // ISO
  blockHash: string; // simulated on-chain hash
  contractId: string; // simulated canister id
  description: string;
};

// ── helpers ──────────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function generateBlockHash(tokenId: string, missionId: number): string {
  const chars = "abcdef0123456789";
  let h = "0x";
  // deterministic-looking but varied
  const seed = tokenId.length + missionId * 13;
  for (let i = 0; i < 64; i++) {
    h += chars[(i * seed + i * 7 + 3) % chars.length];
  }
  return h;
}

let _nextId = 100;
function nextNFTId() {
  return _nextId++;
}

// ── Seed data ────────────────────────────────────────────────────────────────

const SEED_NFTS: DemoNFT[] = [
  {
    id: 1,
    tokenId: "ICRC7-TV-001",
    missionId: 1,
    missionTitle: "Réparation fuite robinet cuisine",
    milestoneIndex: 0,
    milestoneLabel: "Démarrage des travaux",
    imageUrl: "/assets/generated/plumbing-work.dim_800x600.jpg",
    ownerUserId: "pro_1",
    ownerName: "Marc Dubois",
    mintedAt: daysAgo(10),
    blockHash: generateBlockHash("ICRC7-TV-001", 1),
    contractId: "bd3sg-byaaa-aaaah-qc4za-cai",
    description:
      "Photo de démarrage — état initial de la fuite sous évier cuisine.",
  },
  {
    id: 2,
    tokenId: "ICRC7-TV-002",
    missionId: 1,
    missionTitle: "Réparation fuite robinet cuisine",
    milestoneIndex: 1,
    milestoneLabel: "Travaux terminés",
    imageUrl: "/assets/generated/kitchen-after.dim_800x600.jpg",
    ownerUserId: "pro_1",
    ownerName: "Marc Dubois",
    mintedAt: daysAgo(7),
    blockHash: generateBlockHash("ICRC7-TV-002", 1),
    contractId: "bd3sg-byaaa-aaaah-qc4za-cai",
    description: "Photo de fin — siphon remplacé, test d'étanchéité validé.",
  },
  {
    id: 3,
    tokenId: "ICRC7-TV-003",
    missionId: 2,
    missionTitle: "Installation prise électrique salon",
    milestoneIndex: 0,
    milestoneLabel: "Installation complète",
    imageUrl: "/assets/generated/handyman-work.dim_800x600.jpg",
    ownerUserId: "pro_1",
    ownerName: "Marc Dubois",
    mintedAt: daysAgo(5),
    blockHash: generateBlockHash("ICRC7-TV-003", 2),
    contractId: "bd3sg-byaaa-aaaah-qc4za-cai",
    description: "3 prises doubles installées, conforme NFC 15-100.",
  },
  {
    id: 4,
    tokenId: "ICRC7-TV-004",
    missionId: 3,
    missionTitle: "Taille haie et tonte de pelouse",
    milestoneIndex: 0,
    milestoneLabel: "Avant intervention",
    imageUrl: "/assets/generated/garden-work.dim_800x600.jpg",
    ownerUserId: "client_1",
    ownerName: "Jean Dupont",
    mintedAt: daysAgo(3),
    blockHash: generateBlockHash("ICRC7-TV-004", 3),
    contractId: "bd3sg-byaaa-aaaah-qc4za-cai",
    description: "Photo client — état initial du jardin avant intervention.",
  },
];

// ── Context ──────────────────────────────────────────────────────────────────

type NFTStoreCtx = {
  nfts: DemoNFT[];
  getNFTsByMission: (missionId: number) => DemoNFT[];
  getNFTsByMilestone: (missionId: number, milestoneIndex: number) => DemoNFT[];
  getNFTsByUser: (userId: string) => DemoNFT[];
  mintNFT: (data: {
    missionId: number;
    missionTitle: string;
    milestoneIndex: number;
    milestoneLabel: string;
    imageUrl: string;
    ownerUserId: string;
    ownerName: string;
    description: string;
  }) => DemoNFT;
};

const NFTStoreContext = createContext<NFTStoreCtx | undefined>(undefined);

export function NFTStoreProvider({ children }: { children: ReactNode }) {
  const [nfts, setNfts] = useState<DemoNFT[]>(SEED_NFTS);

  function getNFTsByMission(missionId: number): DemoNFT[] {
    return nfts.filter((n) => n.missionId === missionId);
  }

  function getNFTsByMilestone(
    missionId: number,
    milestoneIndex: number,
  ): DemoNFT[] {
    return nfts.filter(
      (n) => n.missionId === missionId && n.milestoneIndex === milestoneIndex,
    );
  }

  function getNFTsByUser(userId: string): DemoNFT[] {
    return nfts.filter((n) => n.ownerUserId === userId);
  }

  function mintNFT(data: {
    missionId: number;
    missionTitle: string;
    milestoneIndex: number;
    milestoneLabel: string;
    imageUrl: string;
    ownerUserId: string;
    ownerName: string;
    description: string;
  }): DemoNFT {
    const id = nextNFTId();
    const tokenId = `ICRC7-TV-${String(id).padStart(3, "0")}`;
    const newNFT: DemoNFT = {
      id,
      tokenId,
      ...data,
      mintedAt: new Date().toISOString(),
      blockHash: generateBlockHash(tokenId, data.missionId),
      contractId: "bd3sg-byaaa-aaaah-qc4za-cai",
    };
    setNfts((prev) => [newNFT, ...prev]);
    return newNFT;
  }

  return createElement(
    NFTStoreContext.Provider,
    {
      value: {
        nfts,
        getNFTsByMission,
        getNFTsByMilestone,
        getNFTsByUser,
        mintNFT,
      },
    },
    children,
  );
}

export function useNFTStore() {
  const ctx = useContext(NFTStoreContext);
  if (!ctx) throw new Error("useNFTStore must be used within NFTStoreProvider");
  return ctx;
}
