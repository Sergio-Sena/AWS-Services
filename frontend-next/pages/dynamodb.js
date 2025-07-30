import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function DynamoDB() {
    const router = useRouter();
    const { credentials, isAuthenticated, isLoading, logout } = useAuth();
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTable, setSelectedTable] = useState(null);
    const [tableData, setTableData] = useState(null);
    const [operationLoading, setOperationLoading] = useState(false);

    // Verificar autenticação
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/');
        }
    }, [isLoading, isAuthenticated, router]);

    // Carregar tabelas
    useEffect(() => {
        const loadTables = async () => {
            if (isAuthenticated && credentials?.accessKey && credentials?.secretKey) {
                try {
                    const response = await fetch('http://localhost:8000/api/dynamodb/tables', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'access_key': credentials.accessKey,
                            'secret_key': credentials.secretKey
                        }
                    });
                    const data = await response.json();
                    if (data.success) {
                        setTables(data.tables || []);
                        console.log(`Encontradas ${data.realCount} tabelas reais e ${data.demoCount} demos`);
                    }
                } catch (error) {
                    console.error('Erro ao carregar tabelas:', error);
                }
            }
            setLoading(false);
        };
        
        loadTables();
    }, [isAuthenticated, credentials]);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const handleTableOperation = async (tableName, operation, data = {}) => {
        setOperationLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/dynamodb/operation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tableName, operation, data })
            });
            const result = await response.json();
            if (result.success) {
                setTableData(result.result);
                setSelectedTable(tableName);
            }
        } catch (error) {
            console.error('Erro na operação:', error);
        }
        setOperationLoading(false);
    };

    if (isLoading || loading) {
        return (
            <div className="gradient-bg min-h-screen flex items-center justify-center">
                <div className="loading-spinner"></div>
                <p className="mt-4 text-lg text-white">Carregando...</p>
            </div>
        );
    }

    return (
        <div className="gradient-bg min-h-screen text-white p-4">
            <Head>
                <title>Amazon DynamoDB - Gerenciamento de Tabelas</title>
            </Head>
            
            {/* Header com Navbar */}
            <div className="mb-8 flex justify-between items-center">
                <div className="flex items-center">
                    <div className="cloud-container mr-4">
                        <i className="fas fa-database text-5xl neon-yellow cloud-icon"></i>
                        <div className="cloud-pulse"></div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold neon-yellow">Amazon DynamoDB</h1>
                        <p className="text-slate-300 mt-1">Gerenciamento de Tabelas NoSQL</p>
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
                {/* Tables List */}
                <div className="neon-border rounded-xl p-8">
                    <h2 className="text-2xl font-bold neon-yellow mb-6">
                        <i className="fas fa-table mr-3"></i>Tabelas DynamoDB
                    </h2>
                    
                    <div className="space-y-4">
                        {tables.map((table) => (
                            <div key={table.TableName} className="bg-slate-800/50 rounded-lg p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                                    {/* Table Info */}
                                    <div className="lg:col-span-2">
                                        <div className="flex items-center mb-2">
                                            <h3 className="text-lg font-bold text-white">
                                                {table.TableName}
                                            </h3>
                                            {table.isDemo ? (
                                                <span className="ml-2 px-2 py-1 bg-blue-600 text-xs rounded">
                                                    DEMO
                                                </span>
                                            ) : (
                                                <span className="ml-2 px-2 py-1 bg-green-600 text-xs rounded">
                                                    REAL
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-300 text-sm">Status: {table.TableStatus}</p>
                                        <p className="text-slate-300 text-sm">Items: {table.ItemCount?.toLocaleString()}</p>
                                        <p className="text-slate-300 text-sm">Tamanho: {(table.TableSizeBytes / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    
                                    {/* Throughput */}
                                    <div className="text-center">
                                        <p className="text-yellow-400 font-bold mb-1">Capacidade</p>
                                        <p className="text-slate-300 text-sm">
                                            Read: {table.ProvisionedThroughput?.ReadCapacityUnits || 'N/A'}
                                        </p>
                                        <p className="text-slate-300 text-sm">
                                            Write: {table.ProvisionedThroughput?.WriteCapacityUnits || 'N/A'}
                                        </p>
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="flex flex-col space-y-2">
                                        {table.isDemo ? (
                                            <>
                                                <button
                                                    onClick={() => handleTableOperation(table.TableName, 'scan')}
                                                    disabled={operationLoading}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm disabled:opacity-50"
                                                >
                                                    <i className="fas fa-search mr-1"></i>Scan (Demo)
                                                </button>
                                                <button
                                                    onClick={() => handleTableOperation(table.TableName, 'put', { id: 'demo-1', data: 'test' })}
                                                    disabled={operationLoading}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm disabled:opacity-50"
                                                >
                                                    <i className="fas fa-plus mr-1"></i>Put Item (Demo)
                                                </button>
                                            </>
                                        ) : (
                                            <div className="text-center text-slate-400 text-sm">
                                                <i className="fas fa-eye mr-1"></i>
                                                Apenas visualização
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Table Data (when selected) */}
                                {selectedTable === table.TableName && tableData && (
                                    <div className="mt-4 p-4 bg-slate-900/50 rounded-lg">
                                        <h4 className="text-yellow-400 font-bold mb-2">Resultado da Operação</h4>
                                        <p className="text-slate-300 mb-2">{tableData.message}</p>
                                        {tableData.items && (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                {tableData.items.map((item, index) => (
                                                    <div key={index} className="bg-slate-800 p-2 rounded text-sm">
                                                        <p className="text-yellow-400">ID: {item.id}</p>
                                                        <p className="text-slate-300">{item.data}</p>
                                                    </div>
                                                ))}
                                            </div>
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
                            Demonstração DynamoDB - Operações reais disponíveis apenas para visualização
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}