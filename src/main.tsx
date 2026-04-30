import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import WbCalculatorPage from './app/pages/WbCalculatorPage';
import './styles/index.css';

const isCalculatorRoute = window.location.pathname === '/tools/wb-calculator';

if (isCalculatorRoute) {
  document.title = 'WB калькулятор юнит-экономики';

  let robotsMeta = document.querySelector('meta[name="robots"]');
  if (!robotsMeta) {
    robotsMeta = document.createElement('meta');
    robotsMeta.setAttribute('name', 'robots');
    document.head.appendChild(robotsMeta);
  }
  robotsMeta.setAttribute('content', 'noindex,nofollow');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    {isCalculatorRoute ? <WbCalculatorPage /> : <App />}
  </React.StrictMode>
);
);