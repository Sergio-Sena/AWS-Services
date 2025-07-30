import { useState } from 'react';
import { Button } from '../ui/Button';

const AWS_REGIONS = [
  { id: 'us-east-1', name: 'Leste dos EUA (Norte da Virgínia)' },
  { id: 'us-east-2', name: 'Leste dos EUA (Ohio)' },
  { id: 'us-west-1', name: 'Oeste dos EUA (N. California)' },
  { id: 'us-west-2', name: 'Oeste dos EUA (Oregon)' },
  { id: 'af-south-1', name: 'África (Cidade do Cabo)' },
  { id: 'ap-east-1', name: 'Ásia-Pacífico (Hong Kong)' },
  { id: 'ap-south-1', name: 'Ásia-Pacífico (Mumbai)' },
  { id: 'ap-northeast-1', name: 'Ásia-Pacífico (Tóquio)' },
  { id: 'ap-northeast-2', name: 'Ásia-Pacífico (Seul)' },
  { id: 'ap-northeast-3', name: 'Ásia-Pacífico (Osaka)' },
  { id: 'ap-southeast-1', name: 'Ásia-Pacífico (Singapura)' },
  { id: 'ap-southeast-2', name: 'Ásia-Pacífico (Sydney)' },
  { id: 'ca-central-1', name: 'Canadá (Central)' },
  { id: 'eu-central-1', name: 'Europa (Frankfurt)' },
  { id: 'eu-west-1', name: 'Europa (Irlanda)' },
  { id: 'eu-west-2', name: 'Europa (Londres)' },
  { id: 'eu-west-3', name: 'Europa (Paris)' },
  { id: 'eu-north-1', name: 'Europa (Estocolmo)' },
  { id: 'eu-south-1', name: 'Europa (Milão)' },
  { id: 'sa-east-1', name: 'América do Sul (São Paulo)' }
];

const CreateBucketModal = ({ isOpen, onClose, onCreateBucket }) => {
  const [bucketName, setBucketName] = useState('');
  const [region, setRegion] = useState('us-east-1');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Validação do nome do bucket conforme diretrizes da AWS
  const validateBucketName = (name) => {
    if (!name) return 'Nome do bucket é obrigatório';
    if (name.length < 3 || name.length > 63) return 'O nome deve ter entre 3 e 63 caracteres';
    if (!/^[a-z0-9.-]+$/.test(name)) return 'O nome deve conter apenas letras minúsculas, números, pontos e hífens';
    if (/^[^a-z0-9]/.test(name) || /[^a-z0-9]$/.test(name)) return 'O nome deve começar e terminar com letra ou número';
    if (/\.\./.test(name)) return 'O nome não pode conter dois pontos consecutivos';
    if (/^(?:\d+\.){3}\d+$/.test(name)) return 'O nome não pode estar no formato de IP';
    if (/^xn--/.test(name)) return 'O nome não pode começar com "xn--"';
    if (/^sthree-/.test(name)) return 'O nome não pode começar com "sthree-"';
    if (/^sthree-configurator/.test(name)) return 'O nome não pode começar com "sthree-configurator"';
    if (/^amzn-s3-demo-/.test(name)) return 'O nome não pode começar com "amzn-s3-demo-"';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateBucketName(bucketName);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsCreating(true);
    setError('');
    
    try {
      await onCreateBucket(bucketName, region);
      setBucketName('');
      setRegion('us-east-1');
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao criar bucket');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-blue-500 shadow-lg shadow-blue-500/30 w-full max-w-md p-6 animate-fadeIn">
        <div className="text-center mb-6">
          <i className="fas fa-folder-plus text-4xl neon-blue mb-3"></i>
          <h3 className="text-2xl font-bold neon-blue">Criar Novo Bucket</h3>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-md text-red-200 text-sm">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-slate-300 mb-2 text-sm font-medium">
              Nome do Bucket
            </label>
            <input
              type="text"
              className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
              value={bucketName}
              onChange={(e) => setBucketName(e.target.value.toLowerCase())}
              placeholder="meu-bucket-unico"
              required
            />
            <p className="mt-1 text-xs text-slate-400">
              O nome deve ser globalmente único, entre 3-63 caracteres, usando apenas letras minúsculas, números, pontos e hífens.
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-slate-300 mb-2 text-sm font-medium">
              Região AWS
            </label>
            <select
              className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              required
            >
              {AWS_REGIONS.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button
              variant="neon"
              type="submit"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Criando...
                </>
              ) : (
                <>
                  <i className="fas fa-plus mr-2"></i>
                  Criar Bucket
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBucketModal;