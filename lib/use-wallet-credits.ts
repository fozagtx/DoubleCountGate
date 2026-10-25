"use client";

import { useCallback, useEffect, useState } from "react";
import type { Address } from "viem";
import { registryAddress, registryDeployBlock } from "@/lib/chain";
import { readWalletCredits, type WalletCredit } from "@/lib/credits";

export function useWalletCredits(address: Address | undefined) {
  const [credits, setCredits] = useState<WalletCredit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => setVersion((value) => value + 1), []);

  useEffect(() => {
    let current = true;
    if (!address || !registryAddress || registryDeployBlock === null) {
      setCredits([]);
      setLoading(false);
      setError(null);
      return () => {
        current = false;
      };
    }

    setLoading(true);
    setError(null);
    readWalletCredits(address)
      .then((nextCredits) => {
        if (current) setCredits(nextCredits);
      })
      .catch(() => {
        if (current) setError("We couldn't load your credits right now. Please try again.");
      })
      .finally(() => {
        if (current) setLoading(false);
      });

    return () => {
      current = false;
    };
  }, [address, version]);

  return { credits, loading, error, reload };
}
