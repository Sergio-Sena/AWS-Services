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

      if (!uploadResponse.ok) {
        throw new Error('Erro ao obter URL de upload');
      }

      const { uploadUrl, key } = await uploadResponse.json();

      // 2. Upload para S3 (vai disparar Lambda automaticamente)
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 
          'Content-Type': file.type
        }
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }

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

      // 4. Simular processamento (2 segundos)
      setTimeout(() => {
        setProcessing(false);
        setResult({
          success: true,
          message: 'Processamento Lambda concluído!',
          executionTime: '847ms',
          originalSize: file.size,
          compressedSize: Math.floor(file.size * 0.7),
          savings: '30%',
          lambdaCost: '$0.0001'
        });
        
        // Atualizar job
        job.status = 'completed';
        job.executionTime = '847ms';
      }, 2000);

    } catch (error) {
      setResult({ error: 'Erro no processamento: ' + error.message });
      setUploading(false);
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-orange-500 transition-colors">
        <i className="fas fa-cloud-upload-alt text-5xl text-slate-500 mb-4"></i>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => processImage(e.target.files[0])}
          disabled={uploading || processing}
          className="hidden"
          id="image-upload"
        />
        <label 
          htmlFor="image-upload" 
          className={`cursor-pointer ${uploading || processing ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <div className="text-lg font-medium text-white mb-2">
            Selecione uma imagem para processamento
          </div>
          <div className="text-sm text-slate-400">
            Suporta JPG, PNG, GIF - Processamento via AWS Lambda
          </div>
        </label>
      </div>

      {/* Status */}
      {uploading && (
        <div className="bg-blue-900 bg-opacity-50 border border-blue-500 rounded-lg p-4">
          <div className="flex items-center">
            <i className="fas fa-spinner fa-spin text-blue-400 mr-3"></i>
            <div>
              <div className="font-medium text-blue-200">Fazendo Upload</div>
              <div className="text-sm text-blue-300">Enviando para S3...</div>
            </div>
          </div>
        </div>
      )}

      {processing && (
        <div className="bg-orange-900 bg-opacity-50 border border-orange-500 rounded-lg p-4">
          <div className="flex items-center">
            <i className="fas fa-lambda fa-spin text-orange-400 mr-3"></i>
            <div>
              <div className="font-medium text-orange-200">Lambda Executando</div>
              <div className="text-sm text-orange-300">Processando imagem...</div>
            </div>
          </div>
        </div>
      )}

      {/* Resultado */}
      {result && (
        <div className={`rounded-lg p-4 ${
          result.error ? 'bg-red-900 bg-opacity-50 border border-red-500' : 
          result.success ? 'bg-green-900 bg-opacity-50 border border-green-500' : 
          'bg-blue-900 bg-opacity-50 border border-blue-500'
        }`}>
          <div className={`font-medium ${
            result.error ? 'text-red-200' : 
            result.success ? 'text-green-200' : 
            'text-blue-200'
          }`}>
            {result.error && <i className="fas fa-exclamation-circle mr-2"></i>}
            {result.success && <i className="fas fa-check-circle mr-2"></i>}
            {result.message}
          </div>
          
          {result.success && (
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300">Tempo de execução:</span>
                  <span className="text-white font-medium">{result.executionTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Custo estimado:</span>
                  <span className="text-white font-medium">{result.lambdaCost}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300">Tamanho original:</span>
                  <span className="text-white font-medium">{(result.originalSize / 1024).toFixed(2)} KB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Economia:</span>
                  <span className="text-green-400 font-medium">{result.savings}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}