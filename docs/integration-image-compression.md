# Integração de Compactação de Imagens - AWS Services App

## Passos para Integrar na Aplicação Existente

### 1. Adicionar Nova Função Lambda ao Backend

**handlers/imageCompression.js:**
```javascript
const AWS = require('aws-sdk');

const s3 = new AWS.S3();

// Handler para S3 trigger (compactação automática)
module.exports.compressImage = async (event) => {
  try {
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key);
    
    // Pular se já for uma imagem compactada
    if (key.startsWith('compressed/')) {
      return { statusCode: 200, body: 'Skipped compressed image' };
    }
    
    // Download da imagem original
    const originalImage = await s3.getObject({ Bucket: bucket, Key: key }).promise();
    
    // Usar Sharp para compactação (mais eficiente que Pillow)
    const sharp = require('sharp');
    const compressedBuffer = await sharp(originalImage.Body)
      .jpeg({ quality: 70, progressive: true })
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .toBuffer();
    
    // Upload da imagem compactada
    const compressedKey = `compressed/${key}`;
    await s3.putObject({
      Bucket: bucket,
      Key: compressedKey,
      Body: compressedBuffer,
      ContentType: 'image/jpeg',
      Metadata: {
        'original-size': originalImage.Body.length.toString(),
        'compressed-size': compressedBuffer.length.toString()
      }
    }).promise();
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Image compressed successfully',
        originalSize: originalImage.Body.length,
        compressedSize: compressedBuffer.length,
        compressionRatio: ((1 - compressedBuffer.length / originalImage.Body.length) * 100).toFixed(2) + '%'
      })
    };
  } catch (error) {
    console.error('Error compressing image:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// Handler para API (upload com presigned URL)
module.exports.getUploadUrl = async (event) => {
  try {
    const { access_key, secret_key } = event.headers;
    const { fileName, fileType, bucket } = JSON.parse(event.body);
    
    if (!access_key || !secret_key) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Credentials required' })
      };
    }
    
    const s3Client = new AWS.S3({
      accessKeyId: access_key,
      secretAccessKey: secret_key,
      region: 'us-east-1'
    });
    
    const key = `uploads/images/${Date.now()}-${fileName}`;
    
    const uploadUrl = s3Client.getSignedUrl('putObject', {
      Bucket: bucket,
      Key: key,
      ContentType: fileType,
      Expires: 300
    });
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ uploadUrl, key })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// Handler para verificar status da compactação
module.exports.getCompressionStatus = async (event) => {
  try {
    const { access_key, secret_key } = event.headers;
    const { bucket, key } = event.pathParameters;
    
    const s3Client = new AWS.S3({
      accessKeyId: access_key,
      secretAccessKey: secret_key,
      region: 'us-east-1'
    });
    
    const compressedKey = `compressed/${key}`;
    
    try {
      const compressed = await s3Client.headObject({
        Bucket: bucket,
        Key: compressedKey
      }).promise();
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          compressed: true,
          size: compressed.ContentLength,
          originalSize: compressed.Metadata['original-size'],
          compressionRatio: compressed.Metadata['compression-ratio']
        })
      };
    } catch (notFoundError) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ compressed: false })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

### 2. Atualizar serverless.yml

```yaml
# Adicionar ao serverless.yml existente
functions:
  # ... funções existentes ...
  
  # Nova função para compactação automática
  compressImage:
    handler: handlers/imageCompression.compressImage
    timeout: 60
    memorySize: 1024
    layers:
      - arn:aws:lambda:us-east-1:ACCOUNT:layer:sharp-layer:1
    events:
      - s3:
          bucket: ${self:custom.bucketName}
          event: s3:ObjectCreated:*
          rules:
            - prefix: uploads/images/
            - suffix: .jpg
      - s3:
          bucket: ${self:custom.bucketName}
          event: s3:ObjectCreated:*
          rules:
            - prefix: uploads/images/
            - suffix: .jpeg
      - s3:
          bucket: ${self:custom.bucketName}
          event: s3:ObjectCreated:*
          rules:
            - prefix: uploads/images/
            - suffix: .png
  
  # API para upload de imagens
  getImageUploadUrl:
    handler: handlers/imageCompression.getUploadUrl
    events:
      - http:
          path: image/upload-url
          method: post
          cors: true
  
  # API para verificar status da compactação
  getCompressionStatus:
    handler: handlers/imageCompression.getCompressionStatus
    events:
      - http:
          path: image/status/{bucket}/{key+}
          method: get
          cors: true

# Adicionar permissões
provider:
  iamRoleStatements:
    # ... permissões existentes ...
    - Effect: Allow
      Action:
        - s3:GetObject
        - s3:PutObject
        - s3:GetObjectMetadata
      Resource: "arn:aws:s3:::*/*"
```

### 3. Criar Layer Sharp para Lambda

```bash
# Criar layer com Sharp (mais eficiente que Pillow para Node.js)
mkdir sharp-layer
cd sharp-layer
mkdir nodejs
cd nodejs
npm init -y
npm install sharp --platform=linux --arch=x64
cd ..
zip -r sharp-layer.zip nodejs/
aws lambda publish-layer-version --layer-name sharp-layer --zip-file fileb://sharp-layer.zip --compatible-runtimes nodejs18.x
```

### 4. Adicionar ao Frontend - Componente ImageUpload

**frontend-next/components/dashboard/ImageUpload.js:**
```javascript
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';

