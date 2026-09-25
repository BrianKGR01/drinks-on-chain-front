"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { SiteChrome } from "@/components/hud/SiteChrome";
import { SiteFooter } from "@/components/site/SiteFooter";
import { UI } from "@/content/i18n";
import { useExperience } from "@/store/experience";
import styles from "./PageShell.module.css";

interface PageShellProps {
  /** Small rotated/upper caption shown above the page (e.g. "Historia"). */
  eyebrow: string;
  children: ReactNode;
  /** Hide the "back to map" link (used on the home). */
  hideBack?: boolean;
  className?: string;
}

/** Common frame of the editorial pages: MENU, eyebrow, back link, content. */
export function PageShell({ eyebrow, children, hideBack = false, className = "" }: PageShellProps) {
  const lang = useExperience((s) => s.lang);
  const t = UI[lang];
  return (
    <>
      <SiteChrome />
      <main id="content" className={`${styles.page} ${className}`}>
        <h1 className={styles.eyebrow}>{eyebrow}</h1>
        {!hideBack ? (
          <Link href="/" className={styles.back}>
            {t.backToMap}
          </Link>
        ) : null}
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
