# Compactação de Imagens - Módulo AWS Lambda

## Localização na Interface

A funcionalidade ficará **dentro do módulo AWS Lambda**:

```
AWS Services Dashboard
├── S3 Storage
├── AWS Lambda                    ← AQUI
│   ├── Functions List
│   ├── Create Function
│   └── 📸 Image Compression      ← NOVA SEÇÃO
│       ├── Upload & Process
│       ├── Processing History
│       └── Lambda Stats
└── Outros Serviços
```

## Estrutura do Módulo Lambda

### 1. Página Principal Lambda

**frontend-next/pages/lambda.js:**
```javascript
import { useState } from 'react';
import LambdaFunctions from '../components/lambda/LambdaFunctions';
import ImageCompression from '../components/lambda/ImageCompression';

export default function LambdaPage() {
  const [activeTab, setActiveTab] = useState('functions');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">AWS Lambda</h1>
        <p className="text-gray-600">Gerenciar funções serverless e processamento de imagens</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('functions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'functions' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500'
            }`}
          >
            <i className="fas fa-code mr-2"></i>
            Funções Lambda
          </button>
          
          <button
            onClick={() => setActiveTab('image-compression')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'image-compression' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500'
            }`}
          >
            <i className="fas fa-images mr-2"></i>
            Compressão de Imagens
          </button>
        </nav>
      </div>

      {/* Conteúdo */}
      {activeTab === 'functions' && <LambdaFunctions />}
      {activeTab === 'image-compression' && <ImageCompression />}
    </div>
  );
}
```

### 2. Componente Image Compression

