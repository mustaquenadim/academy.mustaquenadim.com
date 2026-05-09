import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Geist_Mono, Inter } from 'next/font/google';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang='en'
      className={`${inter.className} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className='flex flex-col min-h-screen'>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
