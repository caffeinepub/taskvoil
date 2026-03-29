import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useAuthStore } from "@/lib/auth-store";
import { LOCALE_MAP, useTranslation } from "@/lib/i18n";
import type { DemoNFT } from "@/lib/nft-store";
import { useNFTStore } from "@/lib/nft-store";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Award,
  ExternalLink,
  Image,
  ShieldCheck,
} from "lucide-react";
import { motion } from "motion/react";

// ─── NFT Certificate Dialog ───────────────────────────────────────────────────

function NFTCertificateDialog({ nft }: { nft: DemoNFT }) {
  const { t, lang } = useTranslation();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 h-8 text-xs border-primary/30 text-primary hover:bg-primary/5"
          data-ocid="nft.certificate.open_modal_button"
        >
          <ExternalLink className="h-3 w-3" />
          {t.ui.uiViewCert}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg" data-ocid="nft.certificate.dialog">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            {t.ui.uiNFTCert}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Image */}
          <div className="aspect-video rounded-xl overflow-hidden bg-muted/50 border border-border">
            <img
              src={nft.imageUrl}
              alt={nft.description}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>

          {/* Certified badge */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/10 border border-secondary/20">
            <ShieldCheck className="h-5 w-5 text-secondary shrink-0" />
            <div>
              <p className="font-semibold text-sm text-foreground">
                {t.ui.uiICPCertifiedFull}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.ui.uiImmutableProof}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/40 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Token ID</p>
                <p className="font-mono font-bold text-sm text-foreground">
                  {nft.tokenId}
                </p>
              </div>
              <div className="bg-muted/40 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  {t.ui.uiMintedAt}
                </p>
                <p className="font-mono text-xs text-foreground">
                  {new Date(nft.mintedAt).toLocaleDateString(
                    LOCALE_MAP[lang as keyof typeof LOCALE_MAP] ?? "en-GB",
                    { day: "numeric", month: "short", year: "numeric" },
                  )}
                </p>
              </div>
            </div>

            <div className="bg-muted/40 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">
                {t.ui.uiMission}
              </p>
              <p className="text-sm font-medium text-foreground">
                {nft.missionTitle}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t.ui.uiMilestone}: {nft.milestoneLabel}
              </p>
            </div>

            <div className="bg-muted/40 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">
                {t.ui.uiDescription}
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {nft.description}
              </p>
            </div>

            <div className="bg-muted/40 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Block Hash</p>
              <p className="font-mono text-xs text-foreground break-all leading-relaxed">
                {nft.blockHash}
              </p>
            </div>

            <div className="bg-muted/40 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Canister ID</p>
              <p className="font-mono text-xs text-foreground break-all">
                {nft.contractId}
              </p>
            </div>

            {/* Metadata */}
            <div className="bg-muted/40 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-2">
                {t.ui.uiMetadata}
              </p>
              <div className="space-y-1 text-xs font-mono">
                <div className="flex gap-2">
                  <span className="text-muted-foreground min-w-[120px]">
                    standard:
                  </span>
                  <span className="text-foreground">ICRC7</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground min-w-[120px]">
                    owner:
                  </span>
                  <span className="text-foreground">{nft.ownerName}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground min-w-[120px]">
                    mission_id:
                  </span>
                  <span className="text-foreground">{nft.missionId}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground min-w-[120px]">
                    milestone_idx:
                  </span>
                  <span className="text-foreground">{nft.milestoneIndex}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── NFT Card ────────────────────────────────────────────────────────────────

