/**
 * Document store — manages devis, bons pour accord, and factures
 * locally (demo mode). Follows the same pattern as chat-store.ts.
 */
import {
  type ReactNode,
  createContext,
  createElement,
  useContext,
  useState,
} from "react";

export type DocType = "devis" | "bonPourAccord" | "facture";
export type DocStatus = "draft" | "sent" | "signed" | "archived";

export type DemoDocument = {
  id: number;
  docType: DocType;
  status: DocStatus;
  missionId: number;
  missionTitle: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  proId: string;
  proName: string;
  proCompany: string;
  proEmail: string;
  amount: number; // HT
  vatRate: number; // e.g. 20
  description: string;
  createdAt: string; // ISO date string
  signedAt?: string;
  signerName?: string;
  signatureHash?: string;
  docNumber: string; // e.g. "DEV-2025-001"
};

// ── seed data ────────────────────────────────────────────────────────────────

const SEED_DOCS: DemoDocument[] = [];

// ── helpers ──────────────────────────────────────────────────────────────────

function generateDocNumber(
  docType: DocType,
  existingDocs: DemoDocument[],
): string {
  const prefix =
    docType === "devis" ? "DEV" : docType === "bonPourAccord" ? "BPA" : "FAC";
  const year = new Date().getFullYear();
  const count = existingDocs.filter((d) => d.docType === docType).length + 1;
  return `${prefix}-${year}-${String(count).padStart(3, "0")}`;
}

export function generateSignatureHash(): string {
  const chars = "abcdef0123456789";
  let hash = "sha256:";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

// ── context ──────────────────────────────────────────────────────────────────

type DocumentStoreCtx = {
  documents: DemoDocument[];
  getDocumentsByMission: (missionId: number) => DemoDocument[];
  getDocumentsByUser: (
    userId: string,
    role: "client" | "pro",
  ) => DemoDocument[];
  createDocument: (data: Partial<DemoDocument>) => DemoDocument;
  signDocument: (docId: number, signerName: string) => void;
  archiveDocument: (docId: number) => void;
  updateDocumentStatus: (docId: number, status: DocStatus) => void;
};

const DocumentStoreContext = createContext<DocumentStoreCtx | undefined>(
  undefined,
);

export function DocumentStoreProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<DemoDocument[]>(SEED_DOCS);

  function getDocumentsByMission(missionId: number): DemoDocument[] {
    return documents.filter((d) => d.missionId === missionId);
  }

  function getDocumentsByUser(
    userId: string,
    role: "client" | "pro",
  ): DemoDocument[] {
    return documents.filter((d) =>
      role === "client" ? d.clientId === userId : d.proId === userId,
    );
  }

  function createDocument(data: Partial<DemoDocument>): DemoDocument {
    const newDoc: DemoDocument = {
      id: Date.now(),
      docType: data.docType ?? "devis",
      status: "draft",
      missionId: data.missionId ?? 0,
      missionTitle: data.missionTitle ?? "",
      clientId: data.clientId ?? "",
      clientName: data.clientName ?? "",
      clientEmail: data.clientEmail ?? "",
      proId: data.proId ?? "",
      proName: data.proName ?? "",
      proCompany: data.proCompany ?? "",
      proEmail: data.proEmail ?? "",
      amount: data.amount ?? 0,
      vatRate: data.vatRate ?? 20,
      description: data.description ?? "",
      createdAt: new Date().toISOString(),
      docNumber: generateDocNumber(data.docType ?? "devis", documents),
    };
    setDocuments((prev) => [newDoc, ...prev]);
    return newDoc;
  }

  function signDocument(docId: number, signerName: string): void {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              status: "signed" as DocStatus,
              signedAt: new Date().toISOString(),
              signerName,
              signatureHash: generateSignatureHash(),
            }
          : d,
      ),
    );
  }

  function archiveDocument(docId: number): void {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId ? { ...d, status: "archived" as DocStatus } : d,
      ),
    );
  }

  function updateDocumentStatus(docId: number, status: DocStatus): void {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, status } : d)),
    );
  }

  return createElement(
    DocumentStoreContext.Provider,
    {
      value: {
        documents,
        getDocumentsByMission,
        getDocumentsByUser,
        createDocument,
        signDocument,
        archiveDocument,
        updateDocumentStatus,
      },
    },
    children,
  );
}

export function useDocumentStore() {
  const ctx = useContext(DocumentStoreContext);
  if (!ctx) {
    throw new Error(
      "useDocumentStore must be used within DocumentStoreProvider",
    );
  }
  return ctx;
}
