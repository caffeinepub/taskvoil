/**
 * Payment Store — manages Alchemy Pay (fiat) + ICPAY (crypto) + Stripe payments with escrow logic.
 */
import {
  type ReactNode,
  createContext,
  createElement,
  useContext,
  useState,
} from "react";

export type PaymentMethod = "card" | "icp" | "btc" | "usdc" | "stripe";
export type PaymentStatus = "pending" | "processing" | "confirmed" | "failed";

export type Payment = {
  id: string;
  missionId: number;
  missionTitle: string;
  amount: number; // mission amount
  commission: number; // 8% of amount
  insurance: number; // 3% if enabled, else 0
  discount: number; // promo reduction
  total: number; // amount + commission + insurance - discount
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  confirmedAt?: string;
  promoCode?: string;
};

type PaymentStoreCtx = {
  payments: Payment[];
  addPayment: (
    data: Omit<Payment, "id" | "createdAt"> & { confirmedAt?: string },
  ) => Payment;
  updateStatus: (
    id: string,
    status: PaymentStatus,
    confirmedAt?: string,
  ) => void;
  getPaymentByMission: (missionId: number) => Payment | undefined;
};

const PaymentStoreContext = createContext<PaymentStoreCtx | undefined>(
  undefined,
);

export function PaymentStoreProvider({ children }: { children: ReactNode }) {
  const [payments, setPayments] = useState<Payment[]>([]);

  function addPayment(
    data: Omit<Payment, "id" | "createdAt"> & { confirmedAt?: string },
  ): Payment {
    const payment: Payment = {
      ...data,
      id: `pay_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setPayments((prev) => [payment, ...prev]);
    return payment;
  }

  function updateStatus(
    id: string,
    status: PaymentStatus,
    confirmedAt?: string,
  ): void {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status, ...(confirmedAt ? { confirmedAt } : {}) }
          : p,
      ),
    );
  }

  function getPaymentByMission(missionId: number): Payment | undefined {
    return payments.find((p) => p.missionId === missionId);
  }

  return createElement(
    PaymentStoreContext.Provider,
    { value: { payments, addPayment, updateStatus, getPaymentByMission } },
    children,
  );
}

export function usePaymentStore() {
  const ctx = useContext(PaymentStoreContext);
  if (!ctx)
    throw new Error("usePaymentStore must be used within PaymentStoreProvider");
  return ctx;
}
