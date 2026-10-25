import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { AppProvider } from './context/AppContext.jsx'
import { initTilt3D } from './utils/tilt3d.js'
import { initDepth4D } from './utils/depth4d.js'

initTilt3D()
initDepth4D()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
)
