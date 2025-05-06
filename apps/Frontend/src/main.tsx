import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// import App from './App.tsx'
import { RecoilRoot } from 'recoil';

import Root from './Root.tsx';
//@ts-ignore
import './index.css';

createRoot(document.getElementById('root')!).render(
  <RecoilRoot>
    <BrowserRouter>
      <div className="overflow-hidden bg-slate-950">
        <Root />
      </div>
    </BrowserRouter>
  </RecoilRoot>
);
