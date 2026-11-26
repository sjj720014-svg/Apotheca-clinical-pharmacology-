import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import App from './App.tsx';
import type {BeforeInstallPromptEvent} from './hooks/usePWAInstall.ts';
import './index.css';

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    window.__apothecaDeferredInstallPrompt = event as BeforeInstallPromptEvent;
  });

  if ('serviceWorker' in navigator) {
    registerSW({
      immediate: true,
    });
  }
}

createRoot(document.getElementById('root')!).render(<App />);
