"use client";

import Link from "next/link";
import { useExperience } from "@/store/experience";
import { UI } from "@/content/i18n";
import styles from "./Logo.module.css";

interface LogoProps {
  className?: string;
  /** Wrap in a link to home (default true). */
  link?: boolean;
  size?: "md" | "lg";
}

/**
 * Text-only wordmark laid out like a classic wine-house label:
 * small eyebrow, the name between two hairlines, italic provenance line.
 */
export function Logo({ className = "", link = true, size = "md" }: LogoProps) {
  const lang = useExperience((s) => s.lang);
  const t = UI[lang];
  const body = (
    <span className={`${styles.logo} ${size === "lg" ? styles.lg : ""} ${className}`}>
      <span className={styles.eyebrow}>{t.brandEyebrow}</span>
      <span className={styles.name}>
        <span className={styles.rule} aria-hidden="true" />
        <span className={styles.nameText}>Drinks on Chain</span>
        <span className={styles.rule} aria-hidden="true" />
      </span>
      <span className={styles.tagline}>{t.brandTagline}</span>
    </span>
  );
  return link ? (
    <Link href="/" className={styles.link}>
      {body}
    </Link>
  ) : (
    body
  );
}
