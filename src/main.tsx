import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import WbCalculatorPage from './app/pages/WbCalculatorPage';
import './styles/index.css';

const calculatorPaths = new Set(['/calculator', '/tools/wb-calculator']);
const isCalculatorRoute = calculatorPaths.has(window.location.pathname);


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isCalculatorRoute ? <WbCalculatorPage /> : <App />}
  </React.StrictMode>
);
