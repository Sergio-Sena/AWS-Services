import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

export default function Calculator() {
    const router = useRouter();
    const { credentials, isAuthenticated, isLoading, logout } = useAuth();
    const [billingData, setBillingData] = useState(null);
    const [exchangeRate, setExchangeRate] = useState(null);
    const [loading, setLoading] = useState(true);

    // Verificar autenticação
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/');
        }
    }, [isLoading, isAuthenticated, router]);

    // Carregar dados de faturamento
    useEffect(() => {
        const loadBillingData = async () => {
            if (isAuthenticated && credentials?.accessKey && credentials?.secretKey) {
                try {
                    // Carregar informações de faturamento
                    const billingResult = await apiService.getBillingInfo(credentials.accessKey, credentials.secretKey);
                    
                    // Carregar cotação
                    const exchangeResult = await apiService.getExchangeRate();
                    
                    if (billingResult.success) {
                        setBillingData(billingResult.billing);
                    }
                    if (exchangeResult.success) {
                        setExchangeRate(exchangeResult.exchangeRate);
                    }
                } catch (error) {
                    console.error('Erro ao carregar dados:', error);
                }
            }
            setLoading(false);
        };
        
        loadBillingData();
    }, [isAuthenticated, credentials]);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    if (isLoading || loading) {
        return (
            <div className="gradient-bg min-h-screen flex items-center justify-center">
                <div className="loading-spinner"></div>
                <p className="mt-4 text-lg text-white">Carregando...</p>
            </div>
        );
    }

    const formatCurrency = (amount, currency = 'BRL') => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };

    const formatUSD = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    return (
        <div className="gradient-bg min-h-screen text-white p-4">
            <Head>
                <title>Calculadora AWS - Custos em Real</title>
            </Head>
            
            {/* Header com Navbar */}
            <div className="mb-8 flex justify-between items-center">
                <div className="flex items-center">
                    <div className="cloud-container mr-4">
                        <i className="fas fa-calculator text-5xl neon-blue cloud-icon"></i>
                        <div className="cloud-pulse"></div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold neon-blue">Calculadora AWS</h1>
                        <p className="text-slate-300 mt-1">Custos em Real Brasileiro</p>
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
            <main className="max-w-6xl mx-auto space-y-8">
                {/* Exchange Rate */}
                {exchangeRate && (
                    <div className="neon-border rounded-xl p-6">
                        <h2 className="text-xl font-bold neon-blue mb-4">
                            <i className="fas fa-exchange-alt mr-3"></i>Cotação Atual
                        </h2>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-green-400">
                                    1 USD = R$ {exchangeRate.rate.toFixed(2)}
                                </p>
                                <p className="text-slate-400 text-sm">
                                    Atualizado em: {new Date(exchangeRate.lastUpdate).toLocaleString('pt-BR')}
                                </p>
                            </div>
                            <div className="text-slate-400 text-sm">
                                {exchangeRate.source}
                            </div>
                        </div>
                    </div>
                )}

                {/* Billing Summary */}
                {billingData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Last Bill */}
                        <div className="neon-border rounded-xl p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-bold neon-green">
                                    <i className="fas fa-file-invoice-dollar mr-3"></i>Última Fatura
                                </h2>
                                {billingData?.lastBill?.isDemo ? (
                                    <span className="px-2 py-1 bg-blue-600 text-xs rounded">
                                        DEMO
                                    </span>
                                ) : (
                                    <span className="px-2 py-1 bg-green-600 text-xs rounded">
                                        REAL
                                    </span>
                                )}
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-slate-300">Período: {billingData.lastBill.period}</p>
                                    <div className="mt-2">
                                        <p className="text-2xl font-bold text-green-400">
                                            {formatCurrency(billingData.lastBill.amountBRL)}
                                        </p>
                                        <p className="text-slate-400 text-sm">
                                            {formatUSD(billingData.lastBill.amount)}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-slate-300">Detalhamento por Serviço:</h3>
                                    {billingData.lastBill.services.map((service, index) => (
                                        <div key={index} className="flex justify-between items-center py-1">
                                            <span className="text-slate-300 text-sm">{service.name}</span>
                                            <div className="text-right">
                                                <span className="text-green-400 font-semibold">
                                                    {formatCurrency(service.costBRL)}
                                                </span>
                                                <span className="text-slate-500 text-xs ml-2">
                                                    ({formatUSD(service.cost)})
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Current Bill */}
                        <div className="neon-border rounded-xl p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-bold neon-yellow">
                                    <i className="fas fa-clock mr-3"></i>Fatura Atual
                                </h2>
                                {billingData?.currentBill?.isDemo ? (
                                    <span className="px-2 py-1 bg-blue-600 text-xs rounded">
                                        DEMO
                                    </span>
                                ) : (
                                    <span className="px-2 py-1 bg-green-600 text-xs rounded">
                                        REAL
                                    </span>
                                )}
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-slate-300">Período: {billingData.currentBill.period}</p>
                                    <div className="mt-2">
                                        <p className="text-2xl font-bold text-yellow-400">
                                            {formatCurrency(billingData.currentBill.amountBRL)}
                                        </p>
                                        <p className="text-slate-400 text-sm">
                                            {formatUSD(billingData.currentBill.amount)}
                                        </p>
                                    </div>
                                    <p className="text-slate-400 text-sm mt-1">
                                        Próxima fatura: {new Date(billingData.currentBill.nextBillDate).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                                
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-slate-300">Detalhamento por Serviço:</h3>
                                    {billingData.currentBill.services.map((service, index) => (
                                        <div key={index} className="flex justify-between items-center py-1">
                                            <span className="text-slate-300 text-sm">{service.name}</span>
                                            <div className="text-right">
                                                <span className="text-yellow-400 font-semibold">
                                                    {formatCurrency(service.costBRL)}
                                                </span>
                                                <span className="text-slate-500 text-xs ml-2">
                                                    ({formatUSD(service.cost)})
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Notice */}
                <div className={`${billingData?.isDemo ? 'bg-blue-900/30 border-blue-500' : 'bg-green-900/30 border-green-500'} border rounded-lg p-4`}>
                    <p className={`${billingData?.isDemo ? 'text-blue-400' : 'text-green-400'}`}>
                        <i className="fas fa-info-circle mr-2"></i>
                        {billingData?.isDemo ? 
                            'Demonstração - Dados simulados. Sem acesso ao AWS Cost Explorer.' :
                            'Dados reais obtidos do AWS Cost Explorer da sua conta.'}
                    </p>
                </div>
            </main>
        </div>
    );
}