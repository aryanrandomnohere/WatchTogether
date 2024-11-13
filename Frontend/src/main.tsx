import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { RecoilRoot } from 'recoil'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RecoilRoot>
      <div className='bg-gray-900 w-full h-screen'>
        <App />
      </div>
    </RecoilRoot>
  </StrictMode>
)