function NFTCard({ nft, index }: { nft: DemoNFT; index: number }) {
  const { t, lang } = useTranslation();

  const mintedDate = new Date(nft.mintedAt).toLocaleDateString(
    LOCALE_MAP[lang as keyof typeof LOCALE_MAP] ?? "en-GB",
    { day: "numeric", month: "short", year: "numeric" },
  );

  const shortHash =
    nft.blockHash.length > 18
      ? `${nft.blockHash.slice(0, 18)}...`
      : nft.blockHash;

  const shortContract =
    nft.contractId.length > 20
      ? `${nft.contractId.slice(0, 20)}...`
      : nft.contractId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="bg-white rounded-2xl border border-border/60 overflow-hidden hover:shadow-lg transition-all duration-300 group"
      data-ocid={`nft.item.${index + 1}`}
      style={{
        boxShadow: "0 2px 12px 0 rgba(0,0,0,0.07)",
      }}
    >
      {/* Image */}
      <div className="aspect-video relative overflow-hidden bg-muted/40">
        <img
          src={nft.imageUrl}
          alt={nft.description}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Token badge overlaid */}
        <div className="absolute top-2 left-2">
          <span className="font-mono text-[10px] font-bold bg-black/70 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
            {nft.tokenId}
          </span>
        </div>

        {/* Certified chip */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-secondary/90 text-white px-1.5 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-sm">
          <ShieldCheck className="h-2.5 w-2.5" />
          ICP
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-display font-bold text-sm text-foreground mb-1 line-clamp-1">
          {nft.missionTitle}
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          {t.ui.uiMilestone}: {nft.milestoneLabel}
        </p>

        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {t.ui.uiMinted}
            </span>
            <span className="text-xs font-medium text-foreground">
              {mintedDate}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Hash</span>
            <span className="font-mono text-xs text-muted-foreground">
              {shortHash}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Canister</span>
            <span className="font-mono text-xs text-muted-foreground">
              {shortContract}
            </span>
          </div>
        </div>

        <NFTCertificateDialog nft={nft} />
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function NFTGalleryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { getNFTsByUser } = useNFTStore();

  const { currentUser } = useAuthStore();
  const userId = currentUser ? String(currentUser.id) : "";
  const myNFTs = getNFTsByUser(userId);

  const uniqueMissions = new Set(myNFTs.map((n) => n.missionId)).size;

  return (
    <main className="min-h-screen bg-background">
      {/* Back button */}
      <div className="container mx-auto px-4 pt-4">
        <button
          type="button"
          onClick={() => void navigate({ to: "/dashboard/client" })}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          data-ocid="nft.back_button"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.common.back}
        </button>
      </div>
      {/* Header */}
      <div
        className="py-12"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.35 0.15 250) 0%, oklch(0.28 0.18 270) 50%, oklch(0.22 0.12 250) 100%)",
        }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 text-xs font-semibold">
                ICRC7 · ICP Blockchain
              </Badge>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
              {t.ui.uiMyNFTs}
            </h1>
            <p className="text-white/70 text-base leading-relaxed max-w-xl">
              {t.ui.uiNFTDesc}
            </p>

            {/* Stats row */}
            {myNFTs.length > 0 && (
              <div className="flex gap-6 mt-6">
                <div>
                  <p className="text-2xl font-bold text-white">
                    {myNFTs.length}
                  </p>
                  <p className="text-white/60 text-xs">{t.ui.uiNFTTotal}</p>
                </div>
                <div className="w-px bg-white/20" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {uniqueMissions}
                  </p>
                  <p className="text-white/60 text-xs">
                    {t.ui.uiMissionsCovered}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-10">
        {myNFTs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-20 text-center"
            data-ocid="nft.gallery.empty_state"
          >
            <div className="w-20 h-20 rounded-full bg-muted/60 flex items-center justify-center mx-auto mb-6">
              <Image className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground mb-2">
              {t.ui.uiNoNFTs}
            </h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
              {t.ui.uiNFTEmpty2}
            </p>
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 text-white gap-2"
            >
              <Link to="/marketplace">{t.ui.uiBrowseMarketplace}</Link>
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-bold text-foreground">
                {t.ui.uiYourCollection}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({myNFTs.length} NFT{myNFTs.length > 1 ? "s" : ""})
                </span>
              </h2>
              <Badge className="bg-secondary/15 text-secondary border-secondary/30 font-semibold">
                <ShieldCheck className="h-3 w-3 mr-1" />
                {t.ui.uiICPCertified}
              </Badge>
            </div>

            <div
              className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
              data-ocid="nft.gallery.list"
            >
              {myNFTs.map((nft, i) => (
                <NFTCard key={nft.id} nft={nft} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
