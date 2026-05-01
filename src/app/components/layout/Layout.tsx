import type { ReactNode } from 'react';
import Footer from './Footer';
import Header from './Header';

type LayoutProps = {
  children: ReactNode;
  currentPage: 'home' | 'calculator';
};

export default function Layout({ children, currentPage }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#050b0f] text-white overflow-x-hidden flex flex-col webview-safe-bg app-shell">
      <Header currentPage={currentPage} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
