"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { Experiment } from "@/lib/experiments";

export default function ExperimentFrame({
  experiment,
  children,
}: {
  experiment: Experiment;
  children: ReactNode;
}) {
  const { title, description, category, tech } = experiment;

  // default: overlay is visible
  const [visible, setVisible] = useState(true);

  // press "H" to toggle (ignored while typing in inputs)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.toLowerCase() === "h") setVisible((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // shared fade/slide behaviour for each corner element
  const fade = (from: string) =>
    `transition-all duration-300 ease-out ${
      visible
        ? "pointer-events-auto translate-x-0 translate-y-0 opacity-100"
        : `pointer-events-none opacity-0 ${from}`
    }`;

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      {/* the live experiment fills the whole viewport */}
      <div className="absolute inset-0">{children}</div>

      {/* overlay: ignores pointer events itself so orbit / hover still reach the canvas.
          mix-blend-difference keeps the text readable on any background colour. */}
      <div className="pointer-events-none absolute inset-0 z-10 p-4 text-white mix-blend-difference sm:p-6">
        {/* top-left: back */}
        <Link
          href="/"
          aria-hidden={!visible}
          tabIndex={visible ? 0 : -1}
          className={`absolute left-4 top-4 text-sm opacity-70 hover:opacity-100 sm:left-6 sm:top-6 ${fade("-translate-y-2")}`}
        >
          ← Back
        </Link>

        {/* top-right: toggle (always visible) */}
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={visible ? "Hide info (H)" : "Show info (H)"}
          title={visible ? "Hide info (H)" : "Show info (H)"}
          className={`pointer-events-auto absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white transition-opacity duration-300 hover:opacity-100 sm:right-6 sm:top-6 ${
            visible ? "opacity-70" : "opacity-40"
          }`}
        >
          {visible ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M17.9 17.9A10.9 10.9 0 0 1 12 19c-6.4 0-10-7-10-7a18 18 0 0 1 4.1-4.9M9.9 5.2A10 10 0 0 1 12 5c6.4 0 10 7 10 7a18 18 0 0 1-2.2 3.2" />
              <path d="M2 2l20 20" />
            </svg>
          )}
        </button>

        {/* bottom-left: name */}
        <div
          aria-hidden={!visible}
          title={description}
          className={`absolute bottom-4 left-4 max-w-[60%] sm:bottom-6 sm:left-6 ${fade("translate-y-2")}`}
        >
          <h1 className="text-lg font-semibold leading-tight sm:text-xl">{title}</h1>
        </div>

        {/* bottom-right: category + tech tags */}
        <div
          aria-hidden={!visible}
          className={`absolute bottom-4 right-4 flex max-w-[50%] flex-wrap justify-end gap-1.5 sm:bottom-6 sm:right-6 ${fade("translate-y-2")}`}
        >
          <span className="rounded-full border border-white bg-white px-2.5 py-0.5 text-[11px] font-medium text-black">
            {category}
          </span>
          {tech.map((t) => (
            <span
              key={t}
              className="rounded-full border border-white px-2.5 py-0.5 text-[11px]"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
