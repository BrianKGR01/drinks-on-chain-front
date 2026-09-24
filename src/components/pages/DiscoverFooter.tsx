"use client";

import Link from "next/link";
import { UI } from "@/content/i18n";
import { useExperience } from "@/store/experience";
import styles from "./DiscoverFooter.module.css";

interface DiscoverFooterProps {
  href: string;
  caption: string;
  prepend?: string;
}

/** Large closing call-to-action, as at the bottom of every reference page. */
export function DiscoverFooter({ href, caption, prepend }: DiscoverFooterProps) {
  const lang = useExperience((s) => s.lang);
  const t = UI[lang];
  return (
    <footer className={styles.footer}>
      {prepend ? <span className={styles.prepend}>{prepend}</span> : null}
      <Link href={href} className={styles.caption}>
        {caption}
      </Link>
      <span className={styles.decoration} aria-hidden="true" />
      <p className={styles.notice}>
        {lang === "es"
          ? "Consuma con moderación. Venta prohibida a menores de 18 años."
          : "Drink responsibly. Not for sale to under-18s."}
        <br />
        {t.madeBy}
      </p>
    </footer>
  );
}
