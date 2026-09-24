"use client";

import { DiscoverFooter } from "@/components/pages/DiscoverFooter";
import { PageShell } from "@/components/pages/PageShell";
import { InkPhoto } from "@/components/ui/InkPhoto";
import { UI } from "@/content/i18n";
import { IMAGES } from "@/content/images";
import { useExperience } from "@/store/experience";
import styles from "./Editorial.module.css";

const COPY = {
  es: {
    title: "Historia",
    intro: [
      "Drinks on Chain nace en los valles altos de Bolivia, donde la vid crece entre 1.700 y 2.400 metros y madura bajo una luz que en pocos lugares del mundo se parece. Somos un puente entre las familias que cultivan esas parcelas y las personas que descorchan sus botellas.",
      "Cada lote que entra en nuestra red se registra desde la tierra: la altitud del terreno, la cepa, la fecha de vendimia, el tanque, la barrica o el alambique, los meses de reposo. Ese registro viaja con la botella y se puede leer con un gesto.",
    ],
    sections: [
      {
        heading: "El origen",
        body: [
          "La vid llegó a los Cintis y a Tarija con los primeros pobladores españoles del siglo XVI; hacia 1590 ya se documentan viñas en Tolomosa. En el cañón de Cinti las parras se conducen todavía sobre molles y chañares, un sistema de más de dos siglos que da vides centenarias y una vendimia que se hace con escalera.",
          "Trabajamos con bodegas que conocen sus parcelas por su nombre y que aceptan mostrar cómo trabajan. Esa transparencia es la materia prima de todo lo que hacemos.",
        ],
      },
      {
        heading: "La altura",
        body: [
          "A dos mil metros la radiación ultravioleta es intensa y las noches frías. La uva engrosa la piel, guarda acidez y concentra aromas. Los tintos de Tarija, con el Tannat a la cabeza, salen tensos y minerales; el singani, destilado del vino de Moscatel de Alejandría cultivada por encima de los 1.600 metros, conserva el jazmín y el durazno blanco de la uva.",
          "El mapa que recorre esta web dibuja esas zonas una a una, con su exposición, su suelo y su altitud, como lo haría un cuaderno de campo.",
        ],
      },
      {
        heading: "La trazabilidad",
        body: [
          "Del pesaje en báscula al embotellado, cada paso queda escrito en una bitácora que no se puede reescribir. La botella lleva un código único; quien lo lee ve la historia completa y, si quiere, puede adquirir la próxima añada directamente a la bodega.",
        ],
      },
    ],
    highlight: "Una botella es un lugar, un año y una familia. Nosotros solo nos encargamos de que no se pierda en el camino.",
    next: "Los vinos",
  },
  en: {
    title: "History",
    intro: [
      "Drinks on Chain was born in the high valleys of Bolivia, where vines grow between 1,700 and 2,400 metres and ripen under a light few places in the world can match. We are a bridge between the families who farm those parcels and the people who open their bottles.",
      "Every lot that enters our network is recorded from the soil up: the altitude of the plot, the variety, the harvest date, the tank, the barrel or the still, the months of rest. That record travels with the bottle and can be read with a single gesture.",
    ],
    sections: [
      {
        heading: "The origin",
        body: [
          "Vines reached the Cinti valley and Tarija with the first Spanish settlers of the 16th century; by 1590 vineyards are documented in Tolomosa. In the Cinti canyon the vines are still trained on molle and chañar trees, a system over two centuries old that yields centenarian plants and a harvest done by ladder.",
          "We work with wineries that know their parcels by name and agree to show how they work. That transparency is the raw material of everything we do.",
        ],
      },
      {
        heading: "The altitude",
        body: [
          "At two thousand metres the ultraviolet light is fierce and the nights are cold. The grapes thicken their skins, keep their acidity and concentrate their aromas. Tarija's reds, Tannat first among them, come out taut and mineral; singani, distilled from Moscatel de Alejandría grown above 1,600 metres, keeps the jasmine and white peach of the grape.",
          "The map on this site draws those zones one by one, with their exposure, soil and altitude, the way a field notebook would.",
        ],
      },
      {
        heading: "Traceability",
        body: [
          "From the weighbridge to bottling, every step is written in a log that cannot be rewritten. Each bottle carries a unique code; whoever reads it sees the whole story and, if they wish, can buy the next vintage directly from the winery.",
        ],
      },
    ],
    highlight: "A bottle is a place, a year and a family. We only make sure none of it gets lost on the way.",
    next: "The wines",
  },
} as const;

/** Photographs per block, picked from the researched, freely licensed set. */
const pick = (i: number) => IMAGES.history[i % Math.max(1, IMAGES.history.length)];

export function HistoryPage() {
  const lang = useExperience((s) => s.lang);
  const c = COPY[lang];
  const t = UI[lang];
  const hero = IMAGES.villages.tarija?.[0] ?? pick(0); // aerial harvest view
  const origin = pick(7); // centenarian vines on trees, Cinti
  const altitude = pick(4); // Moscatel de Alejandría grapes
  const trace = pick(5); // barrels
  const still = pick(3); // copper still

  return (
    <PageShell eyebrow={t.historyTitle}>
      <header className={styles.header}>
        <span className="small-heading">Drinks on Chain</span>
        <span className="heading-separator" aria-hidden="true" />
        <h2 className="text-heading crossed">{c.title}</h2>
      </header>

      <div className={`${styles.textAlignLeft} prose-body`}>
        {c.intro.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {hero ? (
        <InkPhoto
          src={hero.src}
          alt={hero.alt[lang]}
          caption={hero.caption[lang]}
          credit={hero.credit}
          ratio={1.85}
          className={styles.hero}
          priority
          sizes="100vw"
        />
      ) : null}

      {c.sections.map((s, i) => {
        const photo = i === 0 ? origin : i === 1 ? altitude : trace;
        return (
          <section key={s.heading} className={styles.block}>
            <div className={`${styles.textAlignLeft} prose-body`}>
              <h3>{s.heading}</h3>
              {s.body.map((p, k) => (
                <p key={k}>{p}</p>
              ))}
            </div>
            {i === 1 ? <p className={`${styles.highlight} highlight`}>{c.highlight}</p> : null}
            {photo ? (
              <InkPhoto
                src={photo.src}
                alt={photo.alt[lang]}
                caption={photo.caption[lang]}
                credit={photo.credit}
                ratio={i === 1 ? 0.74 : 1.7}
                className={i === 1 ? styles.portrait : styles.wide}
              />
            ) : null}
            {i === 2 && still ? (
              <InkPhoto
                src={still.src}
                alt={still.alt[lang]}
                caption={still.caption[lang]}
                credit={still.credit}
                ratio={1.5}
                className={styles.portrait}
              />
            ) : null}
          </section>
        );
      })}

      <DiscoverFooter href="/vinos" caption={c.next} prepend={t.discover} />
    </PageShell>
  );
}
