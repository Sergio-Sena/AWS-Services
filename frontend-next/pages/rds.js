import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

export default function RDS({ showNotification }) {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [realCount, setRealCount] = useState(0);
  const [demoCount, setDemoCount] = useState(0);
  const [operationLoading, setOperationLoading] = useState({});
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadInstances();
    }
  }, [isAuthenticated]);

  const loadInstances = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/rds/instances');
      
      if (response.success) {
        setInstances(response.instances);
        setRealCount(response.realCount);
        setDemoCount(response.demoCount);
        showNotification(response.message, 'success');
      } else {
        showNotification('Erro ao carregar instâncias RDS', 'error');
      }
    } catch (error) {
      console.error('Erro ao carregar instâncias:', error);
      showNotification('Erro ao conectar com o servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOperation = async (instanceId, action) => {
    try {
      setOperationLoading(prev => ({ ...prev, [instanceId]: action }));
      
      const response = await apiService.post('/api/rds/operation', {
        instanceId,
        action
      });

      if (response.success) {
        showNotification(response.message, 'success');
        setTimeout(() => loadInstances(), 1000);
      } else {
        showNotification(response.error || 'Erro na operação', 'error');
      }
    } catch (error) {
      console.error('Erro na operação:', error);
      showNotification('Erro ao executar operação', 'error');
    } finally {
      setOperationLoading(prev => ({ ...prev, [instanceId]: null }));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'available': 'text-green-400',
      'stopped': 'text-red-400',
      'starting': 'text-yellow-400',
      'stopping': 'text-orange-400',
      'rebooting': 'text-blue-400'
    };
    return colors[status] || 'text-gray-400';
  };

  const getEngineIcon = (engine) => {
    const icons = {
      'mysql': 'fas fa-database',
      'postgres': 'fas fa-elephant',
      'oracle': 'fas fa-server',
      'sqlserver': 'fas fa-windows',
      'mariadb': 'fas fa-database'
    };
    return icons[engine] || 'fas fa-database';
  };

  if (isLoading || loading) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
        <p className="mt-4 text-lg text-white">Carregando instâncias RDS...</p>
      </div>
    );
  }

  return (
    <div className="gradient-bg min-h-screen text-white p-4">
      <Head>
        <title>Amazon RDS - AWS Services</title>
      </Head>

      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/services">
            <span className="text-blue-400 hover:text-blue-300 mr-4 cursor-pointer">
              <i className="fas fa-arrow-left text-xl"></i>
            </span>
          </Link>
          <div className="flex items-center">
            <i className="fas fa-database text-5xl neon-red mr-4"></i>
            <div>
              <h1 className="text-3xl font-bold neon-red">Amazon RDS</h1>
              <p className="text-slate-300 mt-1">Gerenciamento de bancos de dados</p>
            </div>
          </div>
        </div>
        <button 
          onClick={loadInstances}
          className="neon-button py-2 px-4 rounded-lg transition duration-200"
          disabled={loading}
        >
          <i className="fas fa-sync-alt mr-2"></i>
          Atualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="neon-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300">Total de Instâncias</p>
              <p className="text-3xl font-bold neon-red">{instances.length}</p>
            </div>
            <i className="fas fa-database text-3xl neon-red"></i>
          </div>
        </div>
        <div className="neon-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300">Instâncias Reais</p>
              <p className="text-3xl font-bold text-green-400">{realCount}</p>
            </div>
            <i className="fas fa-check-circle text-3xl text-green-400"></i>
          </div>
        </div>
        <div className="neon-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300">Instâncias Demo</p>
              <p className="text-3xl font-bold text-blue-400">{demoCount}</p>
            </div>
            <i className="fas fa-flask text-3xl text-blue-400"></i>
          </div>
        </div>
      </div>

      {/* Instances List */}
      <div className="neon-border rounded-xl p-6">
        <h2 className="text-2xl font-bold neon-red mb-6">Instâncias RDS</h2>
        
        {instances.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-database text-6xl text-slate-600 mb-4"></i>
            <p className="text-slate-400 text-lg">Nenhuma instância RDS encontrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {instances.map((instance) => (
              <div key={instance.DBInstanceIdentifier} className="bg-slate-800 bg-opacity-50 rounded-lg p-6 border border-slate-700">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <i className={`${getEngineIcon(instance.Engine)} text-2xl neon-red mr-3`}></i>
                    <div>
                      <h3 className="text-xl font-bold text-white">{instance.DBInstanceIdentifier}</h3>
                      <div className="flex items-center mt-1">
                        <span className={`${getStatusColor(instance.DBInstanceStatus)} font-semibold mr-3`}>
                          {instance.DBInstanceStatus.toUpperCase()}
                        </span>
                        {instance.isDemo ? (
                          <span className="bg-blue-600 bg-opacity-20 text-blue-400 text-xs py-1 px-2 rounded-full">
                            DEMO
                          </span>
                        ) : (
                          <span className="bg-green-600 bg-opacity-20 text-green-400 text-xs py-1 px-2 rounded-full">
                            REAL
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {instance.isDemo && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOperation(instance.DBInstanceIdentifier, 'start')}
                        disabled={operationLoading[instance.DBInstanceIdentifier]}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition duration-200"
                      >
                        {operationLoading[instance.DBInstanceIdentifier] === 'start' ? (
                          <div className="loading-spinner w-4 h-4"></div>
                        ) : (
                          <i className="fas fa-play"></i>
                        )}
                      </button>
                      <button
                        onClick={() => handleOperation(instance.DBInstanceIdentifier, 'stop')}
                        disabled={operationLoading[instance.DBInstanceIdentifier]}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition duration-200"
                      >
                        {operationLoading[instance.DBInstanceIdentifier] === 'stop' ? (
                          <div className="loading-spinner w-4 h-4"></div>
                        ) : (
                          <i className="fas fa-stop"></i>
                        )}
                      </button>
                      <button
                        onClick={() => handleOperation(instance.DBInstanceIdentifier, 'backup')}
                        disabled={operationLoading[instance.DBInstanceIdentifier]}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition duration-200"
                      >
                        {operationLoading[instance.DBInstanceIdentifier] === 'backup' ? (
                          <div className="loading-spinner w-4 h-4"></div>
                        ) : (
                          <i className="fas fa-save"></i>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Engine</p>
                    <p className="text-white font-semibold">{instance.Engine} {instance.EngineVersion}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Classe</p>
                    <p className="text-white font-semibold">{instance.DBInstanceClass}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Storage</p>
                    <p className="text-white font-semibold">{instance.AllocatedStorage} GB ({instance.StorageType})</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Multi-AZ</p>
                    <p className="text-white font-semibold">{instance.MultiAZ ? 'Sim' : 'Não'}</p>
                  </div>
                  {instance.Endpoint && (
                    <div className="md:col-span-2">
                      <p className="text-slate-400">Endpoint</p>
                      <p className="text-white font-mono text-xs">{instance.Endpoint.Address}:{instance.Endpoint.Port}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-slate-400">Criado em</p>
                    <p className="text-white font-semibold">
                      {new Date(instance.InstanceCreateTime).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}