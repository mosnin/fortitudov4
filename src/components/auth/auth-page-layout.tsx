"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/imageworks/logo";
import { PHOTOS, photoSrc } from "@/components/imageworks/lib/photos";

export interface AuthPageLayoutProps {
  children: ReactNode;
  heading: string;
  subheading?: string;
}

// Imageworks typography, image framing and surfaces; authentication behavior
// remains in the existing Clerk pages.
export function AuthPageLayout({ children, heading, subheading }: AuthPageLayoutProps) {
  return (
    <main data-imageworks-site className="grid min-h-dvh bg-background text-foreground lg:grid-cols-2">
      <aside className="relative m-4 hidden overflow-hidden rounded-2xl bg-muted lg:flex lg:flex-col lg:justify-between lg:p-10">
        <Image src={photoSrc(PHOTOS[3], 1400, 1800)} alt="" fill sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/40" />
        <Link href="/" aria-label="Fortitudo home" className="relative self-start text-white"><Logo className="h-7" /></Link>
        <div className="relative max-w-lg text-white"><p className="text-sm">Fortitudo client workspace</p><h2 className="mt-5 text-5xl leading-[1.05] tracking-[-0.02em]">Your project,<br />from brief to launch.</h2><p className="mt-5 max-w-sm text-base leading-7 text-white/80">Review progress, share feedback and keep your project information together.</p></div>
      </aside>
      <div className="flex min-h-dvh flex-col px-6 py-8 sm:px-10">
        <Link href="/" aria-label="Fortitudo home" className="self-start lg:hidden"><Logo className="h-7" /></Link>
        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-12">
          {heading && <header className="mb-7"><h1 className="text-3xl leading-tight tracking-tight">{heading}</h1>{subheading && <p className="mt-3 text-sm leading-6 text-muted-foreground">{subheading}</p>}</header>}
          {children}
          <Link href="/" className="mt-8 inline-flex min-h-11 items-center self-center text-sm text-muted-foreground underline underline-offset-4">Back to Fortitudo</Link>
        </div>
        <p className="mx-auto max-w-[400px] text-center text-xs leading-6 text-muted-foreground">By continuing, you agree to our <Link href="/terms" className="underline underline-offset-4">Terms of Service</Link> and <Link href="/privacy" className="underline underline-offset-4">Privacy Policy</Link>.</p>
      </div>
    </main>
  );
}
