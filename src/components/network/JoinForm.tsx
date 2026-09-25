"use client";

import { useSearchParams } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import type { Lang } from "@/lib/scene-contract";
import styles from "./Network.module.css";

type Kind = "bodega" | "punto";
type Field = "name" | "company" | "region" | "email" | "phone" | "message" | "consent";
type Errors = Partial<Record<Field, string>>;

const COPY = {
  es: {
    kind: "Soy",
    kinds: { bodega: "Una bodega o viñedo", punto: "Un punto de venta" } satisfies Record<Kind, string>,
    name: "Nombre y apellido",
    company: { bodega: "Bodega", punto: "Tienda o local" } satisfies Record<Kind, string>,
    region: "Región",
    regions: ["Valle Central de Tarija", "Valle de Cinti", "Otra región de Bolivia", "Fuera de Bolivia"],
    choose: "Elige una opción",
    email: "Correo",
    phone: "Teléfono (opcional)",
    message: "Cuéntanos sobre tu bodega o tu local",
    consent: "Acepto que Drinks on Chain use estos datos solo para responder a esta solicitud.",
    privacy: "Privacidad",
    submit: "Enviar solicitud",
    hint: "Formulario de demostración: todavía no envía datos a ningún servidor.",
    errors: {
      required: "Este campo es obligatorio.",
      email: "Escribe un correo válido.",
      phone: "Escribe solo números, espacios y el prefijo +.",
      consent: "Necesitamos tu conformidad para responder.",
    },
    doneTitle: "Solicitud registrada",
    done: (name: string) => `Gracias, ${name}. Esta es una versión de demostración del sitio: la solicitud no se envió a ningún servidor.`,
    doneMail: "Mientras tanto, escríbenos a",
    again: "Enviar otra",
  },
  en: {
    kind: "I am",
    kinds: { bodega: "A winery or vineyard", punto: "A point of sale" } satisfies Record<Kind, string>,
    name: "Full name",
    company: { bodega: "Winery", punto: "Shop or venue" } satisfies Record<Kind, string>,
    region: "Region",
    regions: ["Tarija Central Valley", "Cinti Valley", "Elsewhere in Bolivia", "Outside Bolivia"],
    choose: "Choose an option",
    email: "Email",
    phone: "Phone (optional)",
    message: "Tell us about your winery or venue",
    consent: "I agree that Drinks on Chain uses this data only to answer this request.",
    privacy: "Privacy",
    submit: "Send request",
    hint: "Demo form: it does not send data to any server yet.",
    errors: {
      required: "This field is required.",
      email: "Enter a valid email.",
      phone: "Use digits, spaces and a leading + only.",
      consent: "We need your consent to reply.",
    },
    doneTitle: "Request recorded",
    done: (name: string) => `Thank you, ${name}. This is a demo version of the site: the request was not sent to any server.`,
    doneMail: "Meanwhile, write to us at",
    again: "Send another",
  },
} as const;

const MAIL: Record<Kind, string> = { bodega: "bodegas@drinksonchain.bo", punto: "puntos@drinksonchain.bo" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s]{6,20}$/;

interface JoinFormProps {
  lang: Lang;
  privacyHref: string;
}

/**
 * Contact form for wineries and pick-up points. It validates on the client
 * and never sends anything: the sites have no backend and create no
 * accounts (02 §5). When the backend exposes an endpoint with anti-bot
 * protection, `submit` posts there; the honeypot field is already in place.
 */
