import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

export default function EC2() {
    const router = useRouter();
    const { credentials, isAuthenticated, isLoading, logout } = useAuth();
    const [instances, setInstances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});

    // Verificar autenticação
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/');
        }
    }, [isLoading, isAuthenticated, router]);

    // Carregar instâncias
    useEffect(() => {
        const loadInstances = async () => {
            if (isAuthenticated && credentials?.accessKey && credentials?.secretKey) {
                try {
                    const response = await apiService.getEC2Instances(credentials.accessKey, credentials.secretKey);
                    if (response.success) {
                        setInstances(response.instances || []);
                        if (response.realCount > 0) {
                            console.log(`Encontradas ${response.realCount} instâncias reais`);
                        }
                    }
                } catch (error) {
                    console.error('Erro ao carregar instâncias:', error);
                }
            }
            setLoading(false);
        };
        
        loadInstances();
    }, [isAuthenticated, credentials]);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const handleInstanceAction = async (instanceId, action) => {
        setActionLoading(prev => ({ ...prev, [instanceId]: action }));
        
        try {
            const response = await fetch('http://localhost:8000/api/ec2/manage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ instanceId, action })
            });
            const result = await response.json();
            
            // Simular mudança de estado
            setInstances(prev => prev.map(instance => 
                instance.InstanceId === instanceId 
                    ? { ...instance, State: { Name: action === 'start' ? 'running' : 'stopped' } }
                    : instance
            ));
        } catch (error) {
            console.error('Erro na ação:', error);
        }
        
        setActionLoading(prev => ({ ...prev, [instanceId]: null }));
    };

    if (isLoading || loading) {
        return (
            <div className="gradient-bg min-h-screen flex items-center justify-center">
                <div className="loading-spinner"></div>
                <p className="mt-4 text-lg text-white">Carregando...</p>
            </div>
        );
    }

    const getStateColor = (state) => {
        const colors = {
            running: 'text-green-400',
            stopped: 'text-red-400',
            pending: 'text-yellow-400',
            stopping: 'text-orange-400',
            terminated: 'text-gray-400'
        };
        return colors[state] || 'text-gray-400';
    };

    const getStateIcon = (state) => {
        const icons = {
            running: 'fa-play-circle',
            stopped: 'fa-stop-circle',
            pending: 'fa-clock',
            stopping: 'fa-pause-circle',
            terminated: 'fa-times-circle'
        };
        return icons[state] || 'fa-question-circle';
    };

    return (
        <div className="gradient-bg min-h-screen text-white p-4">
            <Head>
                <title>Amazon EC2 - Gerenciamento de Instâncias</title>
            </Head>
            
            {/* Header com Navbar */}
            <div className="mb-8 flex justify-between items-center">
                <div className="flex items-center">
                    <div className="cloud-container mr-4">
                        <i className="fas fa-server text-5xl neon-green cloud-icon"></i>
                        <div className="cloud-pulse"></div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold neon-green">Amazon EC2</h1>
                        <p className="text-slate-300 mt-1">Gerenciamento de Instâncias</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <Link href="/services">
                        <span className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 cursor-pointer">
                            <i className="fas fa-arrow-left mr-2"></i>Voltar
                        </span>
                    </Link>
                    <button 
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                    >
                        <i className="fas fa-sign-out-alt mr-2"></i>Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto">
                {/* Instances List */}
                <div className="neon-border rounded-xl p-8">
                    <h2 className="text-2xl font-bold neon-green mb-6">
                        <i className="fas fa-list mr-3"></i>Instâncias EC2
                    </h2>
                    
                    <div className="space-y-4">
                        {instances.map((instance) => (
                            <div key={instance.InstanceId} className="bg-slate-800/50 rounded-lg p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                                    {/* Instance Info */}
                                    <div className="lg:col-span-2">
                                        <div className="flex items-center mb-2">
                                            <h3 className="text-lg font-bold text-white">
                                                {instance.Tags?.find(tag => tag.Key === 'Name')?.Value || 'Sem nome'}
                                            </h3>
                                            {instance.isDemo && (
                                                <span className="ml-2 px-2 py-1 bg-blue-600 text-xs rounded">
                                                    DEMO
                                                </span>
                                            )}
                                            {!instance.isDemo && (
                                                <span className="ml-2 px-2 py-1 bg-green-600 text-xs rounded">
                                                    REAL
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-300 text-sm">ID: {instance.InstanceId}</p>
                                        <p className="text-slate-300 text-sm">Tipo: {instance.InstanceType}</p>
                                        <p className="text-slate-300 text-sm">IP Público: {instance.PublicIpAddress || 'N/A'}</p>
                                        <p className="text-slate-300 text-sm">IP Privado: {instance.PrivateIpAddress}</p>
                                    </div>
                                    
                                    {/* Status */}
                                    <div className="text-center">
                                        <div className={`${getStateColor(instance.State.Name)} mb-2`}>
                                            <i className={`fas ${getStateIcon(instance.State.Name)} text-2xl`}></i>
                                        </div>
                                        <p className={`font-bold ${getStateColor(instance.State.Name)}`}>
                                            {instance.State.Name.toUpperCase()}
                                        </p>
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="flex flex-col space-y-2">
                                        {instance.isDemo ? (
                                            // Ações para instâncias demo
                                            instance.State.Name === 'running' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleInstanceAction(instance.InstanceId, 'stop')}
                                                        disabled={actionLoading[instance.InstanceId]}
                                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm disabled:opacity-50"
                                                    >
                                                        {actionLoading[instance.InstanceId] === 'stop' ? (
                                                            <><i className="fas fa-spinner fa-spin mr-1"></i>Parando</>
                                                        ) : (
                                                            <><i className="fas fa-stop mr-1"></i>Parar</>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleInstanceAction(instance.InstanceId, 'restart')}
                                                        disabled={actionLoading[instance.InstanceId]}
                                                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm disabled:opacity-50"
                                                    >
                                                        {actionLoading[instance.InstanceId] === 'restart' ? (
                                                            <><i className="fas fa-spinner fa-spin mr-1"></i>Reiniciando</>
                                                        ) : (
                                                            <><i className="fas fa-redo mr-1"></i>Reiniciar</>
                                                        )}
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => handleInstanceAction(instance.InstanceId, 'start')}
                                                    disabled={actionLoading[instance.InstanceId]}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm disabled:opacity-50"
                                                >
                                                    {actionLoading[instance.InstanceId] === 'start' ? (
                                                        <><i className="fas fa-spinner fa-spin mr-1"></i>Iniciando</>
                                                    ) : (
                                                        <><i className="fas fa-play mr-1"></i>Iniciar</>
                                                    )}
                                                </button>
                                            )
                                        ) : (
                                            // Instâncias reais - apenas visualização
                                            <div className="text-center text-slate-400 text-sm">
                                                <i className="fas fa-eye mr-1"></i>
                                                Apenas visualização
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Demo Notice */}
                    <div className="mt-6 bg-blue-900/30 border border-blue-500 rounded-lg p-4">
                        <p className="text-blue-400">
                            <i className="fas fa-info-circle mr-2"></i>
                            Demonstração EC2 - Instâncias simuladas para fins de teste
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}