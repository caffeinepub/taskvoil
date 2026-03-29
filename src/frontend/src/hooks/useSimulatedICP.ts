import { useCallback, useRef, useState } from "react";

export type ICPProvider = "ii" | "nfid" | "plug";

const PRINCIPAL_KEYS: Record<ICPProvider, string> = {
  ii: "taskvoila_principal_ii",
  nfid: "taskvoila_principal_nfid",
  plug: "taskvoila_principal_plug",
};

function generatePrincipal(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const rand = () =>
    Array.from(
      { length: 5 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
  return [rand(), rand(), rand(), rand(), rand()].join("-");
}

function getPrincipal(provider: ICPProvider): string {
  const key = PRINCIPAL_KEYS[provider];
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const principal = generatePrincipal();
  localStorage.setItem(key, principal);
  return principal;
}

export type SimulatedICPModalState = {
  open: boolean;
  provider: ICPProvider | null;
  progress: number;
};

export function useSimulatedICP() {
  const [modalState, setModalState] = useState<SimulatedICPModalState>({
    open: false,
    provider: null,
    progress: 0,
  });

  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const simulateICP = useCallback(
    (provider: ICPProvider): Promise<string> =>
      new Promise((resolve) => {
        setModalState({ open: true, provider, progress: 0 });

        // Animate progress bar over 1.4s
        let prog = 0;
        if (progressIntervalRef.current)
          clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = setInterval(() => {
          prog += 7;
          if (prog >= 95) {
            clearInterval(progressIntervalRef.current!);
            prog = 95;
          }
          setModalState((prev) => ({ ...prev, progress: prog }));
        }, 100);

        setTimeout(() => {
          if (progressIntervalRef.current)
            clearInterval(progressIntervalRef.current);
          setModalState({ open: false, provider: null, progress: 0 });
          const principal = getPrincipal(provider);
          resolve(principal);
        }, 1500);
      }),
    [],
  );

  return { simulateICP, modalState };
}