export function JoinForm({ lang, privacyHref }: JoinFormProps) {
  const c = COPY[lang];
  const params = useSearchParams();
  const [kind, setKind] = useState<Kind>(params.get("tipo") === "punto" ? "punto" : "bodega");
  const [errors, setErrors] = useState<Errors>({});
  const [sentBy, setSentBy] = useState<string | null>(null);
  const id = useId();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const get = (k: string) => String(data.get(k) ?? "").trim();
    if (get("website")) return; // honeypot filled: silently drop

    const next: Errors = {};
    if (!get("name")) next.name = c.errors.required;
    if (!get("company")) next.company = c.errors.required;
    if (!get("region")) next.region = c.errors.required;
    if (!get("email")) next.email = c.errors.required;
    else if (!EMAIL_RE.test(get("email"))) next.email = c.errors.email;
    if (get("phone") && !PHONE_RE.test(get("phone"))) next.phone = c.errors.phone;
    if (!get("message")) next.message = c.errors.required;
    if (!data.get("consent")) next.consent = c.errors.consent;
    setErrors(next);

    const first = Object.keys(next)[0];
    if (first) {
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setSentBy(get("name").split(/\s+/)[0]);
  };

  if (sentBy) {
    return (
      <div className={styles.success} role="status" id="formulario">
        <h3>{c.doneTitle}</h3>
        <p>{c.done(sentBy)}</p>
        <p>
          {c.doneMail} <a href={`mailto:${MAIL[kind]}`} className={styles.textLink}>{MAIL[kind]}</a>
        </p>
        <p style={{ marginTop: "2rem" }}>
          <button type="button" className={styles.buttonGhost} onClick={() => setSentBy(null)}>
            {c.again}
          </button>
        </p>
      </div>
    );
  }

  const err = (f: Field) =>
    errors[f] ? (
      <p id={`${id}-${f}-err`} className={styles.error}>
        {errors[f]}
      </p>
    ) : null;
  const aria = (f: Field) => ({ "aria-invalid": errors[f] ? true : undefined, "aria-describedby": errors[f] ? `${id}-${f}-err` : undefined });

  return (
    <form id="formulario" className={styles.form} onSubmit={onSubmit} noValidate>
      <fieldset className={`${styles.choice} ${styles.fieldWide}`}>
        <legend className={styles.label}>{c.kind}</legend>
        {(Object.keys(c.kinds) as Kind[]).map((k) => (
          <label key={k}>
            <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} />
            {c.kinds[k]}
          </label>
        ))}
      </fieldset>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${id}-name`}>{c.name}</label>
        <input id={`${id}-name`} name="name" className={styles.input} autoComplete="name" required {...aria("name")} />
        {err("name")}
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${id}-company`}>{c.company[kind]}</label>
        <input id={`${id}-company`} name="company" className={styles.input} autoComplete="organization" required {...aria("company")} />
        {err("company")}
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${id}-region`}>{c.region}</label>
        <select id={`${id}-region`} name="region" className={styles.select} defaultValue="" required {...aria("region")}>
          <option value="" disabled>{c.choose}</option>
          {c.regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        {err("region")}
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${id}-email`}>{c.email}</label>
        <input id={`${id}-email`} name="email" type="email" className={styles.input} autoComplete="email" inputMode="email" required {...aria("email")} />
        {err("email")}
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${id}-phone`}>{c.phone}</label>
        <input id={`${id}-phone`} name="phone" type="tel" className={styles.input} autoComplete="tel" inputMode="tel" {...aria("phone")} />
        {err("phone")}
      </div>
      <div className={`${styles.field} ${styles.fieldWide}`}>
        <label className={styles.label} htmlFor={`${id}-message`}>{c.message}</label>
        <textarea id={`${id}-message`} name="message" className={styles.textarea} required {...aria("message")} />
        {err("message")}
      </div>

      <div className={styles.trap} aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className={`${styles.field} ${styles.fieldWide}`}>
        <label className={styles.consent}>
          <input type="checkbox" name="consent" {...aria("consent")} />
          <span>
            {c.consent} <a href={privacyHref}>{c.privacy}</a>
          </span>
        </label>
        {err("consent")}
      </div>

      <div className={styles.formFoot}>
        <button type="submit" className={styles.button}>
          {c.submit}
        </button>
        <p className={styles.formHint}>{c.hint}</p>
      </div>
    </form>
  );
}
