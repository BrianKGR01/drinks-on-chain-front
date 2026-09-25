import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Cormorant_Garamond, EB_Garamond } from "next/font/google";
import { SceneHost } from "@/components/SceneHost";
import { SITE_URL, pageMetadata } from "@/lib/site";
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

const home = pageMetadata({
  path: "/",
  description:
    "El mapa grabado de las bodegas de altura de Bolivia: parcelas de Tarija y el Valle de Cinti, bodegas de la red, puntos de recojo y acceso para socios.",
});

export const metadata: Metadata = {
  ...home,
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Drinks on Chain · Bodegas",
    template: "%s · Drinks on Chain",
  },
  description:
    "Vinos de altura y singani de Bolivia con trazabilidad desde el viñedo hasta la botella. Un mapa vivo de las parcelas de Tarija y el Valle de Cinti.",
  applicationName: "Drinks on Chain",
  keywords: ["vino boliviano", "singani", "Tarija", "Valle de Cinti", "trazabilidad", "bodegas"],
  twitter: { card: "summary_large_image" },
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
      <body className="paper-grain">
        <SceneHost />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
