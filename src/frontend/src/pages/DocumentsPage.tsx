import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/lib/auth-store";
import { useMissionStore } from "@/lib/mission-store";

import {
  type DemoDocument,
  type DocStatus,
  type DocType,
  useDocumentStore,
} from "@/lib/document-store";
import { LOCALE_MAP, useTranslation } from "@/lib/i18n";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle,
  Download,
  Eye,
  FileCheck,
  FilePlus,
  FileText,
  PenLine,
  Shield,
  Stamp,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// ── helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string, lang: string): string {
  return new Date(iso).toLocaleDateString(
    LOCALE_MAP[lang as keyof typeof LOCALE_MAP] ?? "en-GB",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function calcTVA(ht: number, rate: number): number {
  return ht * (rate / 100);
}

function calcTTC(ht: number, rate: number): number {
  return ht + calcTVA(ht, rate);
}

// ── Badge colors by type / status ─────────────────────────────────────────────

function docTypeBadgeClass(docType: DocType): string {
  switch (docType) {
    case "devis":
      return "bg-primary/15 text-primary border-primary/30";
    case "bonPourAccord":
      return "bg-warning/20 text-foreground border-warning/40";
    case "facture":
      return "bg-secondary/20 text-secondary border-secondary/30";
  }
}

function statusBadgeClass(status: DocStatus): string {
  switch (status) {
    case "draft":
      return "bg-muted text-muted-foreground border-border";
    case "sent":
      return "bg-primary/15 text-primary border-primary/30";
    case "signed":
      return "bg-secondary/20 text-secondary border-secondary/30";
    case "archived":
      return "bg-muted text-muted-foreground/60 border-border";
  }
}

function docTypeIcon(docType: DocType) {
  switch (docType) {
    case "devis":
      return FileText;
    case "bonPourAccord":
      return FileCheck;
    case "facture":
      return Stamp;
  }
}

// ── PDF generation (browser-native print-to-PDF) ─────────────────────────────

function generatePDF(doc: DemoDocument, lang: string) {
  const tva = calcTVA(doc.amount, doc.vatRate);
  const ttc = calcTTC(doc.amount, doc.vatRate);

  const docTypeLabel =
    doc.docType === "devis"
      ? lang === "fr"
        ? "DEVIS"
        : "QUOTE"
      : doc.docType === "bonPourAccord"
        ? lang === "fr"
          ? "BON POUR ACCORD"
          : "AGREEMENT"
        : lang === "fr"
          ? "FACTURE"
          : "INVOICE";

  const signatureBlock =
    doc.status === "signed" && doc.signedAt
      ? `<div style="background:#f0fff8;border:1.5px solid #38a169;border-radius:6px;padding:14px 18px;margin:18px 0;">
          <div style="color:#147846;font-weight:700;font-size:13px;margin-bottom:6px;">
            ✓ ${lang === "fr" ? "Document signé électroniquement" : "Electronically signed document"}
          </div>
          <div style="color:#2d6a4f;font-size:11px;line-height:1.7;">
            ${lang === "fr" ? "Signé par" : "Signed by"}: <strong>${doc.signerName}</strong><br/>
            ${lang === "fr" ? "Date" : "Date"}: ${new Date(doc.signedAt).toLocaleDateString()}<br/>
            Hash: <code style="font-size:9px;word-break:break-all;">${doc.signatureHash ?? ""}</code><br/>
            <em>${lang === "fr" ? "Signature enregistrée on-chain sur Internet Computer" : "Signature recorded on-chain on Internet Computer"}</em>
          </div>
        </div>`
      : "";

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8"/>
  <title>${doc.docNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Helvetica, Arial, sans-serif; font-size: 11px; color: #1e1e1e; }
    .header { background: #1c4cc3; color: #fff; padding: 22px 28px 18px; display: flex; justify-content: space-between; align-items: flex-start; }
    .header-left .brand { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header-left .tagline { font-size: 10px; opacity: 0.8; margin-top: 3px; }
    .header-right { text-align: right; }
    .header-right .doc-type { font-size: 17px; font-weight: 700; }
    .header-right .doc-meta { font-size: 10px; opacity: 0.85; margin-top: 4px; line-height: 1.6; }
    .body { padding: 24px 28px; }
    .parties { display: flex; gap: 24px; margin-bottom: 20px; }
    .party { flex: 1; }
    .party-label { font-weight: 700; font-size: 11px; margin-bottom: 5px; color: #1e1e1e; }
    .party-detail { font-size: 10px; color: #3c3c3c; line-height: 1.6; }
    hr { border: none; border-top: 1px solid #d0d0d0; margin: 16px 0; }
    .section-title { font-weight: 700; font-size: 12px; margin-bottom: 5px; color: #1e1e1e; }
    .section-body { font-size: 10px; color: #3c3c3c; line-height: 1.6; margin-bottom: 16px; }
    .amount-table { width: 100%; border-collapse: collapse; margin: 8px 0 16px; }
    .amount-table td { padding: 5px 8px; font-size: 10px; }
    .amount-table tr:last-child { background: #f0f5ff; font-weight: 700; font-size: 11px; }
    .amount-table td:last-child { text-align: right; }
    .footer { margin-top: 40px; border-top: 1px solid #d0d0d0; padding-top: 10px; text-align: center; font-size: 8px; color: #999; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <div class="brand">TaskVoilà</div>
      <div class="tagline">${lang === "fr" ? "Plateforme de services locaux" : "Local services platform"}</div>
    </div>
    <div class="header-right">
      <div class="doc-type">${docTypeLabel}</div>
      <div class="doc-meta">
        ${doc.docNumber}<br/>
        ${lang === "fr" ? "Date" : "Date"}: ${new Date(doc.createdAt).toLocaleDateString()}
      </div>
    </div>
  </div>
  <div class="body">
    <div class="parties">
      <div class="party">
        <div class="party-label">${lang === "fr" ? "Client" : "Client"}</div>
        <div class="party-detail">
          ${doc.clientName}<br/>
          ${doc.clientEmail}
        </div>
      </div>
      <div class="party">
        <div class="party-label">${lang === "fr" ? "Prestataire" : "Service Provider"}</div>
        <div class="party-detail">
          ${doc.proCompany}<br/>
          ${doc.proName}<br/>
          ${doc.proEmail}
        </div>
      </div>
    </div>
    <hr/>
    <div class="section-title">${lang === "fr" ? "Mission" : "Task"}</div>
    <div class="section-body">${doc.missionTitle}</div>
    <div class="section-title">${lang === "fr" ? "Description" : "Description"}</div>
    <div class="section-body">${doc.description}</div>
    <hr/>
    <div class="section-title">${lang === "fr" ? "Détail du montant" : "Amount breakdown"}</div>
    <table class="amount-table">
      <tr><td>${lang === "fr" ? "Montant HT" : "Amount excl. VAT"}</td><td>${formatCurrency(doc.amount)}</td></tr>
      <tr><td>${lang === "fr" ? "TVA" : "VAT"} (${doc.vatRate}%)</td><td>${formatCurrency(tva)}</td></tr>
      <tr><td>${lang === "fr" ? "Total TTC" : "Total incl. VAT"}</td><td>${formatCurrency(ttc)}</td></tr>
    </table>
    ${signatureBlock}
    <div class="footer">
      TaskVoilà — ${lang === "fr" ? "Plateforme de services locaux" : "Local services platform"} — taskvoila.com<br/>
      ${lang === "fr" ? "Document généré automatiquement via TaskVoilà" : "Automatically generated via TaskVoilà"}
    </div>
  </div>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 400);
}

// ── DocumentViewerModal ───────────────────────────────────────────────────────

type DocumentViewerModalProps = {
  doc: DemoDocument | null;
  open: boolean;
  onClose: () => void;
  lang: string;
};

function DocumentViewerModal({
  doc,
  open,
  onClose,
  lang,
}: DocumentViewerModalProps) {
  const { t } = useTranslation();
  if (!doc) return null;

  const tva = calcTVA(doc.amount, doc.vatRate);
  const ttc = calcTTC(doc.amount, doc.vatRate);

  const docTypeLabel = t.documents.docType[doc.docType];
  const Icon = docTypeIcon(doc.docType);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        data-ocid="documents.viewer.dialog"
      >
        {/* Document preview */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          {/* Header stripe */}
          <div className="bg-primary px-6 py-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display font-black text-xl tracking-tight">
                  TaskVoilà
                </p>
                <p className="text-white/70 text-xs mt-0.5">
                  {lang === "fr"
                    ? "Plateforme de services locaux"
                    : "Local services platform"}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <Icon className="h-5 w-5 text-white/80" />
                  <span className="font-bold text-lg uppercase">
                    {docTypeLabel}
                  </span>
                </div>
                <p className="text-white/80 text-sm font-mono">
                  {doc.docNumber}
                </p>
                <p className="text-white/60 text-xs">
                  {formatDate(doc.createdAt, lang)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Client / Pro */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  {lang === "fr" ? "Client" : "Client"}
                </p>
                <p className="font-semibold text-foreground">
                  {doc.clientName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {doc.clientEmail}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  {lang === "fr" ? "Prestataire" : "Service Provider"}
                </p>
                <p className="font-semibold text-foreground">
                  {doc.proCompany}
                </p>
                <p className="text-sm text-muted-foreground">{doc.proName}</p>
                <p className="text-sm text-muted-foreground">{doc.proEmail}</p>
              </div>
            </div>

            <Separator />

            {/* Mission */}
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                {lang === "fr" ? "Mission" : "Task"}
              </p>
              <p className="font-semibold text-foreground">
                {doc.missionTitle}
              </p>
            </div>

            {/* Description */}
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                {lang === "fr" ? "Description" : "Description"}
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                {doc.description}
              </p>
            </div>

            <Separator />

            {/* Amount table */}
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                {lang === "fr" ? "Détail du montant" : "Amount breakdown"}
              </p>
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="flex justify-between p-3 border-b border-border bg-muted/30">
                  <span className="text-sm text-muted-foreground">
                    {t.documents.amountHT}
                  </span>
                  <span className="text-sm font-medium">
                    {formatCurrency(doc.amount)}
                  </span>
                </div>
                <div className="flex justify-between p-3 border-b border-border bg-muted/30">
                  <span className="text-sm text-muted-foreground">
                    {t.documents.amountTVA} ({doc.vatRate}%)
                  </span>
                  <span className="text-sm font-medium">
                    {formatCurrency(tva)}
                  </span>
                </div>
                <div className="flex justify-between p-4 bg-primary/5 font-bold">
                  <span className="text-foreground">
                    {t.documents.amountTTC}
                  </span>
                  <span className="text-primary text-lg">
                    {formatCurrency(ttc)}
                  </span>
                </div>
              </div>
            </div>

            {/* Signature block */}
            {doc.status === "signed" && doc.signedAt ? (
              <div className="rounded-xl border-2 border-secondary/30 bg-secondary/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-secondary" />
                  <p className="font-semibold text-secondary">
                    {t.documents.signature.success}
                  </p>
                </div>
                <div className="space-y-1.5 text-sm">
                  <p>
                    <span className="text-muted-foreground">
                      {t.documents.viewer.signedBy}:
                    </span>{" "}
                    <span className="font-medium">{doc.signerName}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      {t.documents.viewer.signedOn}:
                    </span>{" "}
                    <span className="font-medium">
                      {formatDate(doc.signedAt, lang)}
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    {t.documents.viewer.hash}:
                  </p>
                  <p className="font-mono text-xs bg-muted rounded p-2 break-all text-foreground">
                    {doc.signatureHash}
                  </p>
                  <p className="text-xs text-secondary mt-2">
                    {t.documents.signatureInfo}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground rounded-lg border border-dashed border-border p-3">
                <Shield className="h-4 w-4 shrink-0" />
                <span>{t.documents.notSigned}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            data-ocid="documents.viewer.close_button"
          >
            {t.documents.viewer.close}
          </Button>
          <Button
            className="flex-1 bg-primary hover:bg-primary/90 text-white gap-2"
            onClick={() => generatePDF(doc, lang)}
            data-ocid="documents.viewer.download"
          >
            <Download className="h-4 w-4" />
            {t.documents.viewer.download}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── SignatureModal ─────────────────────────────────────────────────────────────

type SignatureModalProps = {
  doc: DemoDocument | null;
  open: boolean;
  onClose: () => void;
  onSigned: (hash: string) => void;
};

function SignatureModal({ doc, open, onClose, onSigned }: SignatureModalProps) {
  const { t, lang } = useTranslation();
  const { currentUser } = useAuthStore();
  const { signDocument } = useDocumentStore();
  const [confirmed, setConfirmed] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [resultHash, setResultHash] = useState("");

  if (!doc) return null;

  const ttc = calcTTC(doc.amount, doc.vatRate);
  const signerName = currentUser
    ? `${currentUser!.firstName} ${currentUser!.lastName}`
    : "Jean Dupont";

  function handleSign() {
    if (!confirmed || !doc) return;
    setSigning(true);
    setTimeout(() => {
      signDocument(doc.id, signerName);
      // Get the new hash from updated state
      const hash = `sha256:${Array.from(
        { length: 64 },
        () => "abcdef0123456789"[Math.floor(Math.random() * 16)],
      ).join("")}`;
      setResultHash(hash);
      setSigned(true);
      setSigning(false);
      onSigned(hash);
    }, 1200);
  }

  function handleClose() {
    setSigned(false);
    setConfirmed(false);
    setResultHash("");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        className="max-w-md"
        data-ocid="documents.signature.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <PenLine className="h-5 w-5 text-primary" />
            {t.documents.signature.title}
          </DialogTitle>
        </DialogHeader>

        {signed ? (
          // Success state
          <div
            className="py-4 space-y-4"
            data-ocid="documents.signature.success_state"
          >
            <div className="flex flex-col items-center text-center gap-3 py-4">
              <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-secondary" />
              </div>
              <div>
                <p className="font-display font-bold text-lg text-foreground">
                  {t.documents.signature.success}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDate(new Date().toISOString(), lang)}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-muted/50 p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {t.documents.signature.hash}
              </p>
              <p className="font-mono text-xs break-all text-foreground bg-white rounded-lg p-3 border border-border">
                {resultHash}
              </p>
              <p className="text-xs text-secondary">
                {t.documents.signature.onChain}
              </p>
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white"
              onClick={handleClose}
              data-ocid="documents.signature.close_button"
            >
              {t.common.close}
            </Button>
          </div>
        ) : (
          // Sign form
          <div className="space-y-5 py-2">
            {/* Document summary */}
            <div className="rounded-xl bg-muted/40 border border-border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Badge className={`text-xs ${docTypeBadgeClass(doc.docType)}`}>
                  {t.documents.docType[doc.docType]}
                </Badge>
                <span className="font-bold text-primary">
                  {formatCurrency(ttc)}
                </span>
              </div>
              <p className="font-semibold text-foreground text-sm">
                {doc.missionTitle}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {doc.description}
              </p>
            </div>

            {/* Confirm checkbox */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="sig-confirm"
                checked={confirmed}
                onCheckedChange={(v) => setConfirmed(v === true)}
                data-ocid="documents.signature.checkbox"
              />
              <label
                htmlFor="sig-confirm"
                className="text-sm text-foreground leading-relaxed cursor-pointer"
              >
                {t.documents.signature.confirm}
                <span className="block text-xs text-muted-foreground mt-0.5">
                  {t.documents.signature.confirmText}
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                data-ocid="documents.signature.cancel_button"
              >
                {t.common.cancel}
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-white gap-2"
                onClick={handleSign}
                disabled={!confirmed || signing}
                data-ocid="documents.signature.sign_button"
              >
                {signing ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    {lang === "fr" ? "Signature..." : "Signing..."}
                  </span>
                ) : (
                  <>
                    <PenLine className="h-4 w-4" />
                    {t.documents.signature.sign}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── CreateDocumentModal ───────────────────────────────────────────────────────

type CreateDocumentModalProps = {
  open: boolean;
  onClose: () => void;
  defaultMissionId?: number;
};

export function CreateDocumentModal({
  open,
  onClose,
  defaultMissionId,
}: CreateDocumentModalProps) {
  const { t, lang } = useTranslation();
  const { createDocument, updateDocumentStatus } = useDocumentStore();
  const { currentUser } = useAuthStore();
  const { missions } = useMissionStore();

  const [form, setForm] = useState({
    docType: "devis" as DocType,
    missionId: String(defaultMissionId ?? ""),
    amount: "",
    vatRate: "20",
    description: "",
  });
  const [creating, setCreating] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.missionId || !form.amount) return;

    setCreating(true);
    const mission = missions.find((t) => String(t.id) === form.missionId);

    setTimeout(() => {
      const newDoc = createDocument({
        docType: form.docType,
        missionId: Number(form.missionId),
        missionTitle: mission?.title ?? "",
        clientId: "client_1",
        clientName: "Jean Dupont",
        clientEmail: "jean.dupont@example.com",
        proId: currentUser ? `pro_${currentUser.id}` : "pro_1",
        proName: currentUser
          ? `${currentUser!.firstName} ${currentUser!.lastName}`
          : "Marc Dubois",
        proCompany: "Plomberie Dubois",
        proEmail: "marc.dubois@plomberie-dubois.fr",
        amount: Number(form.amount),
        vatRate: Number(form.vatRate),
        description: form.description,
      });

      // Auto-send for demo
      if (form.docType !== "devis") {
        updateDocumentStatus(newDoc.id, "sent");
      }

      setCreating(false);
      toast.success(
        lang === "fr"
          ? "Document créé avec succès !"
          : "Document created successfully!",
        {
          description:
            lang === "fr"
              ? `${t.documents.docType[form.docType]} #${newDoc.docNumber}`
              : `${t.documents.docType[form.docType]} #${newDoc.docNumber}`,
        },
      );
      setForm({
        docType: "devis",
        missionId: "",
        amount: "",
        vatRate: "20",
        description: "",
      });
      onClose();
    }, 600);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md" data-ocid="documents.create.dialog">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <FilePlus className="h-5 w-5 text-primary" />
            {t.documents.create.title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Doc type */}
          <div className="space-y-1.5">
            <Label>{t.documents.create.type}</Label>
            <Select
              value={form.docType}
              onValueChange={(v) =>
                setForm((prev) => ({ ...prev, docType: v as DocType }))
              }
            >
              <SelectTrigger data-ocid="documents.create.type_select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="devis">
                  📄 {t.documents.docType.devis}
                </SelectItem>
                <SelectItem value="bonPourAccord">
                  ✅ {t.documents.docType.bonPourAccord}
                </SelectItem>
                <SelectItem value="facture">
                  🧾 {t.documents.docType.facture}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mission */}
          <div className="space-y-1.5">
            <Label>{t.documents.create.mission}</Label>
            <Select
              value={form.missionId}
              onValueChange={(v) =>
                setForm((prev) => ({ ...prev, missionId: v }))
              }
            >
              <SelectTrigger data-ocid="documents.create.mission_select">
                <SelectValue
                  placeholder={
                    lang === "fr" ? "Choisir une mission" : "Choose a task"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {missions.length === 0 ? (
                  <SelectItem value="__none__" disabled>
                    {lang === "fr"
                      ? "Aucune mission disponible"
                      : lang === "de"
                        ? "Keine Aufträge verfügbar"
                        : lang === "es"
                          ? "Sin misiones disponibles"
                          : "No tasks available"}
                  </SelectItem>
                ) : (
                  missions.map((task) => (
                    <SelectItem key={task.id} value={String(task.id)}>
                      {task.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t.documents.create.amount}</Label>
              <Input
                type="number"
                min="0"
                required
                value={form.amount}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, amount: e.target.value }))
                }
                placeholder="150"
                data-ocid="documents.create.amount_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t.documents.create.vat}</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={form.vatRate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, vatRate: e.target.value }))
                }
                placeholder="20"
                data-ocid="documents.create.vat_input"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>{t.documents.create.description}</Label>
            <Textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder={
                lang === "fr"
                  ? "Détaillez les prestations incluses..."
                  : "Detail the services included..."
              }
              data-ocid="documents.create.description_textarea"
            />
          </div>

          {/* Preview TTC */}
          {form.amount && (
            <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t.documents.amountTTC}
              </span>
              <span className="font-bold text-primary">
                {formatCurrency(
                  calcTTC(Number(form.amount), Number(form.vatRate)),
                )}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              data-ocid="documents.create.cancel_button"
            >
              {t.common.cancel}
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-white gap-2"
              disabled={creating}
              data-ocid="documents.create.submit_button"
            >
              {creating ? (
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <FilePlus className="h-4 w-4" />
              )}
              {t.documents.create.submit}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── DocumentCard ──────────────────────────────────────────────────────────────

type DocumentCardProps = {
  doc: DemoDocument;
  userRole: "client" | "pro" | "admin";
  onView: (doc: DemoDocument) => void;
  onSign: (doc: DemoDocument) => void;
  onDownload: (doc: DemoDocument) => void;
  index: number;
  lang: string;
};

function DocumentCard({
  doc,
  userRole,
  onView,
  onSign,
  onDownload,
  index,
  lang,
}: DocumentCardProps) {
  const { t } = useTranslation();
  const Icon = docTypeIcon(doc.docType);
  const ttc = calcTTC(doc.amount, doc.vatRate);
  const ocidBase = `documents.item.${index}`;

  const canSign =
    userRole === "client" &&
    doc.status === "sent" &&
    doc.docType === "bonPourAccord";

  const isAwaitingSignature = canSign;

  return (
    <div
      className={`rounded-2xl border p-4 card-shadow transition-all hover:shadow-md ${
        isAwaitingSignature
          ? "border-warning/40 bg-warning/5"
          : "border-border/50 bg-white"
      }`}
      data-ocid={`${ocidBase}.card`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            doc.docType === "devis"
              ? "bg-primary/10"
              : doc.docType === "bonPourAccord"
                ? "bg-warning/15"
                : "bg-secondary/10"
          }`}
        >
          <Icon
            className={`h-5 w-5 ${
              doc.docType === "devis"
                ? "text-primary"
                : doc.docType === "bonPourAccord"
                  ? "text-foreground"
                  : "text-secondary"
            }`}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge className={`text-xs ${docTypeBadgeClass(doc.docType)}`}>
              {t.documents.docType[doc.docType]}
            </Badge>
            <Badge className={`text-xs ${statusBadgeClass(doc.status)}`}>
              {t.documents.status[doc.status]}
            </Badge>
            {isAwaitingSignature && (
              <Badge className="text-xs bg-warning/20 text-foreground border-warning/40 animate-pulse">
                ✍️ {t.documents.awaitingSignature}
              </Badge>
            )}
          </div>

          <h3 className="font-semibold text-sm text-foreground truncate">
            {doc.missionTitle}
          </h3>

          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="font-mono text-foreground/60">
              {doc.docNumber}
            </span>
            <span>{formatDate(doc.createdAt, lang)}</span>
            <span className="font-bold text-primary">
              {formatCurrency(ttc)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-8 text-xs gap-1"
          onClick={() => onView(doc)}
          data-ocid={`${ocidBase}.view_button`}
        >
          <Eye className="h-3.5 w-3.5" />
          {t.documents.actions.view}
        </Button>

        {canSign && (
          <Button
            size="sm"
            className="flex-1 h-8 text-xs gap-1 bg-warning hover:bg-warning/90 text-white"
            onClick={() => onSign(doc)}
            data-ocid={`${ocidBase}.sign_button`}
          >
            <PenLine className="h-3.5 w-3.5" />
            {t.documents.actions.sign}
          </Button>
        )}

        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 shrink-0"
          onClick={() => onDownload(doc)}
          data-ocid={`${ocidBase}.download_button`}
          title={t.documents.actions.download}
        >
          <Download className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ── DocumentsPage ─────────────────────────────────────────────────────────────

export function DocumentsPage() {
  const { t, lang } = useTranslation();
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();
  const { documents, getDocumentsByUser } = useDocumentStore();

  const [viewerDoc, setViewerDoc] = useState<DemoDocument | null>(null);
  const [signDoc, setSignDoc] = useState<DemoDocument | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const userRole = currentUser?.role ?? "client";
  const userId = userRole === "pro" ? "pro_1" : "client_1";
  const roleForQuery: "client" | "pro" = userRole === "pro" ? "pro" : "client";

  const myDocs =
    userRole === "admin" ? documents : getDocumentsByUser(userId, roleForQuery);

  const byType = (type: DocType) => myDocs.filter((d) => d.docType === type);

  const tabs: { key: string; label: string; docs: DemoDocument[] }[] = [
    { key: "all", label: t.documents.tabs.all, docs: myDocs },
    { key: "devis", label: t.documents.tabs.devis, docs: byType("devis") },
    {
      key: "bonPourAccord",
      label: t.documents.tabs.bonPourAccord,
      docs: byType("bonPourAccord"),
    },
    {
      key: "facture",
      label: t.documents.tabs.facture,
      docs: byType("facture"),
    },
  ];

  const signedCount = myDocs.filter((d) => d.status === "signed").length;
  const totalInvoiced = myDocs
    .filter((d) => d.docType === "facture")
    .reduce((sum, d) => sum + calcTTC(d.amount, d.vatRate), 0);

  const awaitingSignature = myDocs.filter(
    (d) =>
      d.status === "sent" &&
      d.docType === "bonPourAccord" &&
      userRole === "client",
  );

  const backLabel: Record<string, string> = {
    fr: "Retour",
    en: "Back",
    de: "Zurück",
    es: "Volver",
    nl: "Terug",
    it: "Indietro",
    pt: "Voltar",
    el: "Πίσω",
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <div className="mb-4">
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
            data-ocid="documents.back.button"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {backLabel[lang] ?? "Back"}
          </Button>
        </div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-7 w-7 text-primary" />
              {t.documents.title}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {t.documents.emptyDesc}
            </p>
          </div>
          {(userRole === "pro" || userRole === "admin") && (
            <Button
              className="bg-primary hover:bg-primary/90 text-white gap-2 shrink-0"
              onClick={() => setCreateOpen(true)}
              data-ocid="documents.create.open_modal_button"
            >
              <FilePlus className="h-4 w-4" />
              {t.documents.createDoc}
            </Button>
          )}
        </div>

        {/* Awaiting signature banner */}
        {awaitingSignature.length > 0 && (
          <div
            className="rounded-xl bg-warning/10 border border-warning/30 p-4 mb-6 flex items-center gap-3"
            data-ocid="documents.awaiting_signature.section"
          >
            <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
              <PenLine className="h-5 w-5 text-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">
                {awaitingSignature.length}{" "}
                {lang === "fr"
                  ? "document(s) en attente de votre signature"
                  : "document(s) awaiting your signature"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t.documents.awaitingSignature}
              </p>
            </div>
            <Button
              size="sm"
              className="bg-warning hover:bg-warning/90 text-white gap-1 shrink-0"
              onClick={() => setSignDoc(awaitingSignature[0])}
              data-ocid="documents.awaiting_signature.sign_button"
            >
              <PenLine className="h-3.5 w-3.5" />
              {t.documents.actions.sign}
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl bg-white border border-border/50 card-shadow p-4">
            <p className="text-2xl font-bold text-foreground">
              {myDocs.length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {lang === "fr" ? "Documents total" : "Total documents"}
            </p>
          </div>
          <div className="rounded-xl bg-white border border-border/50 card-shadow p-4">
            <p className="text-2xl font-bold text-secondary">{signedCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {lang === "fr" ? "Signés" : "Signed"}
            </p>
          </div>
          <div className="rounded-xl bg-white border border-border/50 card-shadow p-4">
            <p className="text-2xl font-bold text-warning">
              {awaitingSignature.length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {lang === "fr" ? "En attente" : "Pending"}
            </p>
          </div>
          <div className="rounded-xl bg-white border border-border/50 card-shadow p-4">
            <p className="text-lg font-bold text-primary">
              {formatCurrency(totalInvoiced)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {lang === "fr" ? "Facturé TTC" : "Invoiced incl. VAT"}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all">
          <TabsList className="mb-4" data-ocid="documents.filter.tab">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key}>
                {tab.label}
                {tab.docs.length > 0 && (
                  <span className="ml-1.5 text-xs opacity-60">
                    ({tab.docs.length})
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.key} value={tab.key}>
              {tab.docs.length === 0 ? (
                <div
                  className="rounded-2xl border-2 border-dashed border-border py-16 text-center"
                  data-ocid="documents.empty_state"
                >
                  <p className="text-4xl mb-4">📄</p>
                  <h3 className="font-display font-bold text-foreground mb-1">
                    {t.documents.empty}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t.documents.emptyDesc}
                  </p>
                  {(userRole === "pro" || userRole === "admin") && (
                    <Button
                      className="mt-4 bg-primary hover:bg-primary/90 text-white gap-2"
                      onClick={() => setCreateOpen(true)}
                      data-ocid="documents.empty_state.create_button"
                    >
                      <FilePlus className="h-4 w-4" />
                      {t.documents.createDoc}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tab.docs.map((doc, i) => (
                    <DocumentCard
                      key={doc.id}
                      doc={doc}
                      userRole={roleForQuery}
                      onView={setViewerDoc}
                      onSign={setSignDoc}
                      onDownload={(d) => generatePDF(d, lang)}
                      index={i + 1}
                      lang={lang}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Modals */}
      <DocumentViewerModal
        doc={viewerDoc}
        open={!!viewerDoc}
        onClose={() => setViewerDoc(null)}
        lang={lang}
      />

      <SignatureModal
        doc={signDoc}
        open={!!signDoc}
        onClose={() => setSignDoc(null)}
        onSigned={() => {
          setSignDoc(null);
          toast.success(
            lang === "fr"
              ? "Document signé et enregistré on-chain !"
              : "Document signed and recorded on-chain!",
          );
        }}
      />

      <CreateDocumentModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </main>
  );
}
