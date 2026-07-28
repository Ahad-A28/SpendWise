import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../components/ThemeProvider';
import { AppProvider } from '../context/AppContext';
import { LayoutWrapper } from '../components/LayoutWrapper';
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SpendWise AI - Smart Expense & Savings Tracker',
  description: 'AI-powered expense tracker with smart insights, budget goals, month-over-month comparison, and actionable savings recommendations.',
  manifest: '/manifest.json',
  applicationName: 'SpendWise AI',
  appleWebApp: {
    capable: true,
    title: 'SpendWise AI',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  other: {
    'msapplication-TileColor': '#4F46E5',
    'msapplication-TileImage': '/icons/icon-144x144.png',
    'theme-color': '#4F46E5',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <AppProvider>
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </AppProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
