// src/main.tsx
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    // Quitamos StrictMode para evitar que abra la cámara dos veces en desarrollo
    <App />
)