import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'Cogniform | Alternative to Google Forms, Typeform, and Jotform',
  description: 'Create dynamic forms using drag-and-drop components, share them, collect responses, and analyze submissions.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} antialiased`}>
      <body className="min-h-screen bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
