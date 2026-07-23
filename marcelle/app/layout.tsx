import type { Metadata } from "next";
import { Cinzel, Inter, Pinyon_Script, Cormorant_Garamond, Great_Vibes } from "next/font/google";

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: ["400"],
});
import "./globals.css";
import SystemBoot from "@/components/ui/SystemBoot"; // Import Client Component wrapper


const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const pinyon = Pinyon_Script({
  variable: "--font-pinyon",
  subsets: ["latin"],
  weight: ["400"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport = {
  themeColor: "#001233",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Marcelle Dias | 15 Anos",
  description: "O Convite Real para o Grande Baile de 15 Anos da Marcelle.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Marcelle 15 Anos",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${cinzel.variable} ${inter.variable} ${pinyon.variable} ${cormorant.variable} ${greatVibes.variable} antialiased bg-royal-dark text-pearl overflow-x-hidden`}
      >
        <SystemBoot>
          {children}
        </SystemBoot>
      </body>
    </html>
  );
}
