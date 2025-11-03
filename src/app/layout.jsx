import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FlashlightWrapper from "./components/FlashlightWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CDP Game 2025 - TOWER OF {CODE}",
  description: "Bienvenue dans la tour du code",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <FlashlightWrapper />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}

