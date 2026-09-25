"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { DiscoverFooter } from "@/components/pages/DiscoverFooter";
import { PageShell } from "@/components/pages/PageShell";
import { UI } from "@/content/i18n";
import { LINKS } from "@/lib/links";
import { useExperience } from "@/store/experience";
import styles from "./Network.module.css";

const COPY = {
  es: {
    title: "Acceso",
    lead: "Esta página no es un inicio de sesión. Cada sistema de la red tiene su propia puerta y su propia cuenta; elige la tuya.",
    erp: {
      eyebrow: "Soy bodega",
      title: "ERP de trazabilidad",
      text: "El cuaderno digital de la bodega: terroirs, vendimia, laboratorio, tanques, crianza o destilación, embotellado y exportación de los códigos QR.",
      list: ["Correo y contraseña de tu equipo", "Las cuentas las crea Drinks on Chain al dar de alta la bodega", "Escritorio y tablet de planta"],
      cta: "Entrar al ERP",
      alt: "¿Aún no eres parte de la red?",
      altCta: "Unirse",
    },
    pos: {
      eyebrow: "Soy punto de recojo",
      title: "Aplicación de entregas",
      text: "La pantalla del mostrador: escanea el pase de retiro del cliente, confirma la entrega con un gesto y cierra el turno.",
      list: ["Se abre en la tablet vinculada de tu sucursal", "PIN de sucursal, sin cuentas personales", "iPad o tablet Android"],
      cta: "Abrir la aplicación",
      alt: "¿Quieres ser punto autorizado?",
      altCta: "Puntos de recojo",
    },
    soon: "Disponible pronto",
    consumer: "¿Buscas tus botellas o tu cava? La cuenta de los consumidores está en el sitio principal.",
    consumerCta: "Ir a Drinks on Chain",
    next: "Unirse a la red",
  },
  en: {
    title: "Access",
    lead: "This page is not a sign-in. Each system of the network has its own door and its own account; choose yours.",
    erp: {
      eyebrow: "I am a winery",
      title: "Traceability ERP",
      text: "The winery's digital logbook: terroirs, harvest, lab, tanks, ageing or distillation, bottling and export of the QR codes.",
      list: ["Your team's email and password", "Accounts are created by Drinks on Chain when the winery joins", "Desktop and cellar tablet"],
      cta: "Sign in to the ERP",
      alt: "Not in the network yet?",
      altCta: "Join",
    },
    pos: {
      eyebrow: "I am a pick-up point",
      title: "Delivery app",
      text: "The counter screen: scan the customer's pick-up pass, confirm the handover with a swipe and close the shift.",
      list: ["Opens on your branch's linked tablet", "Branch PIN, no personal accounts", "iPad or Android tablet"],
      cta: "Open the app",
      alt: "Want to become an authorised point?",
      altCta: "Pick-up points",
    },
    soon: "Coming soon",
    consumer: "Looking for your bottles or your cellar? Consumer accounts live on the main site.",
    consumerCta: "Go to Drinks on Chain",
    next: "Join the network",
  },
} as const;

interface DoorCopy {
  eyebrow: string;
  title: string;
  text: string;
  list: readonly string[];
  cta: string;
  alt: string;
  altCta: string;
}

const ICON_WINERY = (
  <svg viewBox="0 0 48 48" aria-hidden="true">
    <path d="M6 42h36M9 42V22l15-10 15 10v20" />
    <path d="M19 42V31h10v11" />
    <circle cx="16" cy="25" r="1.6" /><circle cx="32" cy="25" r="1.6" />
    <path d="M24 12V6M21 8h6" />
  </svg>
);
const ICON_COUNTER = (
  <svg viewBox="0 0 48 48" aria-hidden="true">
    <rect x="9" y="7" width="30" height="22" rx="2" />
    <path d="M15 13h6v6h-6zM27 13h6M27 17h6M15 23h18" />
    <path d="M4 35h40v6H4zM18 29v6M30 29v6" />
  </svg>
);

/** /acceso — two doors, one per system; no form, no session (02 §1, principle 3). */
export function AccessPage() {
  const lang = useExperience((s) => s.lang);
  const c = COPY[lang];
  const t = UI[lang];

  const door = (id: "erp" | "pos", d: DoorCopy, icon: ReactNode, href: string | null, altHref: string) => (
    <section id={id} className={styles.door} aria-labelledby={`${id}-title`}>
      <span className={styles.doorIcon}>{icon}</span>
      <p className={styles.eyebrow}>{d.eyebrow}</p>
      <h2 id={`${id}-title`} className={styles.doorTitle}>
        {d.title}
      </h2>
      <p className={styles.doorText}>{d.text}</p>
      <ul className={styles.doorList}>
        {d.list.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
      <div className={styles.doorActions}>
        {href ? (
          <a href={href} className={styles.button}>
            {d.cta} →
          </a>
        ) : (
          <span className={styles.soon} aria-disabled="true">
            {d.cta} · {c.soon}
          </span>
        )}
        <span>
          <span className={styles.doorAlt}>{d.alt} </span>
          <Link href={altHref} className={styles.textLink}>
            {d.altCta}
          </Link>
        </span>
      </div>
    </section>
  );

  return (
    <PageShell eyebrow={c.title}>
      <header className={styles.header}>
        <span className="small-heading">{t.brand}</span>
        <span className="heading-separator" aria-hidden="true" />
        <h2 className={styles.title}>{c.title}</h2>
        <p className={styles.lead}>{c.lead}</p>
      </header>

      <div className={styles.doors}>
        {door("erp", c.erp, ICON_WINERY, LINKS.erp, "/unirse")}
        {door("pos", c.pos, ICON_COUNTER, LINKS.pos, "/puntos-de-recojo")}
      </div>

      <p className={styles.aside}>
        {c.consumer}{" "}
        <a href={LINKS.landing} className={styles.textLink}>
          {c.consumerCta}
        </a>
      </p>

      <DiscoverFooter href="/unirse" caption={c.next} prepend={t.discover} />
    </PageShell>
  );
}
