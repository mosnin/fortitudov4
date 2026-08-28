export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: "What does it cost?",
    a: "Tell us what you need and we send you a fixed price. You see it before you pay anything, and it does not move once you approve it. No hourly billing and no surprise bills.",
  },
  {
    q: "How soon can I start?",
    a: "You can tell us about the project today. Once the scope and price are approved, your project page opens and the work moves into discovery.",
  },
  {
    q: "Do you use AI?",
    a: "Yes, on repetitive setup, boilerplate, tests, and small repeated changes. A senior builder still makes the judgment calls and checks every change before it lands.",
  },
  {
    q: "How do I see how it is going?",
    a: "Your project page shows the current stage, files, messages, decisions, and progress. It is the same operating view our team works from.",
  },
  {
    q: "What if I want changes?",
    a: "Changes inside the agreed scope are handled as part of the project. If you ask for something outside it, we price that separately before doing the work.",
  },
  {
    q: "Who owns it at the end?",
    a: "You do. The code, design files, campaign work, and logins are handed over at launch. Nothing is locked to Fortitudo.",
  },
];
