"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type FormEvent, type InputHTMLAttributes } from "react";
import { VILLAGES } from "@/content/villages";
import { whatsappShare } from "@/lib/links";
import type { Lang } from "@/lib/scene-contract";
import { siteUrl } from "@/lib/site";
import {
  EMAIL_RE,
  PHONE_RE,
  PRODUCES,
  SHARE_SOURCE,
  WAITLIST_PATH,
  joinWaitlist,
  positionOf,
  rememberSource,
  type Produces,
  type WineryWaitlistRequest,
} from "@/lib/waitlist";
import styles from "./Network.module.css";
import w from "./Waitlist.module.css";

/** Fields of the form, in display order (names of `POST /v1/public/waitlist`). */
const FIELDS = ["wineryName", "region", "produces", "fullName", "email", "phone", "message", "consent"] as const;
type Field = (typeof FIELDS)[number];
type Errors = Partial<Record<Field, string>>;

/** What the form asks for before sending; the server only requires the name, the contact and the consent. */
const REQUIRED = ["wineryName", "region", "produces", "fullName", "email", "phone"] as const satisfies readonly Field[];

/** Regions: the valleys of the map (src/content) plus the rest of Bolivia. Values stay in Spanish. */
const OTHER_REGION = { es: "Otra región de Bolivia", en: "Elsewhere in Bolivia" };
const REGIONS = [...VILLAGES.map((v) => v.name), OTHER_REGION];

const MAIL = "bodegas@drinksonchain.bo";

