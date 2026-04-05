import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/store/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Autodesk MEP Clash Platform',
  description: 'Native .RVT routing powered by Autodesk Platform Services',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-900 text-slate-100`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
