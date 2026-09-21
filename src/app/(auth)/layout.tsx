import type { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import "../(marketing)/imageworks.css";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className={GeistSans.variable}>{children}</div>;
}
