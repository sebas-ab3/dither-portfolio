import type { Metadata } from "next";
import { VT323 } from "next/font/google";
import "./globals.css";
import { CRTFrame } from "@/components/crt/CRTFrame";

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Seb — Portfolio",
  description: "Creative developer portfolio with retro CRT aesthetic",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={vt323.variable}>
      <body className="font-vt323 antialiased">
        <CRTFrame>{children}</CRTFrame>
      </body>
    </html>
  );
}