export default function ImageUpload({ bucket, onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [result, setResult] = useState(null);
  const { credentials } = useAuth();

  const uploadImage = async (file) => {
    if (!file.type.startsWith('image/')) {
      setResult({ error: 'Selecione apenas arquivos de imagem' });
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      // Obter URL de upload
      const uploadResponse = await fetch('/api/image/upload-url', {
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

      // Upload direto para S3
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });

      setUploading(false);
      setCompressing(true);
      setResult({ message: 'Upload concluído! Compactando imagem...' });

      // Verificar status da compactação
      await checkCompressionStatus(bucket, key);

    } catch (error) {
      setResult({ error: 'Erro no upload: ' + error.message });
      setUploading(false);
    }
  };

  const checkCompressionStatus = async (bucket, key) => {
    const maxAttempts = 30; // 30 segundos
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/image/status/${bucket}/${encodeURIComponent(key)}`, {
          headers: {
            'access_key': credentials.accessKey,
            'secret_key': credentials.secretKey
          }
        });

        const status = await response.json();

        if (status.compressed) {
          setCompressing(false);
          setResult({
            success: true,
            message: 'Imagem compactada com sucesso!',
            originalSize: status.originalSize,
            compressedSize: status.size,
            savings: status.compressionRatio
          });
          
          if (onUploadComplete) {
            onUploadComplete(key);
          }
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkStatus, 1000);
        } else {
          setCompressing(false);
          setResult({ error: 'Timeout na compactação' });
        }
      } catch (error) {
        setCompressing(false);
        setResult({ error: 'Erro ao verificar compactação' });
      }
    };

    checkStatus();
  };

  return (
    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => uploadImage(e.target.files[0])}
        disabled={uploading || compressing}
        className="mb-4"
      />
      
      {uploading && (
        <div className="text-blue-600">
          <i className="fas fa-spinner fa-spin mr-2"></i>
          Enviando imagem...
        </div>
      )}
      
      {compressing && (
        <div className="text-yellow-600">
          <i className="fas fa-compress fa-spin mr-2"></i>
          Compactando imagem...
        </div>
      )}
      
      {result && (
        <div className={`mt-2 p-2 rounded ${
          result.error ? 'bg-red-100 text-red-700' : 
          result.success ? 'bg-green-100 text-green-700' : 
          'bg-blue-100 text-blue-700'
        }`}>
          {result.error && <i className="fas fa-exclamation-circle mr-2"></i>}
          {result.success && <i className="fas fa-check-circle mr-2"></i>}
          {result.message}
          
          {result.success && (
            <div className="mt-2 text-sm">
              <div>Tamanho original: {(result.originalSize / 1024).toFixed(2)} KB</div>
              <div>Tamanho compactado: {(result.compressedSize / 1024).toFixed(2)} KB</div>
              <div>Economia: {result.savings}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### 5. Adicionar ao Dashboard

**frontend-next/pages/dashboard.js:**
```javascript
// Adicionar import
import ImageUpload from '../components/dashboard/ImageUpload';

// Adicionar no JSX do dashboard
<div className="bg-white rounded-lg shadow p-6">
  <h3 className="text-lg font-semibold mb-4">Upload de Imagens</h3>
  <ImageUpload 
    bucket={selectedBucket} 
    onUploadComplete={() => {
      // Atualizar lista de objetos
      if (selectedBucket) {
        loadObjects(selectedBucket);
      }
    }}
  />
</div>
```

### 6. Atualizar API Service

**frontend-next/services/api.js:**
```javascript
// Adicionar métodos para imagens
const apiService = {
  // ... métodos existentes ...

  /**
   * Obtém URL para upload de imagem
   */
  getImageUploadUrl: async (accessKey, secretKey, bucket, fileName, fileType) => {
    const response = await fetch(`${API_URL}/image/upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_key': accessKey,
        'secret_key': secretKey
      },
      body: JSON.stringify({ bucket, fileName, fileType })
    });
    
    return await response.json();
  },

  /**
   * Verifica status da compactação
   */
  getCompressionStatus: async (accessKey, secretKey, bucket, key) => {
    const response = await fetch(`${API_URL}/image/status/${bucket}/${encodeURIComponent(key)}`, {
      headers: {
        'access_key': accessKey,
        'secret_key': secretKey
      }
    });
    
    return await response.json();
  }
};
```

## Ordem de Implementação

1. **Criar layer Sharp** (5 min)
2. **Adicionar handlers** ao backend (15 min)
3. **Atualizar serverless.yml** (10 min)
4. **Deploy da aplicação** (5 min)
5. **Implementar componente frontend** (20 min)
6. **Testar integração** (10 min)

**Total: ~65 minutos**

## Resultado Final

- Upload de imagens via interface existente
- Compactação automática por Lambda
- Feedback em tempo real do processo
- Economia de espaço e bandwidth
- Integração completa com o dashboard atual