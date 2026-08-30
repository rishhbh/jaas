import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import Script from 'next/script';

const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jaas.dev';
const appUrl = rawAppUrl.startsWith('http') ? rawAppUrl.replace(/\/$/, '') : `https://${rawAppUrl.replace(/\/$/, '')}`;
const ogImageUrl = `${appUrl}/og-image.png`;
const ogDynamicUrl = `${appUrl}/og`;

export const viewport: Viewport = {
  themeColor: '#0a0a0c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'JaaS // AI Repository & README Judge Engine',
    template: '%s | JaaS Engine',
  },
  description:
    'Unhinged, high-velocity AI repository critique engine powered by Groq GPT-OSS-120B, Bun Express runtime, and Upstash Redis rate limiting.',
  keywords: [
    'GitHub Roast',
    'AI Code Review',
    'README Judge',
    'Groq GPT-120B',
    'Developer Tools',
    'Neubrutalism',
    'JaaS',
    'Judging as a Service',
    'Repository Evaluator',
  ],
  authors: [{ name: 'JaaS Engineering Team', url: appUrl }],
  creator: 'JaaS Engineering',
  publisher: 'JaaS',
  applicationName: 'JaaS Engine',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/jaas.png', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/jaas.png',
    apple: '/jaas.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: appUrl,
    title: 'JaaS // AI Repository & README Judge Engine',
    description:
      'Paste your GitHub repository or raw README markdown to receive an unhinged, high-velocity technical critique powered by Groq GPT-OSS-120B.',
    siteName: 'JaaS Engine',
    images: [
      {
        url: ogImageUrl,
        secureUrl: ogImageUrl,
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: 'JaaS // AI Repository & README Judge Engine',
      },
      {
        url: ogDynamicUrl,
        secureUrl: ogDynamicUrl,
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: 'JaaS // AI Repository & README Judge Engine',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JaaS // AI Repository & README Judge Engine',
    description:
      'Unhinged AI technical critique engine powered by Groq GPT-OSS-120B, Bun runtime, and Upstash Redis.',
    images: [ogImageUrl],
    creator: '@jaas_dev',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'JaaS - Judging-as-a-Service',
  operatingSystem: 'All',
  applicationCategory: 'DeveloperApplication',
  description:
    'Unhinged AI repository judging engine powered by Groq GPT-OSS-120B, Bun Express runtime, and Upstash Redis rate limiting.',
  url: appUrl,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  creator: {
    '@type': 'Organization',
    name: 'JaaS Engineering',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="icon" type="image/png" href="/jaas.png" />
        <link rel="shortcut icon" href="/jaas.png" />
        <link rel="apple-touch-icon" href="/jaas.png" />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:secure_url" content={ogImageUrl} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="JaaS // AI Repository & README Judge Engine" />
        <meta name="twitter:image" content={ogImageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased min-h-screen bg-[var(--bg)] text-[var(--ink)] font-mono">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
