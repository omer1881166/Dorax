import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import InstallPrompt from "@/components/InstallPrompt";
import CountrySelector from "@/components/CountrySelector";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Dorax Technical Module Builder",
  description: "Construct and quote custom data center infrastructure components.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#ea580c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="antialiased">
        {children}
        <InstallPrompt />
        <CountrySelector />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
