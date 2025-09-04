import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Force dark theme immediately
document.documentElement.classList.add('dark');
document.documentElement.style.colorScheme = 'dark';
document.body.style.backgroundColor = '#0f0f0f';
document.body.style.color = '#f8fafc';

createRoot(document.getElementById("root")!).render(<App />);
