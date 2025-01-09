import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.tsx'
import { RecoilRoot } from 'recoil'
import Root from './Root.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RecoilRoot>
      <div className="overflow-hidden">
        <Root />
      </div>
    </RecoilRoot>
  </StrictMode>
)
