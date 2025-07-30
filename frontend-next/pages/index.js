import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function Login({ showNotification }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showUsername, setShowUsername] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  // Verificar se o backend está disponível
  useEffect(() => {
    const checkBackend = async () => {
      try {
        // Importar o serviço de API para verificar o backend
        const apiService = (await import('../services/api')).default;
        const isAvailable = await apiService.checkBackend();
        setBackendAvailable(isAvailable);
      } catch (error) {
        console.log('Backend não disponível:', error);
        setBackendAvailable(false);
      } finally {
        setIsConnecting(false);
      }
    };
    
    checkBackend();
  }, []);

  // Verificar se já está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/services');
    }
  }, [isAuthenticated, router]);

  // Efeito para aplicar a borda neon ao redor da página
  useEffect(() => {
    document.body.classList.add('gradient-bg');
    return () => {
      document.body.classList.remove('gradient-bg');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await login(username, password);
      
      if (result.success) {
        showNotification('Login realizado com sucesso!', 'success');
        
        // Mostrar aviso de modo offline se necessário
        if (result.warning) {
          setTimeout(() => {
            showNotification(result.warning, 'info');
          }, 1500);
        }
        
        // Redirecionar para a página de serviços
        setTimeout(() => {
          router.push('/services');
        }, 1000);
      } else {
        showNotification(result.error || 'Credenciais inválidas. Por favor, tente novamente.', 'error');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      showNotification('Erro ao fazer login. Por favor, tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>AWS Services - Login</title>
      </Head>
      
      <div className="gradient-bg min-h-screen flex flex-col items-center justify-center text-white p-4">
        <div className="w-full max-w-md relative z-10">
          <div className="neon-border rounded-xl p-8 animate-fade-in">
            {/* Header com animação - Centralizado */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="cloud-container mb-4">
                <i className="fas fa-cloud text-5xl neon-blue cloud-icon"></i>
                <div className="cloud-pulse"></div>
                <div className="data-particle"></div>
                <div className="data-particle"></div>
                <div className="data-particle"></div>
              </div>
              <h1 className="text-3xl font-bold neon-blue">AWS Services</h1>
              <p className="text-slate-300 mt-2">
                Insira suas credenciais AWS
              </p>
              
              {isConnecting ? (
                <div className="bg-blue-600 bg-opacity-20 text-blue-400 text-xs py-1 px-3 rounded-full mt-2 flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
                  Verificando conexão...
                </div>
              ) : backendAvailable ? (
                <div className="bg-green-600 bg-opacity-20 text-green-400 text-xs py-1 px-3 rounded-full mt-2">
                  <i className="fas fa-check-circle mr-1"></i>
                  Sistema online
                </div>
              ) : (
                <div className="bg-red-600 bg-opacity-20 text-red-400 text-xs py-1 px-3 rounded-full mt-2">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  Backend não disponível
                </div>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-slate-300 mb-1"
                >
                  Access Key ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-user text-slate-400"></i>
                  </div>
                  <input
                    type={showUsername ? "text" : "password"}
                    id="username"
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-slate-700 bg-opacity-70 border border-slate-600 rounded-lg pl-10 pr-10 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-400"
                    placeholder="Credenciais não são armazenadas"
                  />
                  <div
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowUsername(!showUsername)}
                  >
                    <i className={`fas ${showUsername ? 'fa-eye-slash' : 'fa-eye'} text-slate-400 hover:text-slate-300`}></i>
                  </div>
                </div>
              </div>
              
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-300 mb-1"
                >
                  Secret Access Key
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-lock text-slate-400"></i>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-700 bg-opacity-70 border border-slate-600 rounded-lg pl-10 pr-10 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-400"
                    placeholder="Credenciais não são armazenadas"
                  />
                  <div
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-slate-400 hover:text-slate-300`}></i>
                  </div>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="neon-button w-full py-3 px-4 rounded-lg flex items-center justify-center click-effect min-w-[180px]"
                >
                  {isLoading ? (
                    <>
                      <div className="loading-spinner w-5 h-5 mr-2"></div>
                      <span>Logar</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt mr-2"></i>
                      <span>Logar</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          
          {/* Help Text */}
          <div className="mt-6 text-center text-sm text-slate-400 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <p>Precisa de ajuda para encontrar suas credenciais?</p>
            <a 
              href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors hover-glow"
            >
              Consulte a documentação da AWS
            </a>
          </div>
        </div>
      </div>
    </>
  );
}