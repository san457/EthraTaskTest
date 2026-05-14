// import { StrictMode } from 'react' 
import { createRoot } from 'react-dom/client'
import './assets/globals.css'
import './assets/style.css'
import "bootstrap-icons/font/bootstrap-icons.css";
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './context/context.tsx';

createRoot(document.getElementById('root')!).render(
  <AppProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  </AppProvider>
)
