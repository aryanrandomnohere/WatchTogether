import { createRoot } from 'react-dom/client'
//@ts-ignore
import './index.css'
// import App from './App.tsx'
import { RecoilRoot } from 'recoil'
import { BrowserRouter } from 'react-router-dom'
import Root from './Root.tsx'

createRoot(document.getElementById('root')!).render(
    <RecoilRoot>
      <BrowserRouter>
        <div className="overflow-hidden">
          <Root />
        </div>
      </BrowserRouter>
    </RecoilRoot>
)
