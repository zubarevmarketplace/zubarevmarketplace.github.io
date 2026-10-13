import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
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

async function mount() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  detectWebViewSafeMode();
  const root = document.getElementById('root');
  if (!root) return;

  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const route = resolveRoute(pathname);
  // Loading first keeps the initial tree identical to the server tree, while
  // Vite still emits a separate client chunk for every registry loader.
  const Tool = route.kind === 'tool' ? (await route.tool.load()).default : null;
  const Content = route.kind === 'content' ? (await route.page.load()).default : null;
  const page = route.kind === 'home' ? <App />
    : route.kind === 'tools' ? <ToolsIndexPage />
    : route.kind === 'content' && Content ? <Content page={route.page} />
    : Tool ? <Tool /> : <NotFoundPage />;
  const tree = <React.StrictMode>{page}</React.StrictMode>;

  if (root.dataset.ssgRoute === pathname && root.hasChildNodes()) {
    hydrateRoot(root, tree);
  } else {
    // Dev HTML is empty; Pages' 404 fallback contains the home route instead.
    createRoot(root).render(tree);
  }
}

void mount().catch((error: unknown) => console.error('[entry-client]', error));
