"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { LANGS, UI } from "@/content/i18n";
import { useExperience } from "@/store/experience";
import styles from "./MainMenu.module.css";

/**
 * Full-screen menu: rotated "Cerrar", wordmark, four oversized links with a
 * sliding red indicator on the left, and a footer with languages, legal,
 * social and credit. Escape closes; the route change closes it too.
 */
export function MainMenu() {
  const lang = useExperience((s) => s.lang);
  const setLang = useExperience((s) => s.setLang);
  const open = useExperience((s) => s.menuOpen);
  const toggleMenu = useExperience((s) => s.toggleMenu);
  const selectParcel = useExperience((s) => s.selectParcel);
  const pathname = usePathname();
  const t = UI[lang];
  const [hover, setHover] = useState<number | null>(null);

  const items = [
    { href: "/historia", label: t.navHistory },
    { href: "/vinos", label: t.navWines },
    { href: "/", label: t.navParcels },
    { href: "/contacto", label: t.navContact },
  ];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && toggleMenu(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, toggleMenu]);

  // Close when the route changes.
  useEffect(() => {
    toggleMenu(false);
  }, [pathname, toggleMenu]);

  const currentIndex = items.findIndex((it) => it.href === pathname);
  const indicatorIndex = hover ?? (currentIndex >= 0 ? currentIndex : 2);

  return (
    <div
      className={`${styles.menu} ${open ? styles.shown : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={t.menu}
      aria-hidden={!open}
      inert={!open}
    >
      <div className={styles.background} aria-hidden="true" />

      <button type="button" className={styles.close} onClick={() => toggleMenu(false)}>
        {t.close}
      </button>

      <div className={styles.logo}>
        <Logo />
      </div>

      <nav className={styles.section} aria-label={t.menu}>
        <span className={styles.indicator} aria-hidden="true">
          <span className={styles.thumb} style={{ transform: `translateY(${indicatorIndex * 100}%)` }} />
        </span>
        {items.map((it, i) => (
          <Link
            key={it.href}
            href={it.href}
            className={styles.link}
            style={{ transitionDelay: `${0.15 + i * 0.08}s` }}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            onClick={() => {
              if (it.href === "/") selectParcel(null);
              toggleMenu(false);
            }}
            aria-current={pathname === it.href ? "page" : undefined}
          >
            {it.label}
          </Link>
        ))}
      </nav>

      <footer className={styles.footer}>
        <div className={styles.langs}>
          {LANGS.map((code) => (
            <button
              key={code}
              type="button"
              className="underline-anim"
              aria-current={lang === code ? "true" : undefined}
              onClick={() => setLang(code)}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
        <div className={styles.sect}>
          <Link href="/aviso-legal" className="underline-anim">
            {t.legalNotice}
          </Link>
        </div>
        <div className={styles.sharing}>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="underline-anim">
            Instagram
          </a>
          <a href="https://facebook.com" target="_blank" rel="noreferrer" className="underline-anim">
            Facebook
          </a>
        </div>
        <p className={styles.made}>{t.madeBy}</p>
      </footer>
    </div>
  );
}
