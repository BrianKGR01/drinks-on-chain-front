"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/pages/PageShell";
import { UI } from "@/content/i18n";
import { postPublic } from "@/lib/public-api";
import type { Lang } from "@/lib/scene-contract";
import { useExperience } from "@/store/experience";
import styles from "./Network.module.css";

type State = "verifying" | "verified" | "invalid" | "rate-limited" | "network" | "unavailable" | "error";

const MAIL = "bodegas@drinksonchain.bo";

const COPY = {
  es: {
    eyebrow: "Confirmar el correo",
    verifying: "Confirmando tu correo…",
    verified: {
      title: "Correo confirmado",
      text: "Gracias. Tu solicitud ya está en manos del equipo de Drinks on Chain.",
      next: [
        "Revisamos la solicitud y te escribimos a este correo.",
        "Si hace falta, agendamos una llamada, una videollamada o una visita a la bodega.",
        "Si se aprueba, el dueño de la bodega recibe una invitación para crear su cuenta en el ERP.",
      ],
    },
    invalid: {
      title: "Enlace no válido",
      text: "Este enlace de confirmación no es válido, ya se usó o caducó. Si ya confirmaste tu correo, no tienes que hacer nada más.",
    },
    rateLimited: "Hubo demasiados intentos desde tu conexión. Espera unos minutos y vuelve a abrir el enlace.",
    network: "No pudimos conectar con el servidor. Revisa tu conexión y vuelve a intentarlo.",
    unavailable: "La confirmación no está disponible en este momento. Vuelve a abrir el enlace más tarde.",
    error: "No pudimos confirmar tu correo. Vuelve a intentarlo en unos minutos.",
    retry: "Volver a intentarlo",
    again: "Enviar una nueva solicitud",
    back: "Volver a Unirse",
    mail: "¿Algún problema? Escríbenos a",
  },
  en: {
    eyebrow: "Confirm your email",
    verifying: "Confirming your email…",
    verified: {
      title: "Email confirmed",
      text: "Thank you. Your application is now with the Drinks on Chain team.",
      next: [
        "We review the application and write to you at this address.",
        "If needed, we schedule a call, a video call or a visit to the winery.",
        "If approved, the winery's owner receives an invitation to create their ERP account.",
      ],
    },
    invalid: {
      title: "Invalid link",
      text: "This confirmation link is not valid, was already used or has expired. If you already confirmed your email, there is nothing else to do.",
    },
    rateLimited: "Too many attempts from your connection. Wait a few minutes and open the link again.",
    network: "We could not reach the server. Check your connection and try again.",
    unavailable: "Confirmation is not available right now. Open the link again later.",
    error: "We could not confirm your email. Try again in a few minutes.",
    retry: "Try again",
    again: "Send a new application",
    back: "Back to Join",
    mail: "Any problem? Write to us at",
  },
} as const;

/** Maps the answer of `POST /v1/public/winery-applications/verify` to what the page shows. */
async function verify(token: string): Promise<State> {
  const res = await postPublic<null>("public/winery-applications/verify", { token });
  if (res.ok) return "verified";
  switch (res.kind) {
    case "validation":
      return "invalid";
    case "rate-limited":
    case "network":
    case "unavailable":
      return res.kind;
    default:
      // 404/410 or a token-specific code: the link is not usable.
      return res.status === 404 || res.status === 410 || /TOKEN/.test(res.code ?? "") ? "invalid" : "error";
  }
}

function Verify({ lang, apiReady }: { lang: Lang; apiReady: boolean }) {
  const c = COPY[lang];
  const token = useSearchParams().get("token")?.trim() ?? "";
  const [state, setState] = useState<State>(!apiReady ? "unavailable" : token ? "verifying" : "invalid");
  const heading = useRef<HTMLHeadingElement>(null);
  const started = useRef(false);

  const run = () => {
    setState("verifying");
    verify(token).then(setState);
  };

  useEffect(() => {
    // Once per visit (the token is single use; Strict Mode runs effects twice in development).
    if (started.current || !apiReady || !token) return;
    started.current = true;
    verify(token).then(setState);
  }, [apiReady, token]);

  useEffect(() => {
    if (state !== "verifying") heading.current?.focus();
  }, [state]);

  const mail = (
    <p>
      {c.mail}{" "}
      <a href={`mailto:${MAIL}`} className={`${styles.textLink} ${styles.mail}`}>
        {MAIL}
      </a>
    </p>
  );

  if (state === "verifying") {
    return (
      <div className={styles.success} role="status" aria-busy="true">
        <p>{c.verifying}</p>
      </div>
    );
  }

  if (state === "verified") {
    return (
      <div className={styles.success} role="status">
        <h2 ref={heading} tabIndex={-1} className={styles.resultTitle}>
          {c.verified.title}
        </h2>
        <p>{c.verified.text}</p>
        <ol className={styles.doneSteps}>
          {c.verified.next.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ol>
        {mail}
      </div>
    );
  }

  if (state === "invalid") {
    return (
      <div className={`${styles.success} ${styles.failure}`} role="alert">
        <h2 ref={heading} tabIndex={-1} className={styles.resultTitle}>
          {c.invalid.title}
        </h2>
        <p>{c.invalid.text}</p>
        <p style={{ marginTop: "2rem" }}>
          <Link href="/unirse#formulario" className={styles.buttonGhost}>
            {c.again}
          </Link>
        </p>
        {mail}
      </div>
    );
  }

  // Transient failures: the token may still be good, so offer a retry.
  const message = state === "rate-limited" ? c.rateLimited : state === "network" ? c.network : state === "unavailable" ? c.unavailable : c.error;
  return (
    <div className={`${styles.success} ${styles.failure}`} role="alert">
      <h2 ref={heading} tabIndex={-1} className={styles.resultTitle}>
        {c.eyebrow}
      </h2>
      <p>{message}</p>
      <p style={{ marginTop: "2rem" }}>
        {apiReady && token && state !== "rate-limited" ? (
          <button type="button" className={styles.buttonGhost} onClick={run}>
            {c.retry}
          </button>
        ) : (
          <Link href="/unirse" className={styles.buttonGhost}>
            {c.back}
          </Link>
        )}
      </p>
      {mail}
    </div>
  );
}

/** /unirse/verificar?token= — confirms the contact email of a winery application (O1-WEB-1). */
export function VerifyApplicationPage({ apiReady }: { apiReady: boolean }) {
  const lang = useExperience((s) => s.lang);
  const c = COPY[lang];
  const t = UI[lang];
  return (
    <PageShell eyebrow={c.eyebrow}>
      <header className={styles.header}>
        <span className="small-heading">{t.brand}</span>
        <span className="heading-separator" aria-hidden="true" />
      </header>
      <section className={styles.section} aria-label={c.eyebrow}>
        {/* useSearchParams needs a Suspense boundary to keep the page static */}
        <Suspense fallback={null}>
          <Verify lang={lang} apiReady={apiReady} />
        </Suspense>
      </section>
    </PageShell>
  );
}
