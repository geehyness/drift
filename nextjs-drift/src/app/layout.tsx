import '@/app/globals.css';
import { Inter } from 'next/font/google';
import { ShoppingCartProvider } from '@/context/ShoppingCartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from '@/components/Layout.module.css';
import ShoppingCart from '@/components/ShoppingCart';
import FloatingCartButton from '@/components/FloatingCartButton';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Drift",
  description: 'Best local meals in town',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ShoppingCartProvider>
          <div className={styles.layout}>
            <Header />
            <main>
              {children}
            </main>
            <FloatingCartButton />
            <Footer />
            <ShoppingCart />
          </div>
        </ShoppingCartProvider>
      </body>
    </html>
  );
}