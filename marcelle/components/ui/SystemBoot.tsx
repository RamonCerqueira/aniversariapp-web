"use client";

import { useState, useEffect } from "react";
import AppleLoader from "./AppleLoader";

export default function SystemBoot({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const visited = sessionStorage.getItem("marcelle-booted");
    if (visited) setLoading(false);
  }, []);

  const handleComplete = () => {
    sessionStorage.setItem("marcelle-booted", "true");
    setLoading(false);
  };

  if (loading) {
    return <AppleLoader onComplete={handleComplete} />;
  }

  return <>{children}</>;
}
