import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

export default function CloudFront() {
    const router = useRouter();
    const { credentials, isAuthenticated, isLoading, logout } = useAuth();
    const [distributions, setDistributions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [operationLoading, setOperationLoading] = useState({});
    const [operationResult, setOperationResult] = useState({});

    // Verificar autenticação
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/');
        }
    }, [isLoading, isAuthenticated, router]);

    // Carregar distribuições
    useEffect(() => {
        const loadDistributions = async () => {
            if (isAuthenticated && credentials?.accessKey && credentials?.secretKey) {
                try {
                    const response = await apiService.getCloudFrontDistributions(credentials.accessKey, credentials.secretKey);
                    if (response.success) {
                        setDistributions(response.distributions || []);
                        console.log(`Encontradas ${response.realCount} distribuições reais e ${response.demoCount} demos`);
                    }
                } catch (error) {
                    console.error('Erro ao carregar distribuições:', error);
                }
            }
            setLoading(false);
        };
        
        loadDistributions();
    }, [isAuthenticated, credentials]);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const handleDistributionOperation = async (distributionId, operation) => {
        setOperationLoading(prev => ({ ...prev, [distributionId]: operation }));
        
        try {
            const response = await fetch('http://localhost:8000/api/cloudfront/operation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ distributionId, operation })
            });
            const result = await response.json();
            
            if (result.success) {
                setOperationResult(prev => ({ ...prev, [distributionId]: result.result }));
                setTimeout(() => {
                    setOperationResult(prev => ({ ...prev, [distributionId]: null }));
                }, 5000);
            }
        } catch (error) {
            console.error('Erro na operação:', error);
        }
        
        setOperationLoading(prev => ({ ...prev, [distributionId]: null }));
    };

    if (isLoading || loading) {
        return (
            <div className="gradient-bg min-h-screen flex items-center justify-center">
                <div className="loading-spinner"></div>
                <p className="mt-4 text-lg text-white">Carregando...</p>
            </div>
        );
    }

    const getStatusColor = (status) => {
        const colors = {
            'Deployed': 'text-green-400',
            'InProgress': 'text-yellow-400',
            'Disabled': 'text-red-400'
        };
        return colors[status] || 'text-gray-400';
    };

    return (
        <div className="gradient-bg min-h-screen text-white p-4">
            <Head>
                <title>Amazon CloudFront - Distribuições CDN</title>
            </Head>
            
            {/* Header com Navbar */}
            <div className="mb-8 flex justify-between items-center">
                <div className="flex items-center">
                    <div className="cloud-container mr-4">
                        <i className="fas fa-globe text-5xl neon-purple cloud-icon"></i>
                        <div className="cloud-pulse"></div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold neon-purple">Amazon CloudFront</h1>
                        <p className="text-slate-300 mt-1">Distribuições CDN e Domínios</p>
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
                {/* Distributions List */}
                <div className="neon-border rounded-xl p-8">
                    <h2 className="text-2xl font-bold neon-purple mb-6">
                        <i className="fas fa-cloud mr-3"></i>Distribuições CloudFront
                    </h2>
                    
                    <div className="space-y-6">
                        {distributions.map((dist) => (
                            <div key={dist.Id} className="bg-slate-800/50 rounded-lg p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Distribution Info */}
                                    <div className="lg:col-span-2">
                                        <div className="flex items-center mb-3">
                                            <h3 className="text-lg font-bold text-white">
                                                {dist.Comment || 'Sem descrição'}
                                            </h3>
                                            {dist.isDemo ? (
                                                <span className="ml-2 px-2 py-1 bg-blue-600 text-xs rounded">
                                                    DEMO
                                                </span>
                                            ) : (
                                                <span className="ml-2 px-2 py-1 bg-green-600 text-xs rounded">
                                                    REAL
                                                </span>
                                            )}
                                            <span className={`ml-2 px-2 py-1 text-xs rounded ${getStatusColor(dist.Status)} bg-slate-700`}>
                                                {dist.Status}
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <p className="text-slate-300 text-sm">
                                                <strong>ID:</strong> {dist.Id}
                                            </p>
                                            <p className="text-slate-300 text-sm">
                                                <strong>CloudFront Domain:</strong> {dist.DomainName}
                                            </p>
                                            <p className="text-slate-300 text-sm">
                                                <strong>Origin:</strong> {dist.Origins?.Items?.[0]?.DomainName || 'N/A'}
                                            </p>
                                            
                                            {/* Custom Domains */}
                                            {dist.Aliases?.Items && dist.Aliases.Items.length > 0 && (
                                                <div className="mt-3">
                                                    <p className="text-purple-400 font-semibold mb-2">
                                                        <i className="fas fa-link mr-2"></i>Domínios Personalizados:
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {dist.Aliases.Items.map((domain, index) => (
                                                            <span 
                                                                key={index}
                                                                className="px-3 py-1 bg-purple-900/30 border border-purple-500 rounded-full text-sm text-purple-300"
                                                            >
                                                                <i className="fas fa-globe mr-1"></i>
                                                                {domain}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="flex flex-col space-y-3">
                                        {dist.isDemo ? (
                                            <>
                                                <button
                                                    onClick={() => handleDistributionOperation(dist.Id, 'invalidate')}
                                                    disabled={operationLoading[dist.Id]}
                                                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
                                                >
                                                    {operationLoading[dist.Id] === 'invalidate' ? (
                                                        <><i className="fas fa-spinner fa-spin mr-1"></i>Invalidando</>
                                                    ) : (
                                                        <><i className="fas fa-sync mr-1"></i>Invalidar Cache</>
                                                    )}
                                                </button>
                                                
                                                {dist.Enabled ? (
                                                    <button
                                                        onClick={() => handleDistributionOperation(dist.Id, 'disable')}
                                                        disabled={operationLoading[dist.Id]}
                                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
                                                    >
                                                        {operationLoading[dist.Id] === 'disable' ? (
                                                            <><i className="fas fa-spinner fa-spin mr-1"></i>Desabilitando</>
                                                        ) : (
                                                            <><i className="fas fa-pause mr-1"></i>Desabilitar</>
                                                        )}
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleDistributionOperation(dist.Id, 'enable')}
                                                        disabled={operationLoading[dist.Id]}
                                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
                                                    >
                                                        {operationLoading[dist.Id] === 'enable' ? (
                                                            <><i className="fas fa-spinner fa-spin mr-1"></i>Habilitando</>
                                                        ) : (
                                                            <><i className="fas fa-play mr-1"></i>Habilitar</>
                                                        )}
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center text-slate-400 text-sm">
                                                <i className="fas fa-eye mr-1"></i>
                                                Apenas visualização
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Operation Result */}
                                {operationResult[dist.Id] && (
                                    <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-purple-500">
                                        <h4 className="text-purple-400 font-bold mb-2">
                                            <i className="fas fa-check-circle mr-2"></i>Resultado da Operação
                                        </h4>
                                        <p className="text-slate-300">{operationResult[dist.Id].message}</p>
                                        {operationResult[dist.Id].invalidationId && (
                                            <p className="text-slate-400 text-sm mt-1">
                                                ID da Invalidação: {operationResult[dist.Id].invalidationId}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    {/* Demo Notice */}
                    <div className="mt-6 bg-blue-900/30 border border-blue-500 rounded-lg p-4">
                        <p className="text-blue-400">
                            <i className="fas fa-info-circle mr-2"></i>
                            Demonstração CloudFront - Operações reais disponíveis apenas para visualização
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}