import { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [credentials, setCredentials] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Verificar se há credenciais no localStorage ao carregar
  useEffect(() => {
    const accessKey = localStorage.getItem('s3_access_key');
    const secretKey = localStorage.getItem('s3_secret_key');
    
    if (accessKey && secretKey) {
      setCredentials({ accessKey, secretKey });
      setIsAuthenticated(true);
    }
    
    setIsLoading(false);
  }, []);

  // Função para login com validação na AWS
  const login = async (accessKey, secretKey) => {
    try {
      // Verificar se o backend está disponível
      try {
        // Tentar validar as credenciais
        const result = await apiService.validateCredentials(accessKey, secretKey);
        
        if (result.success) {
          // Armazenar credenciais no localStorage apenas se forem válidas
          localStorage.setItem('s3_access_key', accessKey);
          localStorage.setItem('s3_secret_key', secretKey);
          
          // Atualizar o estado
          setCredentials({ accessKey, secretKey });
          setIsAuthenticated(true);
          setIsOfflineMode(false);
          
          return { success: true };
        } else {
          return { success: false, error: result.error || 'Credenciais inválidas' };
        }
      } catch (apiError) {
        console.error('Erro na API:', apiError);
        
        // Se o backend não estiver disponível, usar validação local temporária
        console.log('Backend não disponível, usando validação local temporária');
        setIsOfflineMode(true);
        
        // Verificação básica para simular validação
        if (!accessKey || accessKey.length < 5 || !secretKey || secretKey.length < 5) {
          return { 
            success: false, 
            error: 'Credenciais inválidas. Access Key e Secret Key devem ter pelo menos 5 caracteres.' 
          };
        }
        
        // Armazenar credenciais no localStorage
        localStorage.setItem('s3_access_key', accessKey);
        localStorage.setItem('s3_secret_key', secretKey);
        
        // Atualizar o estado
        setCredentials({ accessKey, secretKey });
        setIsAuthenticated(true);
        
        return { 
          success: true, 
          warning: 'Backend não disponível. Usando modo offline.' 
        };
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return { 
        success: false, 
        error: 'Erro ao processar o login. Por favor, tente novamente.' 
      };
    }
  };

  // Função para logout
  const logout = () => {
    // Remover credenciais do localStorage
    localStorage.removeItem('s3_access_key');
    localStorage.removeItem('s3_secret_key');
    
    // Atualizar o estado
    setCredentials(null);
    setIsAuthenticated(false);
    setIsOfflineMode(false);
  };

  return (
    <AuthContext.Provider value={{ 
      credentials, 
      isAuthenticated, 
      isLoading, 
      isOfflineMode,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}