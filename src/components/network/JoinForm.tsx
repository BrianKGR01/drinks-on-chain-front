"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent, type InputHTMLAttributes } from "react";
import { VILLAGES } from "@/content/villages";
import { postPublic, TURNSTILE_SITE_KEY } from "@/lib/public-api";
import type { Lang } from "@/lib/scene-contract";
import styles from "./Network.module.css";
import { Turnstile, type TurnstileHandle } from "./Turnstile";

type Kind = "bodega" | "punto";

/** Fields of `POST /v1/public/winery-applications` (contract of Wave 1 §3), in display order. */
const FIELDS = ["legalName", "tradeName", "taxId", "category", "region", "contactName", "contactEmail", "contactPhone", "message", "captchaToken", "consent"] as const;
type Field = (typeof FIELDS)[number];
type Errors = Partial<Record<Field, string>>;

const CATEGORIES = ["WINERY", "DISTILLERY", "BREWERY", "OTHER"] as const;
type Category = (typeof CATEGORIES)[number];

/** Regions: the valleys of the map (src/content) plus the rest of Bolivia. Values stay in Spanish. */
const OTHER_REGION = { es: "Otra región de Bolivia", en: "Elsewhere in Bolivia" };
const REGIONS = [...VILLAGES.map((v) => v.name), OTHER_REGION];

