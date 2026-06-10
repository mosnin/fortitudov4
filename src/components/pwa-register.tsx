"use client";

import { useEffect } from "react";

// Registers the service worker so the app is installable. Best-effort and
// silent — a registration failure never affects the page.
export function PwaRegister() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
