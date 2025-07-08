import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import { Toaster } from 'react-hot-toast';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AuthProvider>
        <SidebarProvider>
          <App />
          <Toaster position="top-center" reverseOrder={false} />
        </SidebarProvider>
      </AuthProvider>
    </React.StrictMode>
  );
}
