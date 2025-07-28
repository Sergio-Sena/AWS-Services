# Melhorias e Melhores Práticas para Arquitetura Serverless

Este documento complementa o `serverless-deployment.md` com melhorias essenciais baseadas nas melhores práticas da AWS.

## 1. Segurança Aprimorada

### 1.1 Gerenciamento de Credenciais
```yaml
# serverless.yml - Configuração segura
provider:
  name: aws
  runtime: nodejs18.x
  region: ${opt:region, 'us-east-1'}
  environment:
    STAGE: ${self:provider.stage}
  iamRoleStatements:
    - Effect: Allow
      Action:
        - s3:GetObject
        - s3:PutObject
        - s3:DeleteObject
        - s3:ListBucket
      Resource: 
        - "arn:aws:s3:::${self:custom.bucketName}/*"
        - "arn:aws:s3:::${self:custom.bucketName}"
    - Effect: Allow
      Action:
        - kms:Decrypt
        - kms:Encrypt
      Resource: "${self:custom.kmsKeyArn}"

custom:
  bucketName: ${self:service}-${self:provider.stage}-storage
  kmsKeyArn: !GetAtt KMSKey.Arn
```

### 1.2 Autenticação com Cognito
```javascript
// handlers/auth.js - Implementação com Cognito
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

const cognito = new AWS.CognitoIdentityServiceProvider();

module.exports.handler = async (event) => {
  try {
    const { access_key, secret_key } = JSON.parse(event.body);
    
    // Validar credenciais AWS
    const s3 = new AWS.S3({
      accessKeyId: access_key,
      secretAccessKey: secret_key,
      region: process.env.AWS_REGION
    });
    
    await s3.listBuckets().promise();
    
    // Gerar token JWT temporário
    const token = jwt.sign(
      { 
        access_key: Buffer.from(access_key).toString('base64'),
        secret_key: Buffer.from(secret_key).toString('base64'),
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hora
      },
      process.env.JWT_SECRET
    );
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        success: true,
        token,
        expiresIn: 3600
      }),
    };
  } catch (error) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        success: false,
        message: 'Credenciais inválidas'
      }),
    };
  }
};
```

## 2. Performance e Otimização

### 2.1 Cold Start Optimization
```yaml
# serverless.yml - Configurações de performance
provider:
  memorySize: 512
  timeout: 30
  reservedConcurrency: 10
  provisionedConcurrency: 2

functions:
  auth:
    handler: handlers/auth.handler
    memorySize: 256
    timeout: 10
    reservedConcurrency: 5
    
  listBuckets:
    handler: handlers/buckets.handler
    memorySize: 512
    timeout: 15
    layers:
      - ${cf:aws-sdk-layer.AwsSdkLayerExport}
```

### 2.2 Caching Strategy
```javascript
// utils/cache.js
const AWS = require('aws-sdk');
const elasticache = new AWS.ElastiCache();

class CacheManager {
  constructor() {
    this.redis = require('redis').createClient({
      host: process.env.REDIS_ENDPOINT
    });
  }
  
  async get(key) {
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }
  
  async set(key, data, ttl = 300) {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }
}

module.exports = new CacheManager();
```

## 3. Monitoramento e Observabilidade

### 3.1 CloudWatch Metrics Customizadas
```javascript
// utils/metrics.js
const AWS = require('aws-sdk');
const cloudwatch = new AWS.CloudWatch();

class MetricsManager {
  async putMetric(metricName, value, unit = 'Count', dimensions = []) {
    const params = {
      Namespace: 'AWS-Services-App',
      MetricData: [{
        MetricName: metricName,
        Value: value,
        Unit: unit,
        Dimensions: dimensions,
        Timestamp: new Date()
      }]
    };
    
    try {
      await cloudwatch.putMetricData(params).promise();
    } catch (error) {
      console.error('Error putting metric:', error);
    }
  }
  
  async recordLatency(functionName, startTime) {
    const latency = Date.now() - startTime;
    await this.putMetric('FunctionLatency', latency, 'Milliseconds', [
      { Name: 'FunctionName', Value: functionName }
    ]);
  }
}

module.exports = new MetricsManager();
```

### 3.2 Structured Logging
```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'aws-services-app',
    stage: process.env.STAGE
  },
  transports: [
    new winston.transports.Console()
  ]
});

module.exports = logger;
```

## 4. Error Handling e Resilience

### 4.1 Circuit Breaker Pattern
```javascript
// utils/circuitBreaker.js
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.threshold = threshold;
    this.timeout = timeout;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }
  
  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
  
  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}

module.exports = CircuitBreaker;
```

### 4.2 Retry Logic com Exponential Backoff
```javascript
// utils/retry.js
class RetryManager {
  static async withRetry(operation, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}

module.exports = RetryManager;
```

## 5. Infrastructure as Code Melhorada

