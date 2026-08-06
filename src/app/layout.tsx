import type { Metadata } from "next";
import { Oxanium } from "next/font/google";
import "./globals.css";
import Nav from "@/components/layout-components/Nav";
import Footer from "@/components/layout-components/Footer";
import DigitalRain from "@/components/effects/DigitalRain";

const oxanium = Oxanium({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-oxanium",
});

export const metadata: Metadata = {
  title: "bizaphy's lab",
  description: "using next",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${oxanium.className} antialiased min-h-screen flex flex-col`}
      >
        <DigitalRain />
        <Nav />

        {/* contenido principal */}
        <main className="relative z-10 flex-1 min-h-screen">{children}</main>

        <Footer />
      </body>
    </html>
  );
}
