import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';

export function BucketList({ onSelectBucket, selectedBucket }) {
  const [buckets, setBuckets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { credentials } = useAuth();
  
  // Função para selecionar um bucket
  const handleSelectBucket = (bucketName) => {
    // Mesmo que o bucket já esteja selecionado, chamar onSelectBucket para forçar o carregamento
    onSelectBucket(bucketName);
  };
  
  // Carregar buckets quando o componente montar
  useEffect(() => {
    const loadBuckets = async () => {
      if (!credentials) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        try {
          const result = await apiService.listBuckets(
            credentials.accessKey,
            credentials.secretKey
          );
          
          if (result.success) {
            setBuckets(result.buckets || []);
          } else {
            throw new Error(result.error || 'Erro ao carregar buckets');
          }
        } catch (apiError) {
          console.error('Erro na API:', apiError);
          
          // Se o backend não estiver disponível, usar dados simulados
          console.log('Backend não disponível, usando dados simulados');
          
          // Dados simulados para demonstração
          const mockBuckets = [
            { Name: 'exemplo-bucket-1', CreationDate: new Date().toISOString() },
            { Name: 'exemplo-bucket-2', CreationDate: new Date().toISOString() },
            { Name: 'dados-app', CreationDate: new Date().toISOString() },
            { Name: 'backups-sistema', CreationDate: new Date().toISOString() },
          ];
          
          setBuckets(mockBuckets);
          setError('Backend não disponível. Usando dados simulados.');
        }
      } catch (err) {
        console.error('Erro ao listar buckets:', err);
        setError('Erro ao carregar buckets');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBuckets();
  }, [credentials]);
  
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-slate-700 rounded-lg mb-2"></div>
        <div className="h-10 bg-slate-700 rounded-lg mb-2"></div>
        <div className="h-10 bg-slate-700 rounded-lg"></div>
      </div>
    );
  }
  
  if (error && buckets.length === 0) {
    return (
      <div className="text-red-500 text-center py-4">
        <i className="fas fa-exclamation-triangle text-xl mb-2"></i>
        <p className="text-sm">{error}</p>
      </div>
    );
  }
  
  if (buckets.length === 0) {
    return (
      <div className="text-center py-4">
        <i className="fas fa-info-circle text-xl text-slate-400 mb-2"></i>
        <p className="text-slate-300 text-sm">Nenhum bucket encontrado</p>
        <p className="text-xs text-slate-400 mt-2">Crie um novo bucket para começar</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2 max-h-[calc(100vh-20rem)] overflow-y-auto custom-scrollbar">
      {error && (
        <div className="text-yellow-500 text-center py-2 mb-2 text-xs bg-yellow-900 bg-opacity-30 rounded-lg">
          <i className="fas fa-exclamation-triangle mr-1"></i>
          Modo offline
        </div>
      )}
      
      {buckets.map((bucket) => (
        <div
          key={bucket.Name}
          className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-slate-700 flex items-center ${
            selectedBucket === bucket.Name ? 'bg-slate-700 neon-border-active' : ''
          }`}
          onClick={() => handleSelectBucket(bucket.Name)}
        >
          <i className="fas fa-folder mr-3 text-blue-400"></i>
          <span className="truncate">{bucket.Name}</span>
        </div>
      ))}
    </div>
  );
}