import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import PwaRegister from "@/components/PwaRegister";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  weight: ["400"],
  style: ["italic"],
});

export const metadata: Metadata = {
  title: 'CASA UENR',
  description: 'Premium institutional management platform for church networks and student ministries.',
  manifest: '/manifest.webmanifest',
  other: {
    'theme-color': '#1E67FC',
  },
  icons: [
    { rel: 'icon', url: '/casa-favicon-32.png', type: 'image/png', sizes: '32x32' },
    { rel: 'icon', url: '/casa-favicon-192.png', type: 'image/png', sizes: '192x192' },
    { rel: 'apple-touch-icon', url: '/casa-favicon-180.png', sizes: '180x180' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${instrumentSerif.variable}`}>
      <body className={`${plusJakartaSans.className} antialiased`}>
        <Providers>
          <PwaRegister />
          {children}
        </Providers>
      </body>
    </html>
  );
}
