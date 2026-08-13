import type { Viewport } from "next";
import {
  Source_Serif_4,
  Archivo,
  Archivo_Narrow,
  Tiro_Devanagari_Marathi,
} from "next/font/google";
import "./globals.css";

/*
 * The root layout carries only the document shell — faces, the boot script and
 * the base stylesheet. The public site's header and footer live in
 * (site)/layout.tsx, and the panel's chrome in admin/layout.tsx, so /admin is
 * not wrapped in the school's navigation.
 *
 * All three Latin faces are variable, so no `weight` array is passed — naming
 * weights would make next/font download one static file per weight instead of
 * a single variable file. Source Serif is optical-size variable too, which is
 * what lets one file carry both the 68px masthead and a 20px card title. Tiro
 * is only ever set in Devanagari, so it ships that subset alone.
 */
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const archivoNarrow = Archivo_Narrow({
  subsets: ["latin"],
  variable: "--font-archivo-narrow",
  display: "swap",
});

const tiro = Tiro_Devanagari_Marathi({
  subsets: ["devanagari"],
  variable: "--font-tiro",
  display: "swap",
  weight: ["400"],
});

export const viewport: Viewport = {
  themeColor: "#002147",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-IN"
      // The boot script below adds `js` to this element before React hydrates,
      // which React would otherwise report as a server/client mismatch.
      suppressHydrationWarning
      className={`${sourceSerif.variable} ${archivo.variable} ${archivoNarrow.variable} ${tiro.variable}`}
    >
      <head>
        {/*
          Runs before first paint. Reveal animations only hide content once this
          has confirmed JavaScript is running, so a scripting failure leaves the
          page fully readable instead of blank.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js')`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
