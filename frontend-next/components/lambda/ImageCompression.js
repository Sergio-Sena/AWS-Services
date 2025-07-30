import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ImageUploadProcessor from './ImageUploadProcessor';

export default function ImageCompression() {
  const [buckets, setBuckets] = useState([]);
  const [selectedBucket, setSelectedBucket] = useState('');
  const [processingJobs, setProcessingJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    executions: 12,
    avgTime: '847ms',
    dataProcessed: '2.3MB',
    estimatedCost: '$0.12'
  });
  const { credentials } = useAuth();

  useEffect(() => {
    if (credentials) {
      loadBuckets();
    }
  }, [credentials]);

  const loadBuckets = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Carregando buckets com credenciais:', credentials);
      
      const response = await fetch('/api/buckets', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'access_key': credentials.accessKey,
          'secret_key': credentials.secretKey
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Buckets data:', data);
      
      if (data.success) {
        setBuckets(data.buckets || []);
      } else {
        setError(data.message || 'Erro ao carregar buckets');
      }
    } catch (error) {
      console.error('Erro ao carregar buckets:', error);
      setError(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!credentials) {
    return (
      <div className="bg-slate-800 rounded-lg shadow-xl p-8 text-center">
        <i className="fas fa-sign-in-alt text-4xl text-slate-500 mb-4"></i>
        <h3 className="text-xl font-semibold text-slate-300 mb-2">
          Autenticação Necessária
        </h3>
        <p className="text-slate-400">
          Faça login com suas credenciais AWS para usar o módulo Lambda
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Estatísticas Lambda */}
      <div className="bg-slate-800 rounded-lg shadow-xl p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center text-white">
          <i className="fas fa-chart-line mr-3 text-orange-500"></i>
          Estatísticas Lambda
        </h2>
        <div className="grid grid-cols-4 gap-6">
          <div className="text-center p-4 bg-slate-700 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{stats.executions}</div>
            <div className="text-sm text-slate-400">Execuções Hoje</div>
          </div>
          <div className="text-center p-4 bg-slate-700 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{stats.avgTime}</div>
            <div className="text-sm text-slate-400">Tempo Médio</div>
          </div>
          <div className="text-center p-4 bg-slate-700 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">{stats.dataProcessed}</div>
            <div className="text-sm text-slate-400">Dados Processados</div>
          </div>
          <div className="text-center p-4 bg-slate-700 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">{stats.estimatedCost}</div>
            <div className="text-sm text-slate-400">Custo Estimado</div>
          </div>
        </div>
      </div>

      {/* Seleção de Bucket */}
      <div className="bg-slate-800 rounded-lg shadow-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
          <i className="fas fa-bucket mr-3 text-blue-500"></i>
          Selecionar Bucket S3
        </h3>
        
        {loading && (
          <div className="text-center py-4">
            <i className="fas fa-spinner fa-spin text-blue-400 mr-2"></i>
            <span className="text-slate-300">Carregando buckets...</span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-900 bg-opacity-50 border border-red-500 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <i className="fas fa-exclamation-triangle text-red-400 mr-3"></i>
              <div>
                <div className="font-medium text-red-200">Erro ao carregar buckets</div>
                <div className="text-sm text-red-300">{error}</div>
              </div>
            </div>
            <button 
              onClick={loadBuckets}
              className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
            >
              Tentar Novamente
            </button>
          </div>
        )}
        
        {!loading && !error && (
          <select
            value={selectedBucket}
            onChange={(e) => setSelectedBucket(e.target.value)}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Selecione um bucket...</option>
            {buckets.map(bucket => (
              <option key={bucket.Name} value={bucket.Name}>
                {bucket.Name}
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedBucket && (
        <>
          {/* Upload e Processamento */}
          <div className="bg-slate-800 rounded-lg shadow-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
              <i className="fas fa-upload mr-3 text-green-500"></i>
              Upload para Processamento Lambda
            </h3>
            <ImageUploadProcessor 
              bucket={selectedBucket}
              onProcessingStart={(job) => {
                setProcessingJobs(prev => [...prev, job]);
              }}
            />
          </div>

          {/* Histórico de Processamentos */}
          <div className="bg-slate-800 rounded-lg shadow-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
              <i className="fas fa-history mr-3 text-purple-500"></i>
              Histórico de Processamentos
            </h3>
            {processingJobs.length === 0 ? (
              <p className="text-slate-400 text-center py-8">
                Nenhum processamento ainda
              </p>
            ) : (
              <div className="space-y-3">
                {processingJobs.map(job => (
                  <div key={job.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                    <div className="flex items-center">
                      <i className={`fas ${
                        job.status === 'completed' ? 'fa-check-circle text-green-400' :
                        job.status === 'processing' ? 'fa-spinner fa-spin text-blue-400' :
                        'fa-exclamation-circle text-red-400'
                      } mr-3`}></i>
                      <div>
                        <div className="font-medium text-white">{job.fileName}</div>
                        <div className="text-sm text-slate-400">
                          {job.startTime.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-slate-300">
                      {job.status === 'completed' && job.executionTime && (
                        <span>{job.executionTime}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}