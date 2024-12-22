import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.tsx'
import { RecoilRoot } from 'recoil'
import Root from './Root.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RecoilRoot>
      <div className='bg-gray-900 w-100 h-screen'>
        <Root />
      </div>
    </RecoilRoot>
  </StrictMode>
)
