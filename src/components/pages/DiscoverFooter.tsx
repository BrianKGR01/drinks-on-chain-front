"use client";

import Link from "next/link";
import styles from "./DiscoverFooter.module.css";

interface DiscoverFooterProps {
  href: string;
  caption: string;
  prepend?: string;
}

/** Large closing call-to-action at the bottom of every content page (the site footer follows it). */
export function DiscoverFooter({ href, caption, prepend }: DiscoverFooterProps) {
  return (
    <footer className={styles.footer}>
      {prepend ? <span className={styles.prepend}>{prepend}</span> : null}
      <Link href={href} className={styles.caption}>
        {caption}
      </Link>
      <span className={styles.decoration} aria-hidden="true" />
    </footer>
  );
}
