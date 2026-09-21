"use client";
import { createElement, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { rangeSlider01 } from "./effects/library/rangeSlider01";
const TYPES = [
  "Website",
  "Ecommerce",
  "Software",
  "AI workflow",
  "Integration",
  "Not sure yet",
];
export function ProjectPlanner() {
  const [type, setType] = useState("Website");
  const [weeks, setWeeks] = useState(8);
  const [goal, setGoal] = useState("");
  const [copied, setCopied] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scope = root.current;
    if (!scope) return;
    const cleanup = rangeSlider01(scope);
    const onInput = (e: Event) => {
      if (e instanceof CustomEvent) {
        setWeeks(e.detail.value);
        setCopied(false);
      }
    };
    scope.addEventListener("input", onInput);
    scope.addEventListener("change", onInput);
    return () => {
      scope.removeEventListener("input", onInput);
      scope.removeEventListener("change", onInput);
      cleanup?.();
    };
  }, []);
  const brief = `Project: ${type}\nPreferred timing: ${weeks} weeks (to discuss)\nWhat needs to change: ${goal || "To discuss"}`;
  async function copy() {
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }
  return (
    <section
      className="editorial-section brief-builder"
      ref={root}
      aria-label="Prepare your project brief"
    >
      <div>
        <fieldset>
          <legend>What are you looking to build?</legend>
          <div className="brief-options">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={type === t}
                onClick={() => {
                  setType(t);
                  setCopied(false);
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>When would you like to launch?</legend>
          <div
            className="range-slider"
            data-range-slider
            data-min="2"
            data-max="52"
            data-step="1"
            data-value="8"
          >
            <div className="meta">
              <span id="timing-label" className="label">
                Preferred timing · weeks
              </span>
              {createElement("number-flow", {
                className: "value",
                "data-slider-value": "",
                "data-will-change": "",
              })}
            </div>
            <div className="control" data-slider-control>
              <div className="track" data-slider-track>
                <div className="track-clip">
                  <div className="fill" data-slider-fill />
                </div>
                <div className="ticks" data-slider-ticks aria-hidden />
                <div
                  className="thumb"
                  data-slider-thumb
                  role="slider"
                  aria-valuemin={2}
                  aria-valuemax={52}
                  aria-valuenow={8}
                  tabIndex={0}
                  aria-labelledby="timing-label"
                >
                  <span className="thumb-mark" aria-hidden />
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Your preference, not an estimated delivery date. Timing is agreed
            after scoping.
          </p>
        </fieldset>
        <label htmlFor="project-goal">What needs to change?</label>
        <textarea
          id="project-goal"
          value={goal}
          maxLength={2000}
          onChange={(e) => {
            setGoal(e.target.value);
            setCopied(false);
          }}
          placeholder="The problem, the people it affects, and what a useful result would look like."
        />
      </div>
      <aside className="brief-summary">
        <p className="editorial-label">Your starting point</p>
        <h2>A brief worth discussing.</h2>
        <dl>
          <div>
            <dt>Project</dt>
            <dd>{type}</dd>
          </div>
          <div>
            <dt>Preferred timing</dt>
            <dd>{weeks} weeks, to discuss</dd>
          </div>
          <div>
            <dt>The change</dt>
            <dd>
              {goal || "Add a few words about the problem you want to solve."}
            </dd>
          </div>
        </dl>
        <div className="editorial-actions">
          <button type="button" className="button-04" onClick={copy}>
            <span className="span-wrapper">
              <span className="span-text">
                {copied ? "Copied" : "Copy brief"}
              </span>
            </span>
          </button>
          <Link href="/contact" className="underline underline-offset-4">
            Contact Fortitudo →
          </Link>
        </div>
        <p role="status">
          {copied
            ? "Your brief is copied. Paste it into the contact form when you are ready."
            : "Nothing is sent from this planner. Copy your brief and share it when you are ready."}
        </p>
      </aside>
    </section>
  );
}
