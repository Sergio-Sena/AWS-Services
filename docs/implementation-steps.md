# Passos de Implementação - Compactação de Imagens no Módulo Lambda

## 📋 Checklist de Implementação

### **FASE 1: Backend Lambda (30 min)**

#### 1.1 Criar Handler de Compactação
```bash
# Criar arquivo
touch backend/handlers/imageCompression.js
```

**Código:** [Ver arquivo lambda-image-compression.md - seção handlers/imageCompression.js]

#### 1.2 Instalar Dependências
```bash
cd backend
npm install sharp
```

#### 1.3 Criar Layer Sharp
```bash
mkdir sharp-layer && cd sharp-layer
mkdir nodejs && cd nodejs
npm init -y
npm install sharp --platform=linux --arch=x64
cd .. && zip -r sharp-layer.zip nodejs/
aws lambda publish-layer-version --layer-name sharp-layer --zip-file fileb://sharp-layer.zip --compatible-runtimes nodejs18.x
```

#### 1.4 Atualizar serverless.yml
```yaml
# Adicionar ao serverless.yml existente
functions:
  # Função para compactação automática (S3 trigger)
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
            - prefix: lambda-uploads/
            - suffix: .jpg
      - s3:
          bucket: ${self:custom.bucketName}
          event: s3:ObjectCreated:*
          rules:
            - prefix: lambda-uploads/
            - suffix: .jpeg
      - s3:
          bucket: ${self:custom.bucketName}
          event: s3:ObjectCreated:*
          rules:
            - prefix: lambda-uploads/
            - suffix: .png

  # API para upload de imagens
  getLambdaImageUploadUrl:
    handler: handlers/imageCompression.getUploadUrl
    events:
      - http:
          path: lambda/image-upload-url
          method: post
          cors: true

  # API para verificar status
  getLambdaCompressionStatus:
    handler: handlers/imageCompression.getCompressionStatus
    events:
      - http:
          path: lambda/compression-status/{bucket}/{key+}
          method: get
          cors: true
```

#### 1.5 Deploy Backend
```bash
serverless deploy
```

### **FASE 2: Frontend - Estrutura (20 min)**

#### 2.1 Criar Página Lambda
```bash
# Criar arquivo
touch frontend-next/pages/lambda.js
```

**Código:** [Ver arquivo lambda-image-compression.md - seção pages/lambda.js]

#### 2.2 Criar Diretório de Componentes
```bash
mkdir frontend-next/components/lambda
```

#### 2.3 Criar Componentes Base
```bash
touch frontend-next/components/lambda/ImageCompression.js
touch frontend-next/components/lambda/ImageUploadProcessor.js
touch frontend-next/components/lambda/ProcessingHistory.js
touch frontend-next/components/lambda/LambdaFunctions.js
```

### **FASE 3: Frontend - Componentes (25 min)**

#### 3.1 ImageCompression.js
**Código:** [Ver arquivo lambda-image-compression.md - seção ImageCompression.js]

#### 3.2 ImageUploadProcessor.js
**Código:** [Ver arquivo lambda-image-compression.md - seção ImageUploadProcessor.js]

#### 3.3 ProcessingHistory.js
```javascript
import { useState, useEffect } from 'react';

export default function ProcessingHistory({ jobs, bucket }) {
  return (
    <div className="space-y-3">
      {jobs.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          Nenhum processamento ainda
        </p>
      ) : (
        jobs.map(job => (
          <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <i className={`fas ${
                job.status === 'completed' ? 'fa-check-circle text-green-500' :
                job.status === 'processing' ? 'fa-spinner fa-spin text-blue-500' :
                'fa-exclamation-circle text-red-500'
              } mr-3`}></i>
              <div>
                <div className="font-medium">{job.fileName}</div>
                <div className="text-sm text-gray-500">{job.startTime.toLocaleTimeString()}</div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {job.status === 'completed' && job.executionTime && (
                <span>{job.executionTime}ms</span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
```

#### 3.4 LambdaFunctions.js (Placeholder)
```javascript
export default function LambdaFunctions() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Funções Lambda</h3>
      <p className="text-gray-500">Em desenvolvimento...</p>
    </div>
  );
}
```

### **FASE 4: Navegação e APIs (15 min)**

#### 4.1 Atualizar Sidebar
```javascript
// Em frontend-next/components/dashboard/Sidebar.js
// Adicionar item de menu:
{
  name: 'AWS Lambda',
  icon: 'fas fa-lambda',
  href: '/lambda'
}
```

#### 4.2 Criar APIs Routes
```bash
mkdir -p frontend-next/pages/api/lambda
touch frontend-next/pages/api/lambda/image-upload-url.js
touch frontend-next/pages/api/lambda/compression-status.js
```

**image-upload-url.js:**
```javascript
export default async function handler(req, res) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  try {
    const response = await fetch(`${API_URL}/lambda/image-upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_key': req.headers.access_key,
        'secret_key': req.headers.secret_key
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

**compression-status.js:**
```javascript
export default async function handler(req, res) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const { bucket, key } = req.query;
  
  try {
    const response = await fetch(`${API_URL}/lambda/compression-status/${bucket}/${key}`, {
      headers: {
        'access_key': req.headers.access_key,
        'secret_key': req.headers.secret_key
      }
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

#### 4.3 Atualizar Next.js Config
```javascript
// Em frontend-next/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/lambda',
        destination: '/lambda'
      }
    ];
  }
};

module.exports = nextConfig;
```

### **FASE 5: Testes e Ajustes (10 min)**

#### 5.1 Testar Backend
```bash
# Testar se as funções foram deployadas
serverless invoke --function compressImage --data '{"test": true}'
```

#### 5.2 Testar Frontend
```bash
cd frontend-next
npm run dev
# Acessar http://localhost:3000/lambda
```

#### 5.3 Teste End-to-End
1. Acessar página Lambda
2. Selecionar bucket
3. Fazer upload de imagem
4. Verificar processamento
5. Confirmar resultado

## 🚀 Ordem de Execução

### **Dia 1 (1h 40min)**
- [ ] **FASE 1**: Backend Lambda (30 min)
- [ ] **FASE 2**: Frontend Estrutura (20 min)
- [ ] **FASE 3**: Componentes (25 min)
- [ ] **FASE 4**: Navegação/APIs (15 min)
- [ ] **FASE 5**: Testes (10 min)

## 📝 Checklist Final

- [ ] Layer Sharp criado e deployado
- [ ] Função Lambda de compactação funcionando
- [ ] S3 trigger configurado para `lambda-uploads/`
- [ ] APIs de upload e status funcionando
- [ ] Página `/lambda` acessível
- [ ] Upload de imagem funcional
- [ ] Monitoramento em tempo real
- [ ] Resultado exibido corretamente

## 🔧 Troubleshooting

**Erro: Layer não encontrado**
```bash
# Verificar ARN do layer
aws lambda list-layers
# Atualizar ARN no serverless.yml
```

**Erro: Permissões S3**
```bash
# Verificar IAM role da Lambda
aws iam get-role --role-name lambda-execution-role
```

**Erro: CORS**
```bash
# Verificar configuração CORS no API Gateway
# Adicionar headers necessários nas funções Lambda
```

## 📊 Resultado Esperado

Após implementação:
- ✅ Módulo Lambda funcional
- ✅ Upload de imagens via interface
- ✅ Compactação automática por Lambda
- ✅ Monitoramento em tempo real
- ✅ Estatísticas de performance
- ✅ Integração completa com credenciais AWS