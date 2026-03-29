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
  const [nfts, setNfts] = useState<DemoNFT[]>([]);

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
