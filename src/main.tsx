import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { ConfigProvider } from 'antd';
import frFR from 'antd/locale/fr_FR';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

// Configuration de dayjs en français
dayjs.locale('fr');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={frFR}>
      <App />
    </ConfigProvider>
  </React.StrictMode>,
);