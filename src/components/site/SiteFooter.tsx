"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { UI } from "@/content/i18n";
import { LINKS } from "@/lib/links";
import { useExperience } from "@/store/experience";
import styles from "./SiteFooter.module.css";

/**
 * Footer of the content pages, laid out like the main landing's footer so
 * both sites read as one: the map and its sections, the partner network,
 * and legal. The map home has no footer (it is a full-screen experience).
 */
export function SiteFooter() {
  const lang = useExperience((s) => s.lang);
  const t = UI[lang];
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Logo />
          <p className={styles.responsible}>{t.responsible}</p>
        </div>
        <nav className={styles.col} aria-label={t.footerExplore}>
          <h2>{t.footerExplore}</h2>
          <Link href="/" className="underline-anim">{t.navMap}</Link>
          <Link href="/bodegas" className="underline-anim">{t.navWineries}</Link>
          <Link href="/puntos-de-recojo" className="underline-anim">{t.navPickup}</Link>
          <Link href="/historia" className="underline-anim">{t.navHistory}</Link>
        </nav>
        <nav className={styles.col} aria-label={t.footerNetwork}>
          <h2>{t.footerNetwork}</h2>
          <Link href="/unirse" className="underline-anim">{t.navJoin}</Link>
          <Link href="/acceso" className="underline-anim">{t.navAccess}</Link>
          <Link href="/contacto" className="underline-anim">{t.navContact}</Link>
          <a href={LINKS.landing} className="underline-anim">{t.footerConsumers}</a>
        </nav>
        <nav className={styles.col} aria-label={t.footerLegal}>
          <h2>{t.footerLegal}</h2>
          <Link href="/aviso-legal" className="underline-anim">{t.legalNotice}</Link>
          <a href={LINKS.landingPrivacy} className="underline-anim">{t.privacy}</a>
          <span className={styles.made}>{t.madeBy}</span>
        </nav>
      </div>
    </footer>
  );
}
