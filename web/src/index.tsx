import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './Components/Internationalization/i18n';
import { Loading } from './Components/Loading/loading';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Suspense fallback={<Loading />}>
      <App />
    </Suspense>
  </React.StrictMode>
);