### 5.1 CloudFormation Resources
```yaml
# serverless.yml - Recursos adicionais
resources:
  Resources:
    # KMS Key para criptografia
    KMSKey:
      Type: AWS::KMS::Key
      Properties:
        Description: KMS Key for AWS Services App
        KeyPolicy:
          Statement:
            - Effect: Allow
              Principal:
                AWS: !Sub "arn:aws:iam::${AWS::AccountId}:root"
              Action: "kms:*"
              Resource: "*"
    
    # ElastiCache para caching
    CacheSubnetGroup:
      Type: AWS::ElastiCache::SubnetGroup
      Properties:
        Description: Subnet group for ElastiCache
        SubnetIds:
          - !Ref PrivateSubnet1
          - !Ref PrivateSubnet2
    
    CacheCluster:
      Type: AWS::ElastiCache::CacheCluster
      Properties:
        CacheNodeType: cache.t3.micro
        Engine: redis
        NumCacheNodes: 1
        CacheSubnetGroupName: !Ref CacheSubnetGroup
        VpcSecurityGroupIds:
          - !Ref CacheSecurityGroup
    
    # WAF para proteção
    WebACL:
      Type: AWS::WAFv2::WebACL
      Properties:
        Scope: CLOUDFRONT
        DefaultAction:
          Allow: {}
        Rules:
          - Name: RateLimitRule
            Priority: 1
            Statement:
              RateBasedStatement:
                Limit: 2000
                AggregateKeyType: IP
            Action:
              Block: {}
            VisibilityConfig:
              SampledRequestsEnabled: true
              CloudWatchMetricsEnabled: true
              MetricName: RateLimitRule
```

## 6. Testing Strategy

### 6.1 Unit Tests
```javascript
// tests/handlers/auth.test.js
const { handler } = require('../../handlers/auth');

describe('Auth Handler', () => {
  test('should return 400 for missing credentials', async () => {
    const event = {
      body: JSON.stringify({})
    };
    
    const result = await handler(event);
    
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).success).toBe(false);
  });
  
  test('should validate AWS credentials', async () => {
    const event = {
      body: JSON.stringify({
        access_key: 'valid_key',
        secret_key: 'valid_secret'
      })
    };
    
    // Mock AWS SDK
    jest.mock('aws-sdk');
    
    const result = await handler(event);
    
    expect(result.statusCode).toBe(200);
  });
});
```

### 6.2 Integration Tests
```javascript
// tests/integration/api.test.js
const axios = require('axios');

describe('API Integration Tests', () => {
  const API_URL = process.env.TEST_API_URL;
  
  test('should authenticate and list buckets', async () => {
    // Test authentication
    const authResponse = await axios.post(`${API_URL}/auth`, {
      access_key: process.env.TEST_ACCESS_KEY,
      secret_key: process.env.TEST_SECRET_KEY
    });
    
    expect(authResponse.status).toBe(200);
    
    const token = authResponse.data.token;
    
    // Test bucket listing
    const bucketsResponse = await axios.get(`${API_URL}/buckets`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    expect(bucketsResponse.status).toBe(200);
    expect(Array.isArray(bucketsResponse.data.buckets)).toBe(true);
  });
});
```

## 7. CI/CD Pipeline

### 7.1 GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run lint
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Deploy to AWS
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          npm install -g serverless
          serverless deploy --stage prod
```

## 8. Cost Optimization

### 8.1 Resource Tagging
```yaml
# serverless.yml - Tags para cost tracking
provider:
  tags:
    Project: aws-services-app
    Environment: ${self:provider.stage}
    Owner: team-name
    CostCenter: engineering
```

### 8.2 Lambda Power Tuning
```bash
# Script para otimização de custos
npm install -g aws-lambda-power-tuning
aws-lambda-power-tuning --function-name aws-services-app-dev-auth --strategy cost
```

## 9. Disaster Recovery

### 9.1 Multi-Region Deployment
```yaml
# serverless-prod.yml
provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  
custom:
  backup:
    region: us-west-2
    
resources:
  Resources:
    BackupBucket:
      Type: AWS::S3::Bucket
      Properties:
        BucketName: ${self:service}-${self:provider.stage}-backup
        ReplicationConfiguration:
          Role: !GetAtt ReplicationRole.Arn
          Rules:
            - Id: ReplicateToWest
              Status: Enabled
              Prefix: ''
              Destination:
                Bucket: !Sub "arn:aws:s3:::${self:service}-${self:provider.stage}-backup-west"
                StorageClass: STANDARD_IA
```

## 10. Implementação Gradual

### Fase 1: Migração Básica (Semana 1-2)
- [ ] Configurar infraestrutura básica
- [ ] Migrar funções core (auth, listBuckets)
- [ ] Implementar logging básico

### Fase 2: Segurança e Performance (Semana 3-4)
- [ ] Implementar autenticação JWT
- [ ] Adicionar caching com ElastiCache
- [ ] Configurar WAF e rate limiting

### Fase 3: Observabilidade (Semana 5-6)
- [ ] Implementar métricas customizadas
- [ ] Configurar alertas CloudWatch
- [ ] Adicionar distributed tracing

### Fase 4: Otimização (Semana 7-8)
- [ ] Implementar circuit breaker
- [ ] Otimizar custos com power tuning
- [ ] Configurar disaster recovery

Essas melhorias garantem uma arquitetura serverless robusta, segura e escalável seguindo as melhores práticas da AWS.