const COPY = {
  es: {
    winery: "La bodega",
    contact: "Contacto",
    wineryName: "Nombre de la bodega",
    region: "Región",
    choose: "Elige una opción",
    produces: "Qué produce",
    producesOptions: { WINE: "Vino", SINGANI: "Singani", BOTH: "Ambos", OTHER: "Otra bebida" } satisfies Record<Produces, string>,
    fullName: "Persona de contacto",
    email: "Correo",
    phone: "WhatsApp",
    phoneHint: "Con el código del país si no es de Bolivia.",
    message: "Cuéntanos algo de tu bodega (opcional)",
    consent: "Acepto que Drinks on Chain me contacte sobre la incorporación de mi bodega a la red.",
    privacy: "Privacidad",
    privacyNote: "Usamos estos datos solo para contactarte por la lista de espera. No los compartimos con nadie y puedes pedir que los borremos cuando quieras.",
    submit: "Anotar mi bodega",
    sending: "Enviando…",
    sendingStatus: "Anotando tu bodega…",
    notReady: (mail: string) => `La lista de espera todavía no recibe inscripciones desde este sitio. Estamos en ello: mientras tanto, escríbenos a ${mail}.`,
    errors: {
      required: "Este campo es obligatorio.",
      choose: "Elige una opción.",
      short: "Escribe al menos 2 caracteres.",
      email: "Escribe un correo válido.",
      phone: "Escribe un número de 7 a 20 caracteres: dígitos, espacios y + - ( ).",
      consent: "Necesitamos tu conformidad para poder contactarte.",
      server: "Revisa este dato.",
      summary: "Revisa los campos marcados.",
      rateLimited: (wait: string | null) =>
        `Recibimos demasiadas inscripciones desde tu conexión. Vuelve a intentarlo ${wait ? `en ${wait}` : "más tarde"}; tus datos siguen en el formulario.`,
      network: "No pudimos conectar con el servidor. Revisa tu conexión y vuelve a intentarlo; tus datos siguen en el formulario.",
      unavailable: (mail: string) => `La lista de espera no está disponible en este momento. Vuelve a intentarlo en un rato o escríbenos a ${mail}; tus datos siguen en el formulario.`,
      generic: (mail: string) => `No pudimos anotar tu bodega. Vuelve a intentarlo en unos minutos o escríbenos a ${mail}.`,
    },
    seconds: (n: number) => (n === 1 ? "1 segundo" : `${n} segundos`),
    minutes: (n: number) => (n === 1 ? "1 minuto" : `${n} minutos`),
    doneTitle: "Tu bodega está en la lista",
    positionLabel: "Número de orden",
    position: (n: string) => `N.º ${n}`,
    done: (name: string) => `Anotamos a ${name}. Guarda tu número de orden: por ahora no enviamos un correo de confirmación.`,
    nextLabel: "Qué pasa ahora",
    next: [
      { h: "Te escribimos", p: "El equipo de Drinks on Chain se pondrá en contacto contigo por WhatsApp o por correo para conocer la bodega." },
      { h: "Damos de alta tu cuenta", p: "Cuando la bodega entra a la red, su dueño recibe la invitación para crear su cuenta y sumar a su equipo." },
    ],
    shareLabel: "¿Conoces otra bodega?",
    share: "Compartir con otra bodega",
    shareWhatsapp: "Compartir por WhatsApp",
    copy: "Copiar el enlace",
    copied: "Enlace copiado.",
    copyManually: (url: string) => `Copia este enlace: ${url}`,
    shareTitle: "Drinks on Chain · Lista de espera para bodegas",
    shareText: "Anoté mi bodega en la lista de espera de Drinks on Chain: trazabilidad de la parcela a la botella y preventa de botellas. Anota la tuya:",
    again: "Anotar otra bodega",
  },
  en: {
    winery: "The winery",
    contact: "Contact",
    wineryName: "Winery name",
    region: "Region",
    choose: "Choose an option",
    produces: "What it makes",
    producesOptions: { WINE: "Wine", SINGANI: "Singani", BOTH: "Both", OTHER: "Another drink" } satisfies Record<Produces, string>,
    fullName: "Contact person",
    email: "Email",
    phone: "WhatsApp",
    phoneHint: "With the country code if it is not a Bolivian number.",
    message: "Tell us something about your winery (optional)",
    consent: "I agree that Drinks on Chain contacts me about bringing my winery into the network.",
    privacy: "Privacy",
    privacyNote: "We use this data only to contact you about the waitlist. We do not share it with anyone and you can ask us to delete it at any time.",
    submit: "Add my winery",
    sending: "Sending…",
    sendingStatus: "Adding your winery…",
    notReady: (mail: string) => `The waitlist cannot take sign-ups from this site yet. We are working on it: meanwhile, write to us at ${mail}.`,
    errors: {
      required: "This field is required.",
      choose: "Choose an option.",
      short: "Enter at least 2 characters.",
      email: "Enter a valid email.",
      phone: "Enter a number of 7 to 20 characters: digits, spaces and + - ( ).",
      consent: "We need your consent to be able to contact you.",
      server: "Check this field.",
      summary: "Check the highlighted fields.",
      rateLimited: (wait: string | null) => `Too many sign-ups from your connection. Try again ${wait ? `in ${wait}` : "later"}; your data is still in the form.`,
      network: "We could not reach the server. Check your connection and try again; your data is still in the form.",
      unavailable: (mail: string) => `The waitlist is not available right now. Try again in a while or write to us at ${mail}; your data is still in the form.`,
      generic: (mail: string) => `We could not add your winery. Try again in a few minutes or write to us at ${mail}.`,
    },
    seconds: (n: number) => (n === 1 ? "1 second" : `${n} seconds`),
    minutes: (n: number) => (n === 1 ? "1 minute" : `${n} minutes`),
    doneTitle: "Your winery is on the list",
    positionLabel: "Your place in line",
    position: (n: string) => `No. ${n}`,
    done: (name: string) => `We added ${name}. Keep your number: for now we do not send a confirmation email.`,
    nextLabel: "What happens next",
    next: [
      { h: "We write to you", p: "The Drinks on Chain team will get in touch by WhatsApp or email to get to know the winery." },
      { h: "We set up your account", p: "When the winery joins the network, its owner receives the invitation to create their account and bring in their team." },
    ],
    shareLabel: "Know another winery?",
    share: "Share with another winery",
    shareWhatsapp: "Share on WhatsApp",
    copy: "Copy the link",
    copied: "Link copied.",
    copyManually: (url: string) => `Copy this link: ${url}`,
    shareTitle: "Drinks on Chain · Waitlist for wineries",
    shareText: "I added my winery to the Drinks on Chain waitlist: traceability from parcel to bottle and bottle pre-sales. Add yours:",
    again: "Add another winery",
  },
} as const;

