"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

export function LandingRedirect() {
  const router = useRouter();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) router.push("/dashboard");
  }, [isConnected, router]);

  return null;
}
