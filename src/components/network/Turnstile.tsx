"use client";

import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import type { Lang } from "@/lib/scene-contract";

/**
 * Cloudflare Turnstile widget (docs-back/07 §10: the backend checks the token
 * with Cloudflare before processing). The script loads only when the widget
 * gets near the viewport, so the page does not pay for it on arrival.
 * Tokens are single use: the form calls `reset()` after every attempt.
 */

interface TurnstileOptions {
  sitekey: string;
  language?: string;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "flexible" | "compact";
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
  "timeout-callback"?: () => void;
}
interface TurnstileApi {
  render: (el: HTMLElement, options: TurnstileOptions) => string | undefined;
  reset: (id?: string) => void;
  remove: (id: string) => void;
}
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let loading: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (loading) return loading;
  loading = new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SRC;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile")));
    script.onerror = () => {
      script.remove();
      loading = null;
      reject(new Error("turnstile"));
    };
    document.head.appendChild(script);
  });
  return loading;
}

export interface TurnstileHandle {
  reset: () => void;
}

interface TurnstileProps {
  siteKey: string;
  lang: Lang;
  /** A fresh token, or null when it expires, fails or is reset. */
  onToken: (token: string | null) => void;
  /** Called when the widget cannot load or fails (blocked script, network). */
  onError: () => void;
  ref?: Ref<TurnstileHandle>;
  className?: string;
  describedBy?: string;
}

export function Turnstile({ siteKey, lang, onToken, onError, ref, className, describedBy }: TurnstileProps) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const [near, setNear] = useState(false);
  // Latest callbacks without re-rendering the widget.
  const handlers = useRef({ onToken, onError });
  useEffect(() => {
    handlers.current = { onToken, onError };
  });

  useImperativeHandle(ref, () => ({
    reset: () => {
      handlers.current.onToken(null);
      if (widget.current && window.turnstile) window.turnstile.reset(widget.current);
    },
  }));

  // Load when the widget is within a screen of the viewport.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setNear(true), { rootMargin: "600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!near) return;
    let cancelled = false;
    loadTurnstile()
      .then((ts) => {
        if (cancelled || !box.current || widget.current) return;
        widget.current =
          ts.render(box.current, {
            sitekey: siteKey,
            language: lang,
            theme: "light",
            size: "flexible",
            callback: (token) => handlers.current.onToken(token),
            "expired-callback": () => handlers.current.onToken(null),
            "timeout-callback": () => handlers.current.onToken(null),
            "error-callback": () => {
              handlers.current.onToken(null);
              handlers.current.onError();
            },
          }) ?? null;
      })
      .catch(() => !cancelled && handlers.current.onError());
    return () => {
      cancelled = true;
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current);
      if (widget.current) handlers.current.onToken(null);
      widget.current = null;
    };
    // The language is fixed per render of the widget; a change re-renders it.
  }, [near, siteKey, lang]);

  return <div ref={box} className={className} aria-describedby={describedBy} />;
}
