import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './styles/index.css';

type TelegramWindow = Window & {
  Telegram?: {
    WebApp?: unknown;
  };
};

const detectWebViewSafeMode = () => {
  const ua = navigator.userAgent.toLowerCase();
  const win = window as TelegramWindow;
  const isTelegramWebView = ua.includes('telegram') || Boolean(win.Telegram?.WebApp);
  const isMobile = /iphone|ipad|android/.test(ua);
  const isLikelyMobileWebView = isMobile && (ua.includes(' wv') || ua.includes('; wv') || ua.includes('version/') || ua.includes('telegram'));

  const params = new URLSearchParams(window.location.search);
  const forceWebViewSafe = params.get('webviewSafe') === '1';
  const isWebViewSafe = forceWebViewSafe || isTelegramWebView || isLikelyMobileWebView;

  if (isWebViewSafe) {
    document.documentElement.classList.add('webview-safe');
    if (import.meta.env.DEV) {
      console.info('WebView safe mode enabled');
    }
  }
};

detectWebViewSafeMode();

const WbCalculatorPage = React.lazy(() => import('./app/pages/WbCalculatorPage'));
const calculatorPaths = new Set(['/calculator', '/tools/wb-calculator']);
const isCalculatorRoute = calculatorPaths.has(window.location.pathname);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isCalculatorRoute ? (
      <Suspense fallback={<div className="min-h-screen bg-[#070B10]" />}>
        <WbCalculatorPage />
      </Suspense>
    ) : (
      <App />
    )}
  </React.StrictMode>,
);
