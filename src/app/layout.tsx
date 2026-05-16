import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Splitski',
  description: 'Feed the sheep, fix the city'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/[email protected]/dist/tabler-icons.min.css"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>
        <div className="w-full max-w-[430px] h-[100dvh] flex flex-col bg-brand-cream overflow-hidden relative">
          {children}
        </div>
      </body>
    </html>
  );
}
