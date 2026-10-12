import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import ToolsIndexPage from './app/pages/ToolsIndexPage';
import NotFoundPage from './app/pages/NotFoundPage';
import { resolveRoute } from './app/tools/routes';
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

  const isMobileDevice =
    /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent) ||
    window.matchMedia('(max-width: 768px)').matches;

  const isTelegramWebView = ua.includes('telegram') || Boolean(win.Telegram?.WebApp);

  const isAndroidWebView =
    /android/.test(ua) &&
    (ua.includes('; wv') || ua.includes(' wv') || ua.includes('version/4.0') || ua.includes('version/'));

  const isIOSWebView = /iphone|ipad|ipod/.test(ua) && !ua.includes('safari');
  const isLikelyInAppBrowser = /instagram|fbav|fb_iab|vk|okapp|whatsapp|telegram/.test(ua);

  const isLikelyMobileWebView =
    isMobileDevice && (isAndroidWebView || isIOSWebView || isLikelyInAppBrowser);

  const isWebViewSafe = forceWebViewSafe || isTelegramWebView || isLikelyMobileWebView || isMobileDevice;

  if (isWebViewSafe) {
    document.documentElement.classList.add('webview-safe');
    document.documentElement.dataset.webviewSafe = 'true';
  }

  if (import.meta.env.DEV) {
    console.info('[webview-safe]', {
      enabled: isWebViewSafe,
      forced: forceWebViewSafe,
      mobile: isMobileDevice,
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

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  detectWebViewSafeMode();

  const route = resolveRoute(window.location.pathname);
  const Tool = route.kind === 'tool' ? React.lazy(route.tool.load) : null;
  const page = route.kind === 'home' ? <App />
    : route.kind === 'tools' ? <ToolsIndexPage />
    : Tool ? <Tool /> : <NotFoundPage />;
  const root = document.getElementById('root');

  if (root) {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <Suspense fallback={<div className="min-h-screen bg-[#070B10]" />}>
          {page}
        </Suspense>
      </React.StrictMode>,
    );
  }
}
