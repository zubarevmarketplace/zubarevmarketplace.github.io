import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './styles/index.css';

type TelegramWindow = Window & {
  Telegram?: {
    WebApp?: unknown;
  };
};

const getBooleanParamFromSearchOrHash = (name: string) => {
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get(name) === '1') return true;

  const rawHash = window.location.hash.replace(/^#/, '');
  const normalizedHash = rawHash.startsWith('?') ? rawHash.slice(1) : rawHash;
  const hashParams = new URLSearchParams(normalizedHash);

  return hashParams.get(name) === '1';
};

const detectWebViewSafeMode = () => {
  const ua = navigator.userAgent.toLowerCase();
  const win = window as TelegramWindow;

  const forceWebViewSafe =
    getBooleanParamFromSearchOrHash('webviewSafe') ||
    getBooleanParamFromSearchOrHash('webviewsafe') ||
    getBooleanParamFromSearchOrHash('safe');

  const isTelegramWebView = ua.includes('telegram') || Boolean(win.Telegram?.WebApp);

  const isAndroidWebView =
    /android/.test(ua) &&
    (ua.includes('; wv') || ua.includes(' wv') || ua.includes('version/4.0') || ua.includes('version/'));

  const isIOSWebView = /iphone|ipad|ipod/.test(ua) && !ua.includes('safari');
  const isLikelyInAppBrowser = /instagram|fbav|fb_iab|vk|okapp|whatsapp|telegram/.test(ua);

  const isLikelyMobileWebView =
    /iphone|ipad|ipod|android/.test(ua) && (isAndroidWebView || isIOSWebView || isLikelyInAppBrowser);

  const isWebViewSafe = forceWebViewSafe || isTelegramWebView || isLikelyMobileWebView;

  if (isWebViewSafe) {
    document.documentElement.classList.add('webview-safe');
  }

  if (import.meta.env.DEV) {
    console.info('[webview-safe]', {
      enabled: isWebViewSafe,
      forced: forceWebViewSafe,
      telegram: isTelegramWebView,
      androidWebView: isAndroidWebView,
      iosWebView: isIOSWebView,
      inAppBrowser: isLikelyInAppBrowser,
      mobileWebView: isLikelyMobileWebView,
      userAgent: navigator.userAgent,
      className: document.documentElement.className,
    });
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
