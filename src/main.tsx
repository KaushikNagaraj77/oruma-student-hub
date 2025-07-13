import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import Config from './utils/config'

// Log configuration in development
Config.logConfig();

createRoot(document.getElementById("root")!).render(<App />);
