import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

export default function Lambda() {
    const router = useRouter();
    const { credentials, isAuthenticated, isLoading, logout } = useAuth();
    const [buckets, setBuckets] = useState([]);
    const [selectedBucket, setSelectedBucket] = useState('');
    const [selectedModule, setSelectedModule] = useState('sharp');
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingBuckets, setLoadingBuckets] = useState(true);

    const compressionModules = [
        { id: 'sharp', name: 'Sharp', description: 'Rápido e eficiente (Recomendado)' },
        { id: 'imagemagick', name: 'ImageMagick', description: 'Versátil e poderoso' },
        { id: 'jimp', name: 'Jimp', description: 'JavaScript puro' },
        { id: 'canvas', name: 'Canvas API', description: 'Nativo do navegador' }
    ];

    // Verificar autenticação
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/');
        }
    }, [isLoading, isAuthenticated, router]);

    // Carregar buckets
    useEffect(() => {
        const loadBuckets = async () => {
            if (credentials?.accessKey && credentials?.secretKey) {
                try {
                    const response = await apiService.listBuckets(
                        credentials.accessKey,
                        credentials.secretKey
                    );
                    setBuckets(response.buckets || []);
                } catch (error) {
                    console.error('Erro ao carregar buckets:', error);
                }
            }
            setLoadingBuckets(false);
        };
        
        if (isAuthenticated && credentials) {
            loadBuckets();
        } else {
            setLoadingBuckets(false);
        }
    }, [credentials, isAuthenticated]);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    if (isLoading || loadingBuckets) {
        return (
            <div className="gradient-bg min-h-screen flex items-center justify-center">
                <div className="loading-spinner"></div>
                <p className="mt-4 text-lg text-white">Carregando...</p>
            </div>
        );
    }

    const handleCompress = async () => {
        if (!file || !selectedBucket) return;
        
        setLoading(true);
        try {
            const compressRes = await fetch('http://localhost:8000/api/compress-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bucket: selectedBucket,
                    key: file.name,
                    module: selectedModule
                })
            });
            const compressData = await compressRes.json();
            
            setResult(compressData);
        } catch (error) {
            console.error('Erro:', error);
            setResult({ error: 'Erro na compactação' });
        }
        setLoading(false);
    };

    return (
        <div className="gradient-bg min-h-screen text-white p-4">
            <Head>
                <title>AWS Lambda - Compactação de Imagens</title>
            </Head>
            
            {/* Header com Navbar */}
            <div className="mb-8 flex justify-between items-center">
                <div className="flex items-center">
                    <div className="cloud-container mr-4">
                        <i className="fas fa-code text-5xl neon-orange cloud-icon"></i>
                        <div className="cloud-pulse"></div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold neon-orange">AWS Lambda</h1>
                        <p className="text-slate-300 mt-1">Compactação de Imagens</p>
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
                {/* Upload Section */}
                <div className="neon-border rounded-xl p-8 mb-8">
                    <h2 className="text-2xl font-bold neon-orange mb-6">
                        <i className="fas fa-upload mr-3"></i>Selecionar Imagem e Bucket
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* File Input */}
                        <div>
                            <label className="block text-slate-300 mb-2">Selecionar Imagem:</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="w-full p-3 rounded-lg bg-slate-800 border border-slate-600 text-white focus:border-orange-500 focus:outline-none"
                            />
                            {file && (
                                <p className="text-green-400 mt-2">
                                    <i className="fas fa-check mr-2"></i>
                                    {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                </p>
                            )}
                        </div>
                        
                        {/* Bucket Selection */}
                        <div>
                            <label className="block text-slate-300 mb-2">Selecionar Bucket:</label>
                            <select
                                value={selectedBucket}
                                onChange={(e) => setSelectedBucket(e.target.value)}
                                className="w-full p-3 rounded-lg bg-slate-800 border border-slate-600 text-white focus:border-orange-500 focus:outline-none"
                            >
                                <option value="">Escolha um bucket...</option>
                                {buckets.map((bucket) => (
                                    <option key={bucket.Name} value={bucket.Name}>
                                        {bucket.Name}
                                    </option>
                                ))}
                            </select>
                            {selectedBucket && (
                                <p className="text-green-400 mt-2">
                                    <i className="fas fa-check mr-2"></i>
                                    Bucket selecionado: {selectedBucket}
                                </p>
                            )}
                        </div>
                        
                        {/* Module Selection */}
                        <div>
                            <label className="block text-slate-300 mb-2">Módulo de Compactação:</label>
                            <select
                                value={selectedModule}
                                onChange={(e) => setSelectedModule(e.target.value)}
                                className="w-full p-3 rounded-lg bg-slate-800 border border-slate-600 text-white focus:border-orange-500 focus:outline-none"
                            >
                                {compressionModules.map((module) => (
                                    <option key={module.id} value={module.id}>
                                        {module.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-slate-400 mt-2 text-sm">
                                <i className="fas fa-info-circle mr-2"></i>
                                {compressionModules.find(m => m.id === selectedModule)?.description}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <button
                            onClick={handleCompress}
                            disabled={!file || !selectedBucket || loading}
                            className="neon-button px-8 py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin mr-2"></i>
                                    Processando com {compressionModules.find(m => m.id === selectedModule)?.name}...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-compress-alt mr-2"></i>
                                    Comprimir com {compressionModules.find(m => m.id === selectedModule)?.name}
                                </>
                            )}
                        </button>
                        
                        <div className="text-slate-400 text-sm">
                            <i className="fas fa-cog mr-2"></i>
                            Módulo selecionado: <span className="text-orange-400 font-semibold">{compressionModules.find(m => m.id === selectedModule)?.name}</span>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                {result && (
                    <div className="neon-border rounded-xl p-8">
                        <h2 className="text-2xl font-bold neon-green mb-6">
                            <i className="fas fa-chart-bar mr-3"></i>Resultado da Compactação
                        </h2>
                        {result.error ? (
                            <div className="bg-red-900/30 border border-red-500 rounded-lg p-4">
                                <p className="text-red-400">
                                    <i className="fas fa-exclamation-triangle mr-2"></i>
                                    {result.error}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Original */}
                                    <div className="bg-slate-800/50 rounded-lg p-4">
                                        <h3 className="text-lg font-bold text-blue-400 mb-3">
                                            <i className="fas fa-file-image mr-2"></i>Original
                                        </h3>
                                        <p className="text-slate-300"><strong>Arquivo:</strong> {result.originalKey}</p>
                                        <p className="text-slate-300"><strong>Tamanho:</strong> {(result.originalSize / 1024).toFixed(2)} KB</p>
                                    </div>
                                    
                                    {/* Compactado */}
                                    <div className="bg-slate-800/50 rounded-lg p-4">
                                        <h3 className="text-lg font-bold text-green-400 mb-3">
                                            <i className="fas fa-compress-alt mr-2"></i>Compactado
                                        </h3>
                                        <p className="text-slate-300"><strong>Arquivo:</strong> {result.compressedKey}</p>
                                        <p className="text-slate-300"><strong>Tamanho:</strong> {(result.compressedSize / 1024).toFixed(2)} KB</p>
                                        <p className="text-green-400 font-bold"><strong>Redução:</strong> {result.reduction}</p>
                                        {result.module && (
                                            <>
                                                <p className="text-orange-400"><strong>Módulo:</strong> {result.module}</p>
                                                <p className="text-blue-400"><strong>Velocidade:</strong> {result.speed}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Status */}
                                <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4">
                                    <p className="text-blue-400">
                                        <i className="fas fa-info-circle mr-2"></i>
                                        {result.message}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}