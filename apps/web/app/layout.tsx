import type { Metadata } from 'next';
import { Providers } from '@/app/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cruz N Clean',
  description: 'Premium mobile detailing portfolio and booking experience.',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * Renders the top-level HTML shell for all web routes.
 */
export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="en">
      <body className="bg-neutralGray text-brandBlack font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
