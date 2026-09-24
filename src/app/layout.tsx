import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, EB_Garamond } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Drinks on Chain",
    template: "%s · Drinks on Chain",
  },
  description:
    "Vinos de altura y singani de Bolivia con trazabilidad desde el viñedo hasta la botella. Un mapa vivo de las parcelas de Tarija y el Valle de Cinti.",
  applicationName: "Drinks on Chain",
  keywords: ["vino boliviano", "singani", "Tarija", "Valle de Cinti", "trazabilidad", "bodegas"],
  openGraph: {
    title: "Drinks on Chain",
    description: "Vinos de altura y singani de Bolivia, con la historia de cada parcela.",
    type: "website",
    locale: "es_BO",
  },
};

export const viewport: Viewport = {
  themeColor: "#fdfcf5",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${cormorant.variable} ${garamond.variable}`}>
      <body className="paper-grain">{children}</body>
    </html>
  );
}
