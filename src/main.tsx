import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './styles/index.css';

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
