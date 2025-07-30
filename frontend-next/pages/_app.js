import '../styles/globals.css';
import Head from 'next/head';
import { useState } from 'react';
import { AuthProvider } from '../context/AuthContext';

export default function App({ Component, pageProps }) {
  const [notifications, setNotifications] = useState([]);
  
  const showNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Auto-remover após 3 segundos (tempo reduzido)
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, 3000);
    
    return id;
  };
  
  const hideNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  
  // Adicionar showNotification ao contexto global
  pageProps.showNotification = showNotification;
  
  return (
    <AuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <Component {...pageProps} />
      
      {/* Renderizar notificações */}
      <div id="notification-container">
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`notification ${notification.type} show`}
          >
            <div className="notification-icon">
              <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            </div>
            <div className="notification-content">
              <p>{notification.message}</p>
            </div>
            <button 
              className="notification-close ml-4"
              onClick={() => hideNotification(notification.id)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        ))}
      </div>
    </AuthProvider>
  );
}