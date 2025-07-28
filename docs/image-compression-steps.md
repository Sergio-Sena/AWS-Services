# Implementação de Sistema de Compactação de Imagens

## Arquitetura
```
Frontend → S3 (upload) → Lambda Trigger → Compacta → S3 (compactadas) → Retorna tamanho
```

## Passos de Implementação

### 1. Configurar Buckets S3

```bash
# Criar bucket para imagens originais
aws s3 mb s3://imagens-originais-app

# Configurar CORS para upload direto
aws s3api put-bucket-cors --bucket imagens-originais-app --cors-configuration file://cors.json
```

**cors.json:**
```json
{
  "CORSRules": [{
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["PUT", "POST"],
    "AllowedHeaders": ["*"]
  }]
}
```

### 2. Criar Função Lambda

**lambda_function.py:**
```python
import boto3
import os
from PIL import Image
import io

s3 = boto3.client('s3')

def lambda_handler(event, context):
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']
    
    # Download imagem
    obj = s3.get_object(Bucket=bucket, Key=key)
    img_data = obj['Body'].read()
    
    # Compactar
    img = Image.open(io.BytesIO(img_data))
    buffer = io.BytesIO()
    img.save(buffer, format="JPEG", optimize=True, quality=70)
    buffer.seek(0)
    
    # Upload compactada
    novo_nome = f"compactadas/{key}"
    s3.put_object(Bucket=bucket, Key=novo_nome, Body=buffer, ContentType='image/jpeg')
    
    tamanho = buffer.getbuffer().nbytes
    
    return {
        'statusCode': 200,
        'body': f'Compactada: {tamanho} bytes'
    }
```

### 3. Configurar IAM Role para Lambda

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::imagens-originais-app/*"
    },
    {
      "Effect": "Allow",
      "Action": "logs:*",
      "Resource": "*"
    }
  ]
}
```

### 4. Configurar S3 Trigger

```bash
# Adicionar trigger S3 para Lambda
aws s3api put-bucket-notification-configuration \
  --bucket imagens-originais-app \
  --notification-configuration file://trigger.json
```

**trigger.json:**
```json
{
  "LambdaConfigurations": [{
    "Id": "ImageCompression",
    "LambdaFunctionArn": "arn:aws:lambda:us-east-1:ACCOUNT:function:compress-images",
    "Events": ["s3:ObjectCreated:*"],
    "Filter": {
      "Key": {
        "FilterRules": [{
          "Name": "prefix",
          "Value": "uploads/"
        }]
      }
    }
  }]
}
```

### 5. Frontend - Componente de Upload

**components/ImageUpload.js:**
```javascript
import { useState } from 'react';

export default function ImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState('');

  const uploadImage = async (file) => {
    setUploading(true);
    
    try {
      // Gerar presigned URL
      const response = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fileName: file.name,
          fileType: file.type 
        })
      });
      
      const { uploadUrl } = await response.json();
      
      // Upload direto para S3
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });
      
      setResult('Upload realizado! Compactação em andamento...');
    } catch (error) {
      setResult('Erro no upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*"
        onChange={(e) => uploadImage(e.target.files[0])}
        disabled={uploading}
      />
      {uploading && <p>Enviando...</p>}
      {result && <p>{result}</p>}
    </div>
  );
}
```

### 6. API Route para Presigned URL

**pages/api/upload-url.js:**
```javascript
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1'
});

export default async function handler(req, res) {
  const { fileName, fileType } = req.body;
  
  const key = `uploads/${Date.now()}-${fileName}`;
  
  const uploadUrl = s3.getSignedUrl('putObject', {
    Bucket: 'imagens-originais-app',
    Key: key,
    ContentType: fileType,
    Expires: 300
  });
  
  res.json({ uploadUrl, key });
}
```

### 7. Monitorar Resultados (Opcional)

**pages/api/check-compression.js:**
```javascript
import AWS from 'aws-sdk';

const s3 = new AWS.S3();

export default async function handler(req, res) {
  const { key } = req.query;
  
  try {
    const compressedKey = `compactadas/${key}`;
    const obj = await s3.headObject({
      Bucket: 'imagens-originais-app',
      Key: compressedKey
    }).promise();
    
    res.json({ 
      compressed: true, 
      size: obj.ContentLength 
    });
  } catch (error) {
    res.json({ compressed: false });
  }
}
```

## Ordem de Execução

1. **Configurar AWS**:
   - Criar buckets S3
   - Configurar CORS

2. **Deploy Lambda**:
   - Criar função com código Python
   - Configurar IAM role
   - Adicionar layer Pillow se necessário

3. **Configurar Trigger**:
   - Conectar S3 → Lambda

4. **Frontend**:
   - Implementar componente upload
   - Criar API route para presigned URL

5. **Testar**:
   - Upload imagem via frontend
   - Verificar compactação no S3

## Dependências

**Lambda Layer (Pillow):**
```bash
# Criar layer com Pillow
mkdir python
pip install Pillow -t python/
zip -r pillow-layer.zip python/
aws lambda publish-layer-version --layer-name pillow --zip-file fileb://pillow-layer.zip
```

**Frontend:**
```bash
npm install aws-sdk
```

## Resultado Esperado

1. Usuário seleciona imagem no frontend
2. Upload direto para S3 via presigned URL
3. Lambda é disparada automaticamente
4. Imagem é compactada e salva em `/compactadas/`
5. Tamanho da imagem compactada é retornado