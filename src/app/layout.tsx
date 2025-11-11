import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProviders } from './providers';
import { HeaderBar } from '@/components/HeaderBar';
import { Footer } from '@/components/Footer';
import { ColorSchemeScript } from '@mantine/core';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Serenity Wellness - Therapy & Mental Health Services',
  description:
    'Find the right therapist for you. Our licensed clinicians specialize in anxiety, depression, trauma, and more. Simple, confidential booking through our secure portal.',
  openGraph: {
    title: 'Serenity Wellness - Therapy & Mental Health Services',
    description:
      'Find the right therapist for you. Our licensed clinicians specialize in anxiety, depression, trauma, and more.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <ThemeProviders>
          <HeaderBar />
          <main style={{ minHeight: 'calc(100vh - 300px)' }}>{children}</main>
          <Footer />
        </ThemeProviders>
      </body>
    </html>
  );
}
