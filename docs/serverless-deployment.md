# Migração para Arquitetura Serverless AWS

Este documento descreve como migrar a aplicação atual para uma arquitetura serverless na AWS, utilizando S3, Lambda, API Gateway e CloudFront.

## Arquitetura Proposta

```
                                  +----------------+
                                  |                |
                                  |  CloudFront    |
                                  |     (CDN)      |
                                  |                |
                                  +--------+-------+
                                           |
                     +---------------------+---------------------+
                     |                                           |
           +---------v---------+                     +-----------v-----------+
           |                   |                     |                       |
           |  S3 Bucket        |                     |  API Gateway          |
           |  (Frontend)       |                     |                       |
           |                   |                     +-----------+-----------+
           +-------------------+                                 |
                                                                 |
                                                     +-----------v-----------+
                                                     |                       |
                                                     |  Lambda Functions     |
                                                     |  (Backend)            |
                                                     |                       |
                                                     +-----------+-----------+
                                                                 |
                                                     +-----------v-----------+
                                                     |                       |
                                                     |  S3 Buckets           |
                                                     |  (Armazenamento)      |
                                                     |                       |
                                                     +-----------------------+
```

## Serviços AWS Necessários

1. **Amazon S3**:
   - Para hospedar o frontend estático
   - Para armazenamento de arquivos

2. **AWS Lambda**:
   - Para executar o código backend sem servidor

3. **Amazon API Gateway**:
   - Para criar uma API RESTful que aciona as funções Lambda

4. **Amazon CloudFront**:
   - Para distribuição de conteúdo (CDN)
   - Para servir o frontend com baixa latência

5. **AWS IAM**:
   - Para gerenciar permissões e políticas de acesso

6. **Amazon DynamoDB** (opcional):
   - Se precisar armazenar dados de sessão ou outras informações

7. **AWS CloudFormation ou SAM**:
   - Para automação de infraestrutura como código

## Passos para Migração

### 1. Preparação do Frontend

1. Construa a versão de produção do frontend Next.js:
   ```bash
   cd frontend-next
   npm run build
   npm run export  # Exporta como HTML estático
   ```

2. Crie um bucket S3 para o frontend:
   ```bash
   aws s3 mb s3://seu-app-frontend
   ```

3. Configure o bucket para hospedagem de site estático:
   ```bash
   aws s3 website s3://seu-app-frontend --index-document index.html --error-document index.html
   ```

4. Faça upload dos arquivos do frontend:
   ```bash
   aws s3 sync ./out s3://seu-app-frontend
   ```

### 2. Migração do Backend para Lambda

1. Reestruture o código backend para funções Lambda:
   - Divida o código em funções menores baseadas em responsabilidades
   - Cada rota pode se tornar uma função Lambda separada

2. Crie um arquivo `serverless.yml` para configuração:

```yaml
service: aws-services-app

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  iamRoleStatements:
    - Effect: Allow
      Action:
        - s3:*
      Resource: "*"

functions:
  auth:
    handler: handlers/auth.handler
    events:
      - http:
          path: auth
          method: post
          cors: true

  listBuckets:
    handler: handlers/buckets.listBuckets
    events:
      - http:
          path: buckets
          method: get
          cors: true

  listObjects:
    handler: handlers/objects.listObjects
    events:
      - http:
          path: objects/{bucket}
          method: get
          cors: true
          request:
            parameters:
              paths:
                bucket: true

  # Adicione outras funções conforme necessário
```

3. Crie os handlers para cada função Lambda:

Exemplo para `handlers/auth.js`:
```javascript
const AWS = require('aws-sdk');

module.exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { access_key, secret_key } = body;

    if (!access_key || !secret_key) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          success: false,
          message: 'Credenciais não fornecidas'
        }),
      };
    }

    // Configurar AWS SDK com as credenciais fornecidas
    const s3 = new AWS.S3({
      accessKeyId: access_key,
      secretAccessKey: secret_key,
      region: 'us-east-1'
    });

    // Tentar listar buckets para verificar se as credenciais são válidas
    await s3.listBuckets().promise();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        success: true,
        message: 'Autenticação bem-sucedida',
        redirect: 'aws-services.html'
      }),
    };
  } catch (error) {
    return {
      statusCode: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        success: false,
        message: 'Credenciais inválidas',
        error: error.message
      }),
    };
  }
};
```