**frontend-next/components/lambda/ImageCompression.js:**
```javascript
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ImageUploadProcessor from './ImageUploadProcessor';
import ProcessingHistory from './ProcessingHistory';

export default function ImageCompression() {
  const [buckets, setBuckets] = useState([]);
  const [selectedBucket, setSelectedBucket] = useState('');
  const [processingJobs, setProcessingJobs] = useState([]);
  const { credentials } = useAuth();

  useEffect(() => {
    loadBuckets();
    loadProcessingHistory();
  }, []);

  const loadBuckets = async () => {
    try {
      const response = await apiService.listBuckets(
        credentials.accessKey, 
        credentials.secretKey
      );
      setBuckets(response.buckets || []);
    } catch (error) {
      console.error('Erro ao carregar buckets:', error);
    }
  };

  const loadProcessingHistory = async () => {
    // Carregar histórico de processamentos
    // Pode vir de DynamoDB ou CloudWatch Logs
  };

  return (
    <div className="space-y-6">
      {/* Header com seleção de bucket */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <i className="fas fa-lambda mr-2 text-orange-600"></i>
          Processamento de Imagens com Lambda
        </h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecionar Bucket S3:
          </label>
          <select
            value={selectedBucket}
            onChange={(e) => setSelectedBucket(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Selecione um bucket...</option>
            {buckets.map(bucket => (
              <option key={bucket.Name} value={bucket.Name}>
                {bucket.Name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedBucket && (
        <>
          {/* Upload e Processamento */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-upload mr-2 text-blue-600"></i>
              Upload para Processamento Lambda
            </h3>
            <ImageUploadProcessor 
              bucket={selectedBucket}
              onProcessingStart={(job) => {
                setProcessingJobs(prev => [...prev, job]);
              }}
            />
          </div>

          {/* Status de Processamento */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-cogs mr-2 text-green-600"></i>
              Status do Processamento
            </h3>
            <ProcessingHistory 
              jobs={processingJobs}
              bucket={selectedBucket}
            />
          </div>

          {/* Estatísticas Lambda */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-chart-line mr-2 text-purple-600"></i>
              Estatísticas Lambda
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-sm text-gray-600">Execuções Hoje</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">847ms</div>
                <div className="text-sm text-gray-600">Tempo Médio</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">2.3MB</div>
                <div className="text-sm text-gray-600">Dados Processados</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">$0.12</div>
                <div className="text-sm text-gray-600">Custo Estimado</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

### 3. Componente Upload Processor

**frontend-next/components/lambda/ImageUploadProcessor.js:**
```javascript
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function ImageUploadProcessor({ bucket, onProcessingStart }) {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const { credentials } = useAuth();

  const processImage = async (file) => {
    if (!file.type.startsWith('image/')) {
      setResult({ error: 'Selecione apenas arquivos de imagem' });
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      // 1. Obter URL de upload
      const uploadResponse = await fetch('/api/lambda/image-upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_key': credentials.accessKey,
          'secret_key': credentials.secretKey
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          bucket: bucket
        })
      });

      const { uploadUrl, key } = await uploadResponse.json();

      // 2. Upload para S3 (vai disparar Lambda automaticamente)
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });

      setUploading(false);
      setProcessing(true);

      // 3. Notificar início do processamento
      const job = {
        id: Date.now(),
        fileName: file.name,
        key: key,
        status: 'processing',
        startTime: new Date()
      };
      
      onProcessingStart(job);
      setResult({ message: 'Upload concluído! Lambda processando...' });

      // 4. Monitorar processamento
      await monitorLambdaExecution(key, job.id);

    } catch (error) {
      setResult({ error: 'Erro no processamento: ' + error.message });
      setUploading(false);
      setProcessing(false);
    }
  };

  const monitorLambdaExecution = async (key, jobId) => {
    const maxAttempts = 30;
    let attempts = 0;

    const checkExecution = async () => {
      try {
        const response = await fetch(`/api/lambda/compression-status/${bucket}/${encodeURIComponent(key)}`, {
          headers: {
            'access_key': credentials.accessKey,
            'secret_key': credentials.secretKey
          }
        });

        const status = await response.json();

        if (status.completed) {
          setProcessing(false);
          setResult({
            success: true,
            message: 'Processamento Lambda concluído!',
            executionTime: status.executionTime,
            originalSize: status.originalSize,
            compressedSize: status.compressedSize,
            savings: status.compressionRatio,
            lambdaCost: status.estimatedCost
          });
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkExecution, 1000);
        } else {
          setProcessing(false);
          setResult({ error: 'Timeout no processamento Lambda' });
        }
      } catch (error) {
        setProcessing(false);
        setResult({ error: 'Erro ao monitorar Lambda' });
      }
    };

    checkExecution();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => processImage(e.target.files[0])}
          disabled={uploading || processing}
          className="mb-4"
        />
        <p className="text-sm text-gray-600">
          Selecione uma imagem para processamento via Lambda
        </p>
      </div>

      {/* Status */}
      {uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <i className="fas fa-spinner fa-spin text-blue-600 mr-3"></i>
            <div>
              <div className="font-medium text-blue-800">Fazendo Upload</div>
              <div className="text-sm text-blue-600">Enviando para S3...</div>
            </div>
          </div>
        </div>
      )}

      {processing && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <i className="fas fa-lambda fa-spin text-yellow-600 mr-3"></i>
            <div>
              <div className="font-medium text-yellow-800">Lambda Executando</div>
              <div className="text-sm text-yellow-600">Processando imagem...</div>
            </div>
          </div>
        </div>
      )}

      {/* Resultado */}
      {result && (
        <div className={`rounded-lg p-4 ${
          result.error ? 'bg-red-50 border border-red-200' : 
          result.success ? 'bg-green-50 border border-green-200' : 
          'bg-blue-50 border border-blue-200'
        }`}>
          <div className={`font-medium ${
            result.error ? 'text-red-800' : 
            result.success ? 'text-green-800' : 
            'text-blue-800'
          }`}>
            {result.error && <i className="fas fa-exclamation-circle mr-2"></i>}
            {result.success && <i className="fas fa-check-circle mr-2"></i>}
            {result.message}
          </div>
          
          {result.success && (
            <div className="mt-3 space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">Tempo de execução:</span>
                  <span className="ml-2 font-medium">{result.executionTime}ms</span>
                </div>
                <div>
                  <span className="text-gray-600">Custo estimado:</span>
                  <span className="ml-2 font-medium">${result.lambdaCost}</span>
                </div>
                <div>
                  <span className="text-gray-600">Tamanho original:</span>
                  <span className="ml-2 font-medium">{(result.originalSize / 1024).toFixed(2)} KB</span>
                </div>
                <div>
                  <span className="text-gray-600">Economia:</span>
                  <span className="ml-2 font-medium text-green-600">{result.savings}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### 4. Atualizar Navegação

**frontend-next/components/dashboard/Sidebar.js:**
```javascript
const menuItems = [
  {
    name: 'S3 Storage',
    icon: 'fas fa-hdd',
    href: '/dashboard'
  },
  {
    name: 'AWS Lambda',           ← AQUI
    icon: 'fas fa-lambda',
    href: '/lambda',
    submenu: [
      { name: 'Functions', icon: 'fas fa-code' },
      { name: 'Image Processing', icon: 'fas fa-images' }
    ]
  }
];
```

## Fluxo no Módulo Lambda

1. **Usuário acessa "AWS Lambda"**
2. **Clica em "Compressão de Imagens"**
3. **Seleciona bucket S3**
4. **Faz upload** → Dispara Lambda automaticamente
5. **Monitora execução** → Tempo real via CloudWatch
6. **Visualiza resultado** → Stats de performance e custo

## Vantagens

- ✅ **Contexto correto**: Funcionalidade Lambda no módulo Lambda
- ✅ **Foco em performance**: Métricas de execução, tempo, custo
- ✅ **Monitoramento**: Status em tempo real das execuções
- ✅ **Educativo**: Mostra como Lambda funciona na prática

**Implementação: ~45 minutos** para módulo completo.