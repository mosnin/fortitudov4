"use client";

/**
 * The dashboard's "Ask Helix" field. A plain GET form to /helix?q=… (so it
 * works before hydration); once hydrated, the submit button morphs into its
 * loading state while the Helix page opens, and the placeholder cycles through
 * real questions clients ask, so the card reads as live rather than a blank box.
 */

import { useEffect, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { MorphButton } from "@/components/ui/morph-button";

const EXAMPLES = [
  "What’s left before launch?",
  "What did you finish this week?",
  "Is anything waiting on me?",
  "When does the next phase start?",
];

export function HelixAskForm() {
  const [pending, setPending] = useState(false);
  const [example, setExample] = useState(0);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (focused) return;
    const t = window.setInterval(() => setExample((i) => (i + 1) % EXAMPLES.length), 3500);
    return () => window.clearInterval(t);
  }, [focused]);

  return (
    <form
      action="/helix"
      method="get"
      onSubmit={() => setPending(true)}
      className="flex flex-col gap-3 sm:flex-row"
    >
      <label htmlFor="helix-q" className="sr-only">
        Your question
      </label>
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-white/50" />
        <input
          id="helix-q"
          name="q"
          required
          maxLength={500}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={`e.g. ${EXAMPLES[example]}`}
          className="h-11 w-full rounded-lg border border-transparent bg-white pr-3 pl-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-white focus:ring-2 focus:ring-white/50 focus:outline-none dark:bg-black/25 dark:text-white dark:placeholder:text-white/50"
        />
      </div>
      <MorphButton
        type="submit"
        tone="inverse"
        size="lg"
        state={pending ? "loading" : "idle"}
        loadingLabel="Opening"
      >
        Ask
        <ArrowRight className="h-4 w-4" />
      </MorphButton>
    </form>
  );
}
