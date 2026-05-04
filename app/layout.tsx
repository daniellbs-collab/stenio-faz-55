import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://steniofaz55.eteolabs.com.br";

export const metadata: Metadata = {
  description:
    "Boteco Caju Lim\u00e3o Sudoeste. Choppe gelado, petisco na chapa e 55 anos pra brindar. Confirma a\u00ed?",
  icons: {
    apple: "/apple-touch-icon.png",
    icon: "/favicon.ico",
  },
  manifest: "/manifest.json",
  metadataBase: new URL(siteUrl),
  openGraph: {
    description:
      "07.05.2026 \u00b7 Boteco Caju Lim\u00e3o Sudoeste. Vem brindar com a gente.",
    images: [
      {
        alt: "Convite St\u00eanio 55",
        height: 630,
        url: "/api/og",
        width: 1200,
      },
    ],
    locale: "pt_BR",
    siteName: "St\u00eanio 55",
    title: "St\u00eanio faz 55",
    type: "website",
    url: "/",
  },
  robots: {
    follow: false,
    index: false,
  },
  title: "St\u00eanio faz 55 \u2014 07 de maio de 2026",
  twitter: {
    card: "summary_large_image",
    description:
      "07.05.2026 \u00b7 Boteco Caju Lim\u00e3o Sudoeste. Vem brindar com a gente.",
    images: ["/api/og"],
    title: "St\u00eanio faz 55",
  },
};

export const viewport: Viewport = {
  themeColor: "#F5A98A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${fraunces.variable} ${inter.variable} font-body`}>
        <a
          className="sr-only z-50 rounded-md bg-background px-4 py-3 text-sm font-medium text-primary focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:outline-none focus:ring-2 focus:ring-primary"
          href="#conteudo"
        >
          {"Pular para o conte\u00fado"}
        </a>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
