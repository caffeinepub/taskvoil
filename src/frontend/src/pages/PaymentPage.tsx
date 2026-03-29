import { StripeCheckoutButton } from "@/components/StripeCheckoutButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "@/lib/i18n";
import { useMissionStore } from "@/lib/mission-store";
import { useOfferStore } from "@/lib/offer-store";
import { usePaymentStore } from "@/lib/payment-store";
import { usePromoStore } from "@/lib/promo-store";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle,
  Copy,
  HelpCircle,
  Loader2,
  Lock,
  Shield,
  Tag,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

type CardState = "idle" | "loading" | "done" | "error";
type CryptoState = "idle" | "processing" | "done";
type CryptoToken = "icp" | "btc" | "usdc";

const COMMISSION_RATE = 0.08;
const INSURANCE_RATE = 0.03;

const CRYPTO_RATES: Record<CryptoToken, number> = {
  icp: 0.052,
  btc: 0.000025,
  usdc: 1.02,
};

const CRYPTO_ADDRESSES: Record<CryptoToken, string> = {
  icp: "bkyz2-fmaaa-aaaaa-qaaaq-cai",
  btc: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  usdc: "0x742d35Cc6634C0532925a3b8D4C9C8",
};

const CRYPTO_LABELS: Record<CryptoToken, string> = {
  icp: "🔷 ICP",
  btc: "₿ BTC",
  usdc: "💵 USDC",
};

function formatCryptoAmount(eur: number, token: CryptoToken): string {
  const amt = eur * CRYPTO_RATES[token];
  if (token === "btc") return `${amt.toFixed(6)} BTC`;
  if (token === "usdc") return `${amt.toFixed(2)} USDC`;
  return `${amt.toFixed(3)} ICP`;
}

// Inner component — receives real mission and offer data
interface PaymentFormProps {
  missionId: string;
  missionTitle: string;
  offerAmount: number;
}