type Copy = (typeof COPY)[Lang];

const waitText = (c: Copy, seconds: number | null) =>
  seconds === null ? null : seconds < 60 ? c.seconds(Math.max(1, seconds)) : c.minutes(Math.ceil(seconds / 60));

/** Field of a server detail (`details[].field`), or null when it is not one of the form's. */
const asField = (f: string | null): Field | null => (f && (FIELDS as readonly string[]).includes(f) ? (f as Field) : null);
const asProduces = (v: string): Produces | undefined => ((PRODUCES as readonly string[]).includes(v) ? (v as Produces) : undefined);

const without = (errors: Errors, f: Field): Errors => {
  if (!errors[f]) return errors;
  const next = { ...errors };
  delete next[f];
  return next;
};

const noSubscription = () => () => {};
/** Web Share (phones and some desktops); false on the server and until hydration. */
const useCanShare = () =>
  useSyncExternalStore(
    noSubscription,
    () => typeof navigator.share === "function",
    () => false,
  );

/** "Share with another winery": Web Share where it exists, otherwise WhatsApp; the link can always be copied. */
function ShareInvite({ lang }: { lang: Lang }) {
  const c = COPY[lang];
  const canShare = useCanShare();
  const [note, setNote] = useState("");
  // The canonical site, not the current host: a shared link must outlive previews.
  const url = siteUrl(`${WAITLIST_PATH}?src=${SHARE_SOURCE}`);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setNote(c.copied);
    } catch {
      setNote(c.copyManually(url));
    }
  };
  const share = async () => {
    try {
      await navigator.share({ title: c.shareTitle, text: c.shareText, url });
    } catch (e) {
      // Closing the share sheet is not an error; anything else falls back to the link.
      if (!(e instanceof DOMException && e.name === "AbortError")) setNote(c.copyManually(url));
    }
  };

  return (
    <div className={w.share}>
      <p className={styles.doneLabel}>{c.shareLabel}</p>
      <div className={w.shareActions}>
        {canShare ? (
          <button type="button" className={styles.button} onClick={share}>
            {c.share}
          </button>
        ) : (
          <a className={styles.button} href={whatsappShare(`${c.shareText} ${url}`)} target="_blank" rel="noopener noreferrer">
            {c.shareWhatsapp}
          </a>
        )}
        <button type="button" className={styles.textLink} onClick={copy}>
          {c.copy}
        </button>
      </div>
      <p className={w.shareNote} role="status" aria-live="polite">
        {note}
      </p>
    </div>
  );
}

interface WaitlistFormProps {
  lang: Lang;
  privacyHref: string;
  /** False when the site has no API behind `/api/v1` (`API_ORIGIN` unset): the form says so instead of failing. */
  apiReady: boolean;
  /** Anchor of the form (`#formulario`); omit it when a parent already carries it. */
  id?: string;
}

/**
 * Waitlist of wineries (contract `o1b-lista-de-espera`). Sends
 * `POST /api/v1/public/waitlist` with `type: "WINERY"`, the language, the
 * origin of the visit (`?src=`) and the `website` honeypot; on success it
 * shows the place in line. The server owns the rules (duplicates, limits);
 * the client only checks what a person can fix before sending.
 */
