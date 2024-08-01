import React, { Suspense, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './Components/Internationalization/i18n';
import { Loading } from './Components/Loading/loading';

// Loading Login and Landing Page Images at Initial Loading

import loginImage from './Assets/Images/tran.png';
import landingImage from './Assets/Images/factory.png';

const Root = () => {
  const [isImagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    const image1 = new Image();
    const image2 = new Image();

    let imagesLoaded = 0;

    const handleLoad = () => {
      imagesLoaded += 1;
      if (imagesLoaded === 2) {
        setImagesLoaded(true);
      }
    };

    image1.src = loginImage;
    image2.src = landingImage;

    image1.onload = handleLoad;
    image2.onload = handleLoad;

    return () => {
      image1.onload = null;
      image2.onload = null;
    };
  }, []);

  return (
    <React.StrictMode>
      <Suspense fallback={<Loading />}>{isImagesLoaded ? <App /> : <Loading />}</Suspense>
    </React.StrictMode>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<Root />);