function PaymentForm({
  missionId,
  missionTitle,
  offerAmount,
}: PaymentFormProps) {
  const navigate = useNavigate();
  const { t, lang } = useTranslation();
  const { addPayment } = usePaymentStore();
  const { validateCode, incrementUsage } = usePromoStore();
  const { updateMissionStatus } = useMissionStore();

  const taskId = missionId;
  const taskTitle = missionTitle;
  const amount = offerAmount;

  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  const [cardState, setCardState] = useState<CardState>("idle");

  // Crypto state
  const [selectedToken, setSelectedToken] = useState<CryptoToken>("icp");
  const [cryptoState, setCryptoState] = useState<CryptoState>("idle");

  // Insurance
  const [insuranceEnabled, setInsuranceEnabled] = useState(false);

  // Promo code
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount: number;
    message: string;
  } | null>(null);
  const [promoError, setPromoError] = useState("");

  const commission = Math.round(amount * COMMISSION_RATE);
  const insurance = insuranceEnabled ? Math.round(amount * INSURANCE_RATE) : 0;
  const discount = appliedPromo?.discount ?? 0;
  const total = amount + commission + insurance - discount;

  const isConfirmed = cardState === "done" || cryptoState === "done";

  function handleApplyPromo() {
    if (!promoInput.trim()) return;
    const result = validateCode(promoInput.trim(), total);
    if (result.valid && result.promo) {
      setAppliedPromo({
        code: promoInput.trim().toUpperCase(),
        discount: result.discount,
        message: result.message,
      });
      setPromoError("");
      toast.success(result.message);
    } else {
      setPromoError(result.message);
      setAppliedPromo(null);
    }
  }

  async function handleCardPay() {
    setCardState("loading");
    try {
      // In production: use actor.createStripeCheckout to redirect to Stripe
      // For now record payment locally
      if (appliedPromo) incrementUsage(appliedPromo.code);
      addPayment({
        missionId: typeof taskId === "string" ? 0 : taskId,
        missionTitle: taskTitle,
        amount,
        commission,
        insurance,
        discount,
        total,
        method: "card",
        status: "confirmed",
        confirmedAt: new Date().toISOString(),
        promoCode: appliedPromo?.code,
      });
      updateMissionStatus(String(taskId), "paid");
      setCardState("done");
      toast.success(t.ui.uiPaymentConfirmed);
      setTimeout(() => {
        void navigate({ to: "/dashboard/client" });
      }, 2000);
    } catch (_err) {
      setCardState("error");
      toast.error(t.ui.uiPaymentFailed);
      setTimeout(() => setCardState("idle"), 2000);
    }
  }

  function handleCryptoPay() {
    setCryptoState("processing");
    if (appliedPromo) incrementUsage(appliedPromo.code);
    setTimeout(() => {
      setCryptoState("done");
      addPayment({
        missionId: typeof taskId === "string" ? 0 : taskId,
        missionTitle: taskTitle,
        amount,
        commission,
        insurance,
        discount,
        total,
        method: selectedToken,
        status: "confirmed",
        confirmedAt: new Date().toISOString(),
        promoCode: appliedPromo?.code,
      });
      updateMissionStatus(String(taskId), "paid");
      toast.success(t.ui.uiCryptoPaymentConfirmed);
    }, 1500);
  }

  return (
    <TooltipProvider>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() =>
                void navigate({
                  to: "/mission/$id",
                  params: { id: String(taskId) },
                })
              }
              data-ocid="payment.back_button"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.common.back}
            </Button>
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                {t.ui.uiSecurePayment}
              </h1>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20 gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              {t.ui.uiEscrowLabel}
            </Badge>
          </div>

          {/* Confirmed State */}
          <AnimatePresence>
            {isConfirmed && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-secondary/10 border border-secondary/30 rounded-2xl p-6 mb-6 text-center"
                data-ocid="payment.success_state"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <CheckCircle className="h-14 w-14 text-secondary mx-auto mb-3" />
                </motion.div>
                <h2 className="font-display text-xl font-bold text-foreground mb-2">
                  {t.ui.uiPaymentConfirmed}
                </h2>
                <p className="text-muted-foreground text-sm mb-4 max-w-sm mx-auto">
                  {t.ui.uiFundsEscrowDesc}
                </p>
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                  onClick={() =>
                    void navigate({
                      to: "/mission/$id",
                      params: { id: String(taskId) },
                    })
                  }
                  data-ocid="payment.view_mission_button"
                >
                  {t.ui.uiViewMyTask}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {!isConfirmed && (
            <div className="grid lg:grid-cols-5 gap-6">
              {/* Payment form — 3/5 */}
              <div className="lg:col-span-3">
                <Tabs defaultValue="card" data-ocid="payment.tabs">
                  <TabsList className="w-full mb-6 h-12 bg-muted/50">
                    <TabsTrigger
                      value="card"
                      className="flex-1 data-[state=active]:bg-white"
                      data-ocid="payment.card_tab"
                    >
                      💳 {t.ui.uiCreditCard}
                    </TabsTrigger>
                    <TabsTrigger
                      value="crypto"
                      className="flex-1 data-[state=active]:bg-white"
                      data-ocid="payment.crypto_tab"
                    >
                      ₿ Crypto
                    </TabsTrigger>
                    <TabsTrigger
                      value="stripe"
                      className="flex-1 data-[state=active]:bg-white"
                      data-ocid="payment.stripe_tab"
                    >
                      💳 Stripe
                    </TabsTrigger>
                  </TabsList>

                  {/* Card tab */}
                  <TabsContent value="card">
                    <div className="bg-white rounded-2xl border border-border/50 p-6 card-shadow space-y-5">
                      {/* Alchemy Pay badge */}
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold tracking-wide">
                          Alchemy
                        </div>
                        <span className="text-xs font-bold text-foreground/70 tracking-wide uppercase">
                          Pay
                        </span>
                        <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {t.ui.uiSecured} • SSL
                        </span>
                      </div>

                      {/* Card number */}
                      <div className="space-y-1.5">
                        <Label htmlFor="cardNumber" className="text-sm">
                          {t.ui.uiCardNumber}
                        </Label>
                        <Input
                          id="cardNumber"
                          placeholder="4444 4444 4444 4444"
                          value={cardNumber}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, "");
                            const formatted = raw
                              .slice(0, 16)
                              .replace(/(\d{4})(?=\d)/g, "$1 ");
                            setCardNumber(formatted);
                          }}
                          maxLength={19}
                          className="font-mono tracking-wider text-base"
                          data-ocid="payment.card_number_input"
                        />
                      </div>

                      {/* Cardholder */}
                      <div className="space-y-1.5">
                        <Label htmlFor="cardHolder" className="text-sm">
                          {t.ui.uiCardholderName}
                        </Label>
                        <Input
                          id="cardHolder"
                          placeholder={""}
                          value={cardHolder}
                          onChange={(e) =>
                            setCardHolder(e.target.value.toUpperCase())
                          }
                          className="uppercase tracking-wider"
                          data-ocid="payment.card_holder_input"
                        />
                      </div>

                      {/* Expiry + CVC */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="expiry" className="text-sm">
                            {t.ui.uiExpiry} (MM/AA)
                          </Label>
                          <Input
                            id="expiry"
                            placeholder="MM/AA"
                            value={expiry}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/\D/g, "");
                              const formatted =
                                raw.length > 2
                                  ? `${raw.slice(0, 2)}/${raw.slice(2, 4)}`
                                  : raw;
                              setExpiry(formatted);
                            }}
                            maxLength={5}
                            className="font-mono"
                            data-ocid="payment.expiry_input"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="cvc" className="text-sm">
                            CVC
                          </Label>
                          <Input
                            id="cvc"
                            placeholder="123"
                            value={cvc}
                            onChange={(e) =>
                              setCvc(
                                e.target.value.replace(/\D/g, "").slice(0, 3),
                              )
                            }
                            maxLength={3}
                            type="password"
                            className="font-mono"
                            data-ocid="payment.cvc_input"
                          />
                        </div>
                      </div>

                      {/* Save card */}
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="saveCard"
                          checked={saveCard}
                          onCheckedChange={(v) => setSaveCard(!!v)}
                          data-ocid="payment.save_card_checkbox"
                        />
                        <label
                          htmlFor="saveCard"
                          className="text-sm text-muted-foreground cursor-pointer"
                        >
                          {t.ui.uiSaveCard}
                        </label>
                      </div>

                      {/* Pay button */}
                      <Button
                        className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                        onClick={handleCardPay}
                        disabled={cardState === "loading"}
                        data-ocid="payment.card_submit_button"
                      >
                        {cardState === "loading" ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t.ui.uiProcessing}
                          </>
                        ) : cardState === "error" ? (
                          <>❌ {t.ui.uiRetry}</>
                        ) : (
                          <>
                            <Lock className="h-4 w-4" />
                            {t.ui.uiPay} {total}€
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Crypto tab */}
                  <TabsContent value="crypto">
                    <div className="bg-white rounded-2xl border border-border/50 p-6 card-shadow space-y-5">
                      {/* ICPAY badge */}
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold tracking-wide">
                          ICP
                        </div>
                        <span className="text-xs font-bold text-foreground/70 tracking-wide uppercase">
                          Pay
                        </span>
                        <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          On-chain • ICP
                        </span>
                      </div>

                      {/* Token selector */}
                      <div className="space-y-2">
                        <Label className="text-sm">{t.ui.uiSelectToken}</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {(["icp", "btc", "usdc"] as CryptoToken[]).map(
                            (token) => (
                              <button
                                key={token}
                                type="button"
                                onClick={() => setSelectedToken(token)}
                                className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                                  selectedToken === token
                                    ? "border-primary bg-primary/5 text-primary"
                                    : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40"
                                }`}
                                data-ocid={`payment.token_${token}_button`}
                              >
                                {CRYPTO_LABELS[token]}
                              </button>
                            ),
                          )}
                        </div>
                      </div>

                      {/* Amount to send */}
                      <div className="bg-muted/40 rounded-xl p-4 space-y-1.5">
                        <p className="text-xs text-muted-foreground">
                          {t.ui.uiExactAmount}
                        </p>
                        <p className="text-2xl font-bold text-primary font-mono">
                          {formatCryptoAmount(total, selectedToken)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ≈ {total}€
                        </p>
                      </div>

                      {/* Address + QR */}
                      <div className="space-y-3">
                        <Label className="text-sm">
                          {t.ui.uiWalletAddress}
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            readOnly
                            value={CRYPTO_ADDRESSES[selectedToken]}
                            className="font-mono text-xs bg-muted/30"
                            data-ocid="payment.wallet_address_input"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0 gap-1"
                            onClick={() => {
                              void navigator.clipboard.writeText(
                                CRYPTO_ADDRESSES[selectedToken],
                              );
                              toast.success(t.ui.uiAddressCopied);
                            }}
                            data-ocid="payment.copy_address_button"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        {/* QR code placeholder */}
                        <div className="flex justify-center">
                          <div
                            className="w-28 h-28 rounded-xl bg-muted border border-border flex items-center justify-center"
                            role="img"
                            aria-label="QR Code"
                            data-ocid="payment.qr_code"
                          >
                            <span className="text-xs text-muted-foreground font-mono">
                              QR Code
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Confirm button */}
                      <Button
                        className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                        onClick={handleCryptoPay}
                        disabled={cryptoState === "processing"}
                        data-ocid="payment.crypto_confirm_button"
                      >
                        {cryptoState === "processing" ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t.ui.uiVerifying}
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            {t.ui.uiPaymentMade}
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Stripe tab */}
                  <TabsContent value="stripe">
                    <div className="bg-white rounded-2xl border border-border/50 p-6 card-shadow space-y-5">
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-xs font-bold tracking-wide">
                          Stripe
                        </div>
                        <span className="text-xs font-bold text-foreground/70 tracking-wide uppercase">
                          Paiement sécurisé
                        </span>
                        <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          SSL · 3D Secure
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t.ui.uiStripeRedirect}
                      </p>
                      <StripeCheckoutButton
                        missionId={
                          typeof taskId === "string"
                            ? Math.abs(
                                Number.parseInt(
                                  taskId.replace(/\D/g, "").slice(-8),
                                  10,
                                ),
                              ) || 1
                            : taskId
                        }
                        amount={total}
                        title={taskTitle}
                        description={
                          lang === "fr"
                            ? `Paiement mission : ${taskTitle}`
                            : `Mission payment: ${taskTitle}`
                        }
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Summary sidebar — 2/5 */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl border border-border/50 p-5 card-shadow">
                  <h2 className="font-display font-bold text-base text-foreground mb-4">
                    {t.ui.uiSummary}
                  </h2>

                  {/* Mission */}
                  <div className="mb-4 p-3 bg-muted/40 rounded-xl">
                    <p className="text-xs text-muted-foreground mb-1">
                      {t.ui.uiMission}
                    </p>
                    <p className="font-semibold text-sm text-foreground leading-snug">
                      {taskTitle}
                    </p>
                  </div>

                  {/* Line items */}
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t.ui.uiTaskAmount}
                      </span>
                      <span className="font-medium">{amount}€</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1">
                        {t.ui.uiCommission} (8%)
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-40 text-xs">
                              {t.ui.uiCommissionDesc}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </span>
                      <span className="font-medium">{commission}€</span>
                    </div>

                    {/* Insurance toggle */}
                    <div className="flex justify-between items-center py-2 border-y border-border/40">
                      <div>
                        <p className="font-medium text-foreground">
                          {t.ui.uiProjectInsurance}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.ui.uiInsuranceCover}
                        </p>
                      </div>
                      <Switch
                        checked={insuranceEnabled}
                        onCheckedChange={setInsuranceEnabled}
                        data-ocid="payment.insurance_switch"
                      />
                    </div>

                    {insuranceEnabled && (
                      <div className="flex justify-between text-secondary">
                        <span className="flex items-center gap-1">
                          🛡️ {t.ui.uiInsurance}
                        </span>
                        <span className="font-medium">+{insurance}€</span>
                      </div>
                    )}

                    {/* Promo code */}
                    <div className="pt-1">
                      <div className="flex gap-2">
                        <Input
                          placeholder={t.ui.uiPromoCode}
                          value={promoInput}
                          onChange={(e) => {
                            setPromoInput(e.target.value.toUpperCase());
                            setPromoError("");
                          }}
                          className="text-sm h-9"
                          data-ocid="payment.promo_input"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 gap-1 shrink-0"
                          onClick={handleApplyPromo}
                          data-ocid="payment.promo_apply_button"
                        >
                          <Tag className="h-3.5 w-3.5" />
                          {t.ui.uiApply}
                        </Button>
                      </div>
                      {promoError && (
                        <p
                          className="text-xs text-destructive mt-1"
                          data-ocid="payment.promo_error"
                        >
                          {promoError}
                        </p>
                      )}
                      {appliedPromo && (
                        <div
                          className="flex justify-between text-secondary text-sm mt-1"
                          data-ocid="payment.promo_success"
                        >
                          <span className="flex items-center gap-1">
                            🎉 {appliedPromo.code}
                          </span>
                          <span className="font-medium">
                            -{appliedPromo.discount}€
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="my-3" />

                  {/* Total */}
                  <div className="flex justify-between items-center">
                    <span className="font-display font-bold text-foreground text-base">
                      Total
                    </span>
                    <span className="font-display font-bold text-primary text-2xl">
                      {total}€
                    </span>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="space-y-2">
                  {[
                    {
                      icon: "🔒",
                      text: t.ui.uiSecurePaymentLc,
                    },
                    {
                      icon: "✅",
                      text: t.ui.uiFundsEscrow,
                    },
                    {
                      icon: "🛡️",
                      text: t.ui.uiGuaranteedRefund,
                    },
                  ].map((badge) => (
                    <div
                      key={badge.text}
                      className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2"
                    >
                      <span>{badge.icon}</span>
                      <span>{badge.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </TooltipProvider>
  );
}

// Outer shell — handles the 404 case, then renders PaymentForm
export function PaymentPage() {
  const { missionId } = useParams({ strict: false }) as {
    missionId?: string;
  };
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getMissionById } = useMissionStore();
  const { getAcceptedOffer } = useOfferStore();

  const mission = missionId ? getMissionById(missionId) : undefined;
  const acceptedOffer = missionId ? getAcceptedOffer(missionId) : undefined;

  if (!mission) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🔍</p>
          <h2 className="font-display text-xl font-bold text-foreground mb-2">
            {t.ui.uiTaskNotFound}
          </h2>
          <Button
            variant="outline"
            onClick={() => void navigate({ to: "/marketplace" })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.common.back}
          </Button>
        </div>
      </main>
    );
  }

  const offerAmount = acceptedOffer
    ? acceptedOffer.price
    : Math.round((mission.budgetMin + mission.budgetMax) / 2);

  return (
    <PaymentForm
      missionId={mission.id}
      missionTitle={mission.title}
      offerAmount={offerAmount}
    />
  );
}