### 3. Configuração do API Gateway

O API Gateway será configurado automaticamente pelo Serverless Framework com base no arquivo `serverless.yml`.

### 4. Configuração do CloudFront

1. Crie uma distribuição CloudFront para o frontend:
   - Origem: Bucket S3 do frontend
   - Comportamentos:
     - Padrão: Redirecionar para o bucket S3
     - `/api/*`: Redirecionar para o API Gateway

2. Configure HTTPS e domínio personalizado (opcional)

### 5. Atualização do Frontend

Atualize o arquivo de configuração da API no frontend para apontar para o endpoint do API Gateway:

```javascript
// frontend-next/services/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://seu-api-gateway-id.execute-api.us-east-1.amazonaws.com/dev';
```

## Implantação com Serverless Framework

1. Instale o Serverless Framework:
   ```bash
   npm install -g serverless
   ```

2. Configure suas credenciais AWS:
   ```bash
   serverless config credentials --provider aws --key YOUR_ACCESS_KEY --secret YOUR_SECRET_KEY
   ```

3. Implante a aplicação:
   ```bash
   serverless deploy
   ```

## Considerações Adicionais

### Gerenciamento de Uploads Grandes

Para uploads grandes, considere:
1. Usar upload direto para S3 com URLs pré-assinadas
2. Implementar um Lambda específico para gerenciar o processo de upload multipart

### Gerenciamento de Downloads

Para downloads grandes:
1. Gerar URLs pré-assinadas do S3 para download direto
2. Para downloads de pastas como ZIP, considere um Lambda com maior tempo limite ou uma solução com Step Functions

### Segurança

1. Use IAM roles com privilégios mínimos
2. Implemente autenticação com Amazon Cognito (opcional)
3. Configure CORS adequadamente no API Gateway
4. Proteja as credenciais AWS e não as exponha no frontend

### Monitoramento e Logs

1. Configure CloudWatch Logs para monitorar as funções Lambda
2. Implemente rastreamento com AWS X-Ray
3. Configure alarmes para erros e latência

## Próximos Passos

1. **Automação de CI/CD**:
   - Configure um pipeline CI/CD com AWS CodePipeline ou GitHub Actions

2. **Testes**:
   - Implemente testes unitários e de integração para as funções Lambda
   - Teste a integração entre o frontend e o backend serverless

3. **Otimização de Custos**:
   - Monitore o uso e ajuste as configurações para otimizar custos
   - Configure limites de concorrência para Lambda

4. **Backup e Recuperação**:
   - Implemente estratégias de backup para dados importantes
   - Teste cenários de recuperação de desastres

5. **Documentação**:
   - Mantenha a documentação da API atualizada
   - Documente a arquitetura e decisões de design

## Melhorias Avançadas

**📋 Consulte o arquivo `best-practices-improvements.md` para implementações detalhadas de:**

- **Segurança Aprimorada**: Autenticação JWT, KMS, WAF
- **Performance**: Otimização de cold start, caching, circuit breaker
- **Observabilidade**: Métricas customizadas, logging estruturado, tracing
- **Testes**: Estratégias de unit e integration testing
- **CI/CD**: Pipeline automatizado com GitHub Actions
- **Disaster Recovery**: Deployment multi-região
- **Cost Optimization**: Resource tagging, Lambda power tuning

**🚀 Roadmap de Implementação:**
- Fase 1: Migração básica (2 semanas)
- Fase 2: Segurança e performance (2 semanas)
- Fase 3: Observabilidade (2 semanas)
- Fase 4: Otimização final (2 semanas)