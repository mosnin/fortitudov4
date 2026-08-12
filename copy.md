# How Fortitudo writes

One page. If a sentence on the site breaks a rule here, the sentence is wrong.

## The test

**Read it out loud to a ten-year-old. If they can tell you what we do and why
they'd want it, it ships. If they ask a follow-up question, rewrite it.**

Not because our buyers are children — they're founders, and they're smart. But
they're busy, they're skimming on a phone, and they've been pitched by nine
agencies this month who all sounded the same. Simple language is not talking
down. It is the only thing that survives a five-second skim.

## Sell the outcome, not the work

Nobody wants a website. They want customers who can find them. Nobody wants
"AI automation". They want their evenings back.

Every headline answers **"what do I get?"** — never "what do you do?"

| Don't | Do |
| --- | --- |
| Custom web applications architected to scale | An app your team will actually use |
| Conversion-optimised funnel infrastructure | More of your visitors turn into customers |
| We leverage AI tooling to accelerate delivery | We build it faster, so you sell sooner |
| Enterprise-grade software solutions | Software that doesn't break when you grow |
| Bespoke digital experiences | A site that makes people want to buy |

## The four things that make an offer land

Borrowed from Hormozi's value equation, and worth keeping in your head while
writing. Value goes **up** when the outcome is bigger and more believable, and
**down** when it takes longer and costs more effort.

1. **The outcome** — say the actual result, in their words. "More customers",
   not "growth enablement".
2. **Why they'd believe it** — the fixed quote, the senior team, the tracker
   they can watch. Proof beats adjectives.
3. **How long** — say it. Vague timing reads as "slow".
4. **How little they have to do** — "you don't manage anything" is worth more
   than a feature list.

## Rules

**Short words.** If a shorter word means the same thing, it is the right word.
Use → not utilise. Buy → not purchase. Build → not architect. Start → not
commence.

**Short sentences.** One idea each. If you need a comma to hold two ideas
together, use a full stop instead.

**Say "you" and "we".** Not "clients", not "the team", not "Fortitudo
provides". You and we.

**Numbers beat adjectives.** "30 days of support" beats "comprehensive
support". But only if the number is true — see the no-fabrication rule below.

**Cut the first sentence.** It is almost always a throat-clear. Start at the
second one.

## Banned words

These are agency noise. Every one of them can be deleted or replaced with a
plain word, and the sentence gets better:

> leverage · seamless · bespoke · robust · cutting-edge · best-in-class ·
> synergy · holistic · end-to-end · turnkey · solutions (as a noun) ·
> empower · unlock · elevate · transform (unless something literally changes
> shape) · innovative · state-of-the-art · world-class · passionate ·
> journey · ecosystem · space (as in "the fintech space") · deliverables ·
> utilise · facilitate · commence · endeavour

Also banned: "we're excited to", "we're passionate about", and any sentence
about how much we love what we do. Nobody is buying our feelings.

## Jargon that needs translating

Words we use internally that a buyer does not:

| Internal | On the site |
| --- | --- |
| ship / shipped | live, launched, out in the world |
| engagement | project, or the actual thing being built |
| scope | what we agreed to build |
| stack | the tools it's built with |
| pipeline | the stages your project moves through |
| onboarding | telling us what you want |
| retainer | we keep working on it after launch |
| deliverable | what you get |

## Two things that never change

**Say what is true.** This site was cleared of invented case studies, a fake
star rating, an invented staff roster, and plan tiers that did not exist.
Simple copy is not permission to overclaim — it makes overclaiming more
obvious, because there is nowhere for a weasel word to hide. If you cannot
point at where a number came from, do not write the number.

**Every language says the same thing.** No page is translated yet — the site
is English-only, and the only translated strings anywhere are the currency
note in `src/lib/i18n/dictionaries/pricing.ts` (en/es/ru). `plans/i18n.md` is
the plan for fixing that. When it happens: a translation must carry the same
plain meaning, not the same words — an idiom that lands in English and
confuses in Spanish is a failed translation, even if it is accurate.
Translate the outcome, not the sentence. Every language has to pass the
ten-year-old test **in that language**, not in English first.

---

# Section copy: the pinboard

`src/components/marketing/giga/pinboard-cta.tsx` — a closing ask drawn as a
pinboard: four sticky notes you can peel and drag, pinned around a plate.
Written down here because the strings live in the component for now; they
belong in the home dictionary and the file says so.

**The plate**

| Slot | Words |
| --- | --- |
| Eyebrow | The board |
| Heading | Write it down. We build it. |
| Lead | Every project starts as a note like these. Tell us what you want, and we come back with what it costs and how long it takes. |
| Button | Tell us what you need → `/contact` |
| Hint | Drag the notes. |

**The four notes** — the questions we would ask you anyway:

1. What are you trying to fix?
2. Who is it for?
3. When does it go live?
4. What can you spend?

**Why the notes ask rather than tell.** The section this was ported from put a
made-up quote on every note and "2,500+ early adopters" over the top of them. A
note on a board is the shape testimonials come in, so anything written on one
reads as proof — and we have none to show. A question is the one kind of text
that can sit there honestly: it is our copy, it is true, and it is the actual
first move of working with us. Four short questions also do the job the drop
wanted the quotes to do — they tell you what we need from you before you press
the button, so the form is not a surprise.

**Why "what can you spend" and not "what's your budget".** Shorter words, and
it is the question we mean. Budget is a word people hide behind.