const MAIL: Record<Kind, string> = { bodega: "bodegas@drinksonchain.bo", punto: "puntos@drinksonchain.bo" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const COPY = {
  es: {
    kind: "Soy",
    kinds: { bodega: "Una bodega o destilería", punto: "Un punto de canje" } satisfies Record<Kind, string>,
    pointSoon: "La postulación de puntos de canje por formulario llega pronto. Mientras tanto, escríbenos y cuéntanos sobre tu local:",
    winery: "La bodega",
    contact: "Contacto",
    legalName: "Razón social",
    tradeName: "Nombre comercial",
    taxId: "NIT",
    category: "Categoría",
    categories: { WINERY: "Bodega de vino", DISTILLERY: "Destilería de singani", BREWERY: "Cervecería", OTHER: "Otra" } satisfies Record<Category, string>,
    region: "Región",
    choose: "Elige una opción",
    contactName: "Nombre y apellido",
    contactEmail: "Correo",
    contactPhone: "Teléfono (opcional)",
    message: "Cuéntanos sobre tu bodega (opcional)",
    captcha: "Verificación anti-bots",
    consent: "Acepto que Drinks on Chain use estos datos solo para gestionar esta solicitud.",
    privacy: "Privacidad",
    submit: "Enviar solicitud",
    sending: "Enviando…",
    sendingStatus: "Enviando la solicitud…",
    hint: "Te enviaremos un correo para confirmar tu dirección; la solicitud llega al equipo cuando lo confirmas.",
    notReady: (mail: string) => `El envío de solicitudes todavía no está disponible en este sitio. Mientras tanto, escríbenos a ${mail}.`,
    errors: {
      required: "Este campo es obligatorio.",
      email: "Escribe un correo válido.",
      consent: "Necesitamos tu conformidad para gestionar la solicitud.",
      captchaPending: "Espera a que termine la verificación anti-bots.",
      captchaLoad: "No se pudo cargar la verificación anti-bots. Revisa tu conexión o los bloqueadores de contenido y recarga la página.",
      captchaRejected: "La verificación anti-bots no fue válida. Vuelve a intentarlo.",
      server: "Revisa este dato.",
      summary: "Revisa los campos marcados.",
      rateLimited: (wait: string | null) =>
        `Recibimos demasiadas solicitudes desde tu conexión. Vuelve a intentarlo ${wait ? `en ${wait}` : "más tarde"}.`,
      network: "No pudimos conectar con el servidor. Revisa tu conexión y vuelve a intentarlo; tus datos siguen en el formulario.",
      unavailable: (mail: string) => `El envío de solicitudes no está disponible en este momento. Inténtalo más tarde o escríbenos a ${mail}.`,
      generic: (mail: string) => `No pudimos enviar la solicitud. Vuelve a intentarlo en unos minutos o escríbenos a ${mail}.`,
    },
    seconds: (n: number) => (n === 1 ? "1 segundo" : `${n} segundos`),
    minutes: (n: number) => (n === 1 ? "1 minuto" : `${n} minutos`),
    doneTitle: "Revisa tu correo",
    done: (email: string, name: string) =>
      `Enviamos un enlace de confirmación a ${email}. La solicitud de ${name} llega al equipo de Drinks on Chain cuando confirmas tu correo.`,
    doneStepsLabel: "Qué pasa ahora",
    doneSteps: [
      { h: "Confirma tu correo", p: "Abre el enlace que te enviamos. Si no lo ves en unos minutos, revisa la carpeta de correo no deseado." },
      { h: "Revisión", p: "El equipo de Drinks on Chain revisa la solicitud y te escribe a este correo." },
      { h: "Reunión", p: "Si hace falta, agendamos una llamada, una videollamada o una visita a la bodega." },
      { h: "Invitación", p: "Si se aprueba, el dueño de la bodega recibe una invitación para crear su cuenta en el ERP y sumar a su equipo." },
    ],
    doneMail: "¿Algún problema? Escríbenos a",
    again: "Enviar otra solicitud",
  },
  en: {
    kind: "I am",
    kinds: { bodega: "A winery or distillery", punto: "A redemption point" } satisfies Record<Kind, string>,
    pointSoon: "Applications for redemption points open soon. Meanwhile, write to us and tell us about your venue:",
    winery: "The winery",
    contact: "Contact",
    legalName: "Legal name",
    tradeName: "Trade name",
    taxId: "Tax ID (NIT)",
    category: "Category",
    categories: { WINERY: "Winery", DISTILLERY: "Singani distillery", BREWERY: "Brewery", OTHER: "Other" } satisfies Record<Category, string>,
    region: "Region",
    choose: "Choose an option",
    contactName: "Full name",
    contactEmail: "Email",
    contactPhone: "Phone (optional)",
    message: "Tell us about your winery (optional)",
    captcha: "Anti-bot check",
    consent: "I agree that Drinks on Chain uses this data only to handle this application.",
    privacy: "Privacy",
    submit: "Send application",
    sending: "Sending…",
    sendingStatus: "Sending the application…",
    hint: "We will email you to confirm your address; the application reaches the team once you confirm it.",
    notReady: (mail: string) => `Applications cannot be sent from this site yet. Meanwhile, write to us at ${mail}.`,
    errors: {
      required: "This field is required.",
      email: "Enter a valid email.",
      consent: "We need your consent to handle the application.",
      captchaPending: "Wait for the anti-bot check to finish.",
      captchaLoad: "The anti-bot check could not load. Check your connection or content blockers and reload the page.",
      captchaRejected: "The anti-bot check was not valid. Please try again.",
      server: "Check this field.",
      summary: "Check the highlighted fields.",
      rateLimited: (wait: string | null) => `Too many applications from your connection. Try again ${wait ? `in ${wait}` : "later"}.`,
      network: "We could not reach the server. Check your connection and try again; your data is still in the form.",
      unavailable: (mail: string) => `Applications cannot be sent right now. Try again later or write to us at ${mail}.`,
      generic: (mail: string) => `We could not send the application. Try again in a few minutes or write to us at ${mail}.`,
    },
    seconds: (n: number) => (n === 1 ? "1 second" : `${n} seconds`),
    minutes: (n: number) => (n === 1 ? "1 minute" : `${n} minutes`),
    doneTitle: "Check your email",
    done: (email: string, name: string) =>
      `We sent a confirmation link to ${email}. The application for ${name} reaches the Drinks on Chain team once you confirm your email.`,
    doneStepsLabel: "What happens next",
    doneSteps: [
      { h: "Confirm your email", p: "Open the link we sent you. If it does not arrive within a few minutes, check your spam folder." },
      { h: "Review", p: "The Drinks on Chain team reviews the application and writes to you at this address." },
      { h: "Meeting", p: "If needed, we schedule a call, a video call or a visit to the winery." },
      { h: "Invitation", p: "If approved, the winery's owner receives an invitation to create their ERP account and bring in their team." },
    ],
    doneMail: "Any problem? Write to us at",
    again: "Send another application",
  },
} as const;

type Copy = (typeof COPY)[Lang];

const waitText = (c: Copy, seconds: number | null) =>
  seconds === null ? null : seconds < 60 ? c.seconds(Math.max(1, seconds)) : c.minutes(Math.ceil(seconds / 60));

/** Field of a server detail (`details[].field`), or null when it is not one of the form's. */
const asField = (f: string | null): Field | null => (f && (FIELDS as readonly string[]).includes(f) ? (f as Field) : null);

const without = (errors: Errors, f: Field): Errors => {
  if (!errors[f]) return errors;
  const next = { ...errors };
  delete next[f];
  return next;
};

interface JoinFormProps {
  lang: Lang;
  privacyHref: string;
  /** False when the site has no API behind `/api/v1` (`API_ORIGIN` unset): the form says so instead of failing. */
  apiReady: boolean;
}

/**
 * Winery application form of /unirse (O1-WEB-1). Sends
 * `POST /api/v1/public/winery-applications` (rewritten to the API) with the
 * Turnstile token and the `website` honeypot; the server owns the business
 * rules (NIT, duplicates, limits). The client only checks what a person can
 * fix before sending: required fields and the shape of the email.
 */
export function JoinForm({ lang, privacyHref, apiReady }: JoinFormProps) {
  const c = COPY[lang];
  const params = useSearchParams();
  const [kind, setKind] = useState<Kind>(params.get("tipo") === "punto" ? "punto" : "bodega");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<{ email: string; name: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [captchaBroken, setCaptchaBroken] = useState(false);
  const turnstile = useRef<TurnstileHandle>(null);
  const doneHeading = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const id = useId();

  useEffect(() => {
    if (sent) doneHeading.current?.focus();
  }, [sent]);

  const focusField = (f: Field) => {
    const el = f === "captchaToken" ? document.getElementById(`${id}-captchaToken`) : formRef.current?.querySelector<HTMLElement>(`[name="${f}"]`);
    el?.focus();
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending || !apiReady) return;
    const data = new FormData(e.currentTarget);
    const get = (k: string) => String(data.get(k) ?? "").trim();

    const next: Errors = {};
    for (const f of ["legalName", "tradeName", "taxId", "category", "region", "contactName", "contactEmail"] as const) {
      if (!get(f)) next[f] = c.errors.required;
    }
    if (get("contactEmail") && !EMAIL_RE.test(get("contactEmail"))) next.contactEmail = c.errors.email;
    if (!token) next.captchaToken = captchaBroken ? c.errors.captchaLoad : c.errors.captchaPending;
    if (!data.get("consent")) next.consent = c.errors.consent;
    setErrors(next);
    const first = FIELDS.find((f) => next[f]);
    if (first) {
      setStatus(c.errors.summary);
      focusField(first);
      return;
    }

    setSending(true);
    setStatus(c.sendingStatus);
    const res = await postPublic<{ id: string; status: string }>("public/winery-applications", {
      legalName: get("legalName"),
      tradeName: get("tradeName"),
      taxId: get("taxId"),
      category: get("category"),
      region: get("region"),
      contactName: get("contactName"),
      contactEmail: get("contactEmail"),
      contactPhone: get("contactPhone") || null,
      message: get("message") || null,
      captchaToken: token,
      website: String(data.get("website") ?? ""),
    });
    setSending(false);
    // A Turnstile token is single use: whatever happened, ask for a new one.
    turnstile.current?.reset();

    if (res.ok) {
      setStatus("");
      setSent({ email: get("contactEmail"), name: get("tradeName") });
      return;
    }
    switch (res.kind) {
      case "validation": {
        const fromServer: Errors = {};
        const loose: string[] = [];
        for (const d of res.details) {
          const f = asField(d.field);
          if (!f) {
            if (d.message) loose.push(d.message);
            continue;
          }
          if (fromServer[f]) continue;
          fromServer[f] = f === "captchaToken" ? c.errors.captchaRejected : lang === "es" && d.message ? d.message : c.errors.server;
        }
        setErrors(fromServer);
        const firstServer = FIELDS.find((f) => fromServer[f]);
        setStatus([c.errors.summary, ...(lang === "es" ? loose : [])].join(" "));
        if (firstServer) focusField(firstServer);
        return;
      }
      case "rate-limited":
        setStatus(c.errors.rateLimited(waitText(c, res.retryAfter)));
        return;
      case "network":
        setStatus(c.errors.network);
        return;
      case "unavailable":
        setStatus(c.errors.unavailable(MAIL.bodega));
        return;
      default:
        setStatus(c.errors.generic(MAIL.bodega));
    }
  };

  const clearError = (target: EventTarget) => {
    const name = (target as HTMLInputElement).name as Field;
    if (name && errors[name]) setErrors((prev) => without(prev, name));
  };

  const kindChoice = (
    <fieldset className={`${styles.choice} ${styles.kindChoice}`}>
      <legend className={styles.label}>{c.kind}</legend>
      {(Object.keys(c.kinds) as Kind[]).map((k) => (
        <label key={k}>
          <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} />
          {c.kinds[k]}
        </label>
      ))}
    </fieldset>
  );

  if (sent) {
    return (
      <div id="formulario" className={styles.success} role="status">
        <h3 ref={doneHeading} tabIndex={-1}>
          {c.doneTitle}
        </h3>
        <p>{c.done(sent.email, sent.name)}</p>
        <p className={styles.doneLabel}>{c.doneStepsLabel}</p>
        <ol className={styles.doneSteps}>
          {c.doneSteps.map((s) => (
            <li key={s.h}>
              <strong>{s.h}</strong> {s.p}
            </li>
          ))}
        </ol>
        <p>
          {c.doneMail}{" "}
          <a href={`mailto:${MAIL.bodega}`} className={`${styles.textLink} ${styles.mail}`}>
            {MAIL.bodega}
          </a>
        </p>
        <p style={{ marginTop: "2rem" }}>
          <button
            type="button"
            className={styles.buttonGhost}
            onClick={() => {
              setSent(null);
              setErrors({});
            }}
          >
            {c.again}
          </button>
        </p>
      </div>
    );
  }

  if (kind === "punto") {
    return (
      <div id="formulario" className={styles.formWrap}>
        {kindChoice}
        <p className={styles.notice} role="status">
          {c.pointSoon}{" "}
          <a href={`mailto:${MAIL.punto}`} className={`${styles.textLink} ${styles.mail}`}>
            {MAIL.punto}
          </a>
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
  const aria = (f: Field) => ({
    "aria-invalid": errors[f] ? true : undefined,
    "aria-describedby": errors[f] ? `${id}-${f}-err` : undefined,
  });
  const input = (f: Field, props: InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={`${id}-${f}`}>
        {c[f as keyof Copy] as string}
      </label>
      <input id={`${id}-${f}`} name={f} className={styles.input} {...props} {...aria(f)} />
      {err(f)}
    </div>
  );

  return (
    <div id="formulario" className={styles.formWrap}>
      {kindChoice}
      {!apiReady ? (
        <p className={styles.notice} id={`${id}-not-ready`}>
          {c.notReady(MAIL.bodega)}
        </p>
      ) : null}
      <form
        ref={formRef}
        className={styles.form}
        onSubmit={onSubmit}
        onInput={(e) => clearError(e.target)}
        onChange={(e) => clearError(e.target)}
        noValidate
        aria-describedby={!apiReady ? `${id}-not-ready` : undefined}
      >
        <fieldset className={styles.group}>
          <legend className={styles.groupLegend}>{c.winery}</legend>
          {input("legalName", { autoComplete: "organization", required: true, maxLength: 200 })}
          {input("tradeName", { required: true, maxLength: 120 })}
          {input("taxId", { inputMode: "numeric", autoComplete: "off", required: true, maxLength: 20 })}
          <div className={styles.field}>
            <label className={styles.label} htmlFor={`${id}-category`}>
              {c.category}
            </label>
            <select id={`${id}-category`} name="category" className={styles.select} defaultValue="" required {...aria("category")}>
              <option value="" disabled>
                {c.choose}
              </option>
              {CATEGORIES.map((k) => (
                <option key={k} value={k}>
                  {c.categories[k]}
                </option>
              ))}
            </select>
            {err("category")}
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={`${id}-region`}>
              {c.region}
            </label>
            <select id={`${id}-region`} name="region" className={styles.select} defaultValue="" required {...aria("region")}>
              <option value="" disabled>
                {c.choose}
              </option>
              {REGIONS.map((r) => (
                <option key={r.es} value={r.es}>
                  {r[lang]}
                </option>
              ))}
            </select>
            {err("region")}
          </div>
        </fieldset>

        <fieldset className={styles.group}>
          <legend className={styles.groupLegend}>{c.contact}</legend>
          {input("contactName", { autoComplete: "name", required: true, maxLength: 120 })}
          {input("contactEmail", { type: "email", autoComplete: "email", inputMode: "email", required: true, maxLength: 254 })}
          {input("contactPhone", { type: "tel", autoComplete: "tel", inputMode: "tel", maxLength: 30 })}
          <div className={`${styles.field} ${styles.fieldWide}`}>
            <label className={styles.label} htmlFor={`${id}-message`}>
              {c.message}
            </label>
            <textarea id={`${id}-message`} name="message" className={styles.textarea} maxLength={2000} {...aria("message")} />
            {err("message")}
          </div>
        </fieldset>

        {/* Honeypot (contract of Wave 1 §0): out of sight, out of the tab order and hidden from assistive tech. */}
        <div className={styles.trap} aria-hidden="true">
          <label>
            Website
            <input name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
          </label>
        </div>

        {apiReady ? (
          <div className={`${styles.field} ${styles.fieldWide}`}>
            <span className={styles.label} id={`${id}-captcha-label`}>
              {c.captcha}
            </span>
            <div
              id={`${id}-captchaToken`}
              tabIndex={-1}
              role="group"
              aria-labelledby={`${id}-captcha-label`}
              aria-describedby={errors.captchaToken ? `${id}-captchaToken-err` : undefined}
              className={styles.captcha}
              data-captcha={token ? "ready" : "pending"}
            >
              <Turnstile
                ref={turnstile}
                siteKey={TURNSTILE_SITE_KEY}
                lang={lang}
                onToken={(t) => {
                  setToken(t);
                  if (t) {
                    setCaptchaBroken(false);
                    setErrors((prev) => without(prev, "captchaToken"));
                  }
                }}
                onError={() => setCaptchaBroken(true)}
              />
            </div>
            {err("captchaToken")}
          </div>
        ) : null}

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
          <button type="submit" className={styles.button} disabled={!apiReady} aria-disabled={sending || undefined}>
            {sending ? c.sending : c.submit}
          </button>
          <p className={styles.formHint}>{c.hint}</p>
        </div>
        <p className={styles.formStatus} role="status" aria-live="polite" aria-atomic="true">
          {status}
        </p>
      </form>
    </div>
  );
}
