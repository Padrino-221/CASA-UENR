import localFont from 'next/font/local';
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import PwaRegister from "@/components/PwaRegister";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION, OG_IMAGE } from "@/lib/seo";

const jakarta = localFont({ src: '../../public/fonts/PlusJakartaSans.ttf', variable: '--font-plus-jakarta', display: 'swap', weight: '200 800' });

const defaultTitle = `${SITE_NAME} — Christ Apostolic Students and Associates`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: defaultTitle, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'CASA UENR',
    'Christ Apostolic Students and Associates',
    'University of Energy and Natural Resources',
    'UENR fellowship',
    'student fellowship Ghana',
    'campus ministry',
    'Sunyani',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'education',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: defaultTitle,
    description: SITE_DESCRIPTION,
    url: '/',
    locale: 'en_US',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} logo` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  manifest: '/manifest.webmanifest',
  icons: [
    { rel: 'icon', url: '/casa-favicon-32.png', type: 'image/png', sizes: '32x32' },
    { rel: 'icon', url: '/casa-favicon-192.png', type: 'image/png', sizes: '192x192' },
    { rel: 'apple-touch-icon', url: '/casa-favicon-180.png', sizes: '180x180' },
  ],
};

export const viewport: Viewport = {
  themeColor: '#1E67FC',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} ${jakarta.className} antialiased`}>
        <Providers>
          <PwaRegister />
          {children}
        </Providers>
      </body>
    </html>
  );
}