export function WaitlistForm({ lang, privacyHref, apiReady, id: anchor }: WaitlistFormProps) {
  const c = COPY[lang];
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<{ name: string; position: number | null } | null>(null);
  const doneHeading = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const id = useId();

  // Keep `?src=` from the first page of the visit, before the visitor moves around the site.
  useEffect(() => {
    rememberSource();
  }, []);

  useEffect(() => {
    if (done) doneHeading.current?.focus();
  }, [done]);

  const focusField = (f: Field) => formRef.current?.querySelector<HTMLElement>(`[name="${f}"]`)?.focus();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending || !apiReady) return;
    const data = new FormData(e.currentTarget);
    const get = (k: string) => String(data.get(k) ?? "").trim();

    const next: Errors = {};
    for (const f of REQUIRED) {
      if (!get(f)) next[f] = f === "region" || f === "produces" ? c.errors.choose : c.errors.required;
    }
    for (const f of ["wineryName", "fullName"] as const) {
      if (get(f).length === 1) next[f] = c.errors.short;
    }
    if (get("email") && !EMAIL_RE.test(get("email"))) next.email = c.errors.email;
    if (get("phone") && !PHONE_RE.test(get("phone"))) next.phone = c.errors.phone;
    if (!data.get("consent")) next.consent = c.errors.consent;
    setErrors(next);
    const first = FIELDS.find((f) => next[f]);
    if (first) {
      setStatus(c.errors.summary);
      focusField(first);
      return;
    }

    const body: WineryWaitlistRequest = {
      type: "WINERY",
      wineryName: get("wineryName"),
      fullName: get("fullName"),
      email: get("email"),
      consent: true,
      locale: lang,
      website: String(data.get("website") ?? ""),
    };
    if (get("phone")) body.phone = get("phone");
    if (get("region")) body.region = get("region");
    const produces = asProduces(get("produces"));
    if (produces) body.produces = produces;
    if (get("message")) body.message = get("message");
    const source = rememberSource();
    if (source) body.source = source;

    setSending(true);
    setStatus(c.sendingStatus);
    const res = await joinWaitlist(body);
    setSending(false);

    if (res.ok) {
      setStatus("");
      setDone({ name: body.wineryName, position: positionOf(res.data) });
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
          // The server writes its messages in Spanish.
          fromServer[f] = lang === "es" && d.message ? d.message : c.errors.server;
        }
        setErrors(fromServer);
        const firstServer = FIELDS.find((f) => fromServer[f]);
        setStatus(firstServer ? [c.errors.summary, ...(lang === "es" ? loose : [])].join(" ") : lang === "es" && loose.length > 0 ? loose.join(" ") : c.errors.generic(MAIL));
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
        setStatus(c.errors.unavailable(MAIL));
        return;
      default:
        setStatus(c.errors.generic(MAIL));
    }
  };

  const clearError = (target: EventTarget) => {
    const name = (target as HTMLInputElement).name as Field;
    if (name && errors[name]) setErrors((prev) => without(prev, name));
  };

  if (done) {
    return (
      // No live region here: focus moves to the heading, which announces the result.
      <div id={anchor} className={`${styles.success} ${w.done}`}>
        <h3 ref={doneHeading} tabIndex={-1}>
          {c.doneTitle}
        </h3>
        {done.position !== null ? (
          <div className={w.position}>
            <span className={w.positionLabel}>{c.positionLabel}</span>
            <strong className={w.positionNumber} data-testid="waitlist-position">
              {c.position(new Intl.NumberFormat(lang === "es" ? "es-BO" : "en-US").format(done.position))}
            </strong>
          </div>
        ) : null}
        <p>{c.done(done.name)}</p>
        <p className={styles.doneLabel}>{c.nextLabel}</p>
        <ol className={styles.doneSteps}>
          {c.next.map((s) => (
            <li key={s.h}>
              <strong>{s.h}.</strong> {s.p}
            </li>
          ))}
        </ol>
        <ShareInvite lang={lang} />
        <p className={w.again}>
          <button
            type="button"
            className={styles.textLink}
            onClick={() => {
              setDone(null);
              setErrors({});
            }}
          >
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
  const describedBy = (f: Field, hint?: string) => [hint, errors[f] ? `${id}-${f}-err` : null].filter(Boolean).join(" ") || undefined;
  const aria = (f: Field, hint?: string) => ({
    "aria-invalid": errors[f] ? true : undefined,
    "aria-describedby": describedBy(f, hint),
  });
  const input = (
    f: "wineryName" | "fullName" | "email" | "phone",
    props: InputHTMLAttributes<HTMLInputElement>,
    { hint, wide = false }: { hint?: string; wide?: boolean } = {},
  ) => (
    <div className={`${styles.field} ${wide ? styles.fieldWide : ""}`}>
      <label className={styles.label} htmlFor={`${id}-${f}`}>
        {c[f]}
      </label>
      <input id={`${id}-${f}`} name={f} className={`${styles.input} ${w.control}`} required {...props} {...aria(f, hint ? `${id}-${f}-hint` : undefined)} />
      {hint ? (
        <p id={`${id}-${f}-hint`} className={w.hint}>
          {hint}
        </p>
      ) : null}
      {err(f)}
    </div>
  );

  return (
    <div id={anchor} className={anchor ? styles.formWrap : undefined}>
      {!apiReady ? (
        <p className={`${styles.notice} ${w.notReady}`} id={`${id}-not-ready`}>
          {c.notReady(MAIL)}
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
          {input("wineryName", { autoComplete: "organization", autoCapitalize: "words", enterKeyHint: "next", maxLength: 160 }, { wide: true })}
          <div className={styles.field}>
            <label className={styles.label} htmlFor={`${id}-region`}>
              {c.region}
            </label>
            <select id={`${id}-region`} name="region" className={`${styles.select} ${w.control}`} defaultValue="" required {...aria("region")}>
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
          <fieldset
            className={`${styles.choice} ${w.produces}`}
            role="radiogroup"
            aria-labelledby={`${id}-produces`}
            aria-required="true"
            aria-invalid={errors.produces ? true : undefined}
            aria-describedby={describedBy("produces")}
          >
            <legend id={`${id}-produces`} className={styles.label}>
              {c.produces}
            </legend>
            {PRODUCES.map((p) => (
              <label key={p}>
                <input type="radio" name="produces" value={p} required />
                {c.producesOptions[p]}
              </label>
            ))}
            {err("produces")}
          </fieldset>
        </fieldset>

        <fieldset className={styles.group}>
          <legend className={styles.groupLegend}>{c.contact}</legend>
          {input("fullName", { autoComplete: "name", autoCapitalize: "words", enterKeyHint: "next", maxLength: 120 }, { wide: true })}
          {input("email", { type: "email", autoComplete: "email", inputMode: "email", autoCapitalize: "none", spellCheck: false, enterKeyHint: "next", maxLength: 254 })}
          {input("phone", { type: "tel", autoComplete: "tel", inputMode: "tel", enterKeyHint: "next", maxLength: 20 }, { hint: c.phoneHint })}
          <div className={`${styles.field} ${styles.fieldWide}`}>
            <label className={styles.label} htmlFor={`${id}-message`}>
              {c.message}
            </label>
            <textarea id={`${id}-message`} name="message" className={`${styles.textarea} ${w.message}`} maxLength={500} {...aria("message")} />
            {err("message")}
          </div>
        </fieldset>

        {/* Honeypot (contract §1): out of sight, out of the tab order and hidden from assistive tech. */}
        <div className={styles.trap} aria-hidden="true">
          <label>
            Website
            <input name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
          </label>
        </div>

        <div className={`${styles.field} ${styles.fieldWide}`}>
          <label className={`${styles.consent} ${w.consent}`}>
            <input type="checkbox" name="consent" required {...aria("consent")} />
            <span>
              {c.consent} <a href={privacyHref}>{c.privacy}</a>
            </span>
          </label>
          {err("consent")}
          <p className={w.hint}>{c.privacyNote}</p>
        </div>

        <div className={`${styles.formFoot} ${w.foot}`}>
          <button type="submit" className={`${styles.button} ${w.submit}`} disabled={!apiReady} aria-disabled={sending || undefined}>
            {sending ? c.sending : c.submit}
          </button>
        </div>
        <p className={styles.formStatus} role="status" aria-live="polite" aria-atomic="true">
          {status}
        </p>
      </form>
    </div>
  );
}
