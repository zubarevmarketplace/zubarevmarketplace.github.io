import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import WbCalculatorPage from './app/pages/WbCalculatorPage';
import './styles/index.css';

const isCalculatorRoute = window.location.pathname === '/tools/wb-calculator';

if (isCalculatorRoute) {
  document.title = 'WB калькулятор юнит-экономики';
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isCalculatorRoute ? <WbCalculatorPage /> : <App />}
  </React.StrictMode>
);
