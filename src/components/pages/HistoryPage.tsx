"use client";

import { DiscoverFooter } from "@/components/pages/DiscoverFooter";
import { PageShell } from "@/components/pages/PageShell";
import { FramedHatch } from "@/components/ui/InkIllustrations";
import { UI } from "@/content/i18n";
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
          "El Valle Central de Tarija y el Valle de Cinti llevan más de cuatro siglos haciendo vino y destilando singani. Misioneros, arrieros y familias criollas plantaron Moscatel de Alejandría en terrazas junto al río, y algunas de esas plantas, trepadas sobre molles y chañares, siguen dando fruto.",
          "Trabajamos con bodegas que conocen sus parcelas por su nombre y que aceptan mostrar cómo trabajan. Esa transparencia es la materia prima de todo lo que hacemos.",
        ],
        figure: "Terrazas de Moscatel en el cañón de Cinti, plantadas sobre árboles.",
      },
      {
        heading: "La altura",
        body: [
          "A dos mil metros la radiación ultravioleta es intensa y las noches frías. La uva engrosa la piel, guarda acidez y concentra aromas. Los tintos salen tensos y minerales; el singani, destilado del vino de Moscatel, conserva el jazmín y el durazno blanco de la uva.",
          "El mapa que recorre esta web dibuja esas parcelas una a una, con su exposición, su suelo y su altitud, como lo haría un cuaderno de campo.",
        ],
        figure: "El Valle Central de Tarija desde el camino a San Lorenzo.",
      },
      {
        heading: "La trazabilidad",
        body: [
          "Del pesaje en báscula al embotellado, cada paso queda escrito en una bitácora que no se puede reescribir. La botella lleva un código único; quien lo lee ve la historia completa y, si quiere, puede adquirir la próxima añada directamente a la bodega.",
        ],
        figure: "Bitácora de fermentación, tanque 4, vendimia 2026.",
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
          "The Central Valley of Tarija and the Cinti Valley have been making wine and distilling singani for more than four centuries. Missionaries, muleteers and creole families planted Moscatel de Alejandría on terraces by the river, and some of those vines, climbing on molle and chañar trees, still bear fruit.",
          "We work with wineries that know their parcels by name and agree to show how they work. That transparency is the raw material of everything we do.",
        ],
        figure: "Moscatel terraces in the Cinti canyon, trained on trees.",
      },
      {
        heading: "The altitude",
        body: [
          "At two thousand metres the ultraviolet light is fierce and the nights are cold. The grapes thicken their skins, keep their acidity and concentrate their aromas. The reds come out taut and mineral; singani, distilled from Moscatel wine, keeps the jasmine and white peach of the grape.",
          "The map on this site draws those parcels one by one, with their exposure, soil and altitude, the way a field notebook would.",
        ],
        figure: "The Central Valley of Tarija from the road to San Lorenzo.",
      },
      {
        heading: "Traceability",
        body: [
          "From the weighbridge to bottling, every step is written in a log that cannot be rewritten. Each bottle carries a unique code; whoever reads it sees the whole story and, if they wish, can buy the next vintage directly from the winery.",
        ],
        figure: "Fermentation log, tank 4, 2026 harvest.",
      },
    ],
    highlight: "A bottle is a place, a year and a family. We only make sure none of it gets lost on the way.",
    next: "The wines",
  },
} as const;

export function HistoryPage() {
  const lang = useExperience((s) => s.lang);
  const c = COPY[lang];
  const t = UI[lang];

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

      <FramedHatch ratio={1.85} className={styles.hero} caption={c.sections[0].figure} />

      {c.sections.map((s, i) => (
        <section key={s.heading} className={styles.block}>
          <div className={`${styles.textAlignLeft} prose-body`}>
            <h3>{s.heading}</h3>
            {s.body.map((p, k) => (
              <p key={k}>{p}</p>
            ))}
          </div>
          {i === 1 ? (
            <p className={`${styles.highlight} highlight`}>{c.highlight}</p>
          ) : null}
          {i > 0 ? (
            <FramedHatch
              ratio={i === 1 ? 0.74 : 1.7}
              className={i === 1 ? styles.portrait : styles.wide}
              caption={s.figure}
            />
          ) : null}
        </section>
      ))}

      <DiscoverFooter href="/vinos" caption={c.next} prepend={t.discover} />
    </PageShell>
  );
}
