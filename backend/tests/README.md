# 🧪 Backend Node.js - Testes

Testes automatizados para o backend Node.js usando Jest + Supertest.

## 📋 Estrutura

```
tests/
├── setup.js              # Configuração global (mocks AWS SDK)
└── unit/
    ├── auth.test.js      # Testes de autenticação
    ├── s3.test.js        # Testes rotas S3
    ├── ec2.test.js       # Testes rotas EC2 (com fallback demo)
    ├── dynamodb.test.js  # Testes rotas DynamoDB
    └── rds-cloudfront.test.js  # Testes RDS + CloudFront
```

## 🚀 Executar Testes

### **Instalar dependências**
```bash
npm install
```

### **Rodar todos os testes**
```bash
npm test
```

### **Rodar com watch mode**
```bash
npm run test:watch
```

### **Rodar para CI/CD**
```bash
npm run test:ci
```

## 📊 Coverage

Os testes geram relatório de cobertura em `coverage/`:

```bash
npm test
# Abre coverage/lcov-report/index.html no navegador
```

**Meta de cobertura**: 50%+ (configurado em jest.config.js)

## ✅ O Que É Testado

### **1. Validação de Entrada**
- Headers de credenciais (access_key, secret_key)
- Body de requisições POST
- Parâmetros de URL

### **2. Estrutura de Resposta**
- Campos obrigatórios (success, message, data)
- Tipos de dados corretos
- Códigos HTTP apropriados

### **3. Fallback Demo**
- EC2 retorna instâncias demo quando não há reais
- Marca instâncias com `isDemo: true`
- Conta real vs demo separadamente

### **4. Tratamento de Erros**
- AWS SDK errors
- Credenciais inválidas
- Recursos não encontrados

### **5. Mocks AWS SDK**
- Não chama AWS de verdade
- Simula respostas AWS
- Testa lógica de negócio isoladamente

## 🎯 Exemplos de Testes

### **Teste de Autenticação**
```javascript
test('deve autenticar com credenciais válidas', async () => {
  const response = await request(app)
    .post('/auth')
    .send({
      access_key: 'valid-key',
      secret_key: 'valid-secret'
    })
    .expect(200);

  expect(response.body.success).toBe(true);
});
```

### **Teste de Fallback Demo**
```javascript
test('deve retornar instâncias demo quando não há reais', async () => {
  // Mock AWS retornando vazio
  AWS.EC2.mockImplementation(() => ({
    describeInstances: () => ({
      promise: () => Promise.resolve({ Reservations: [] })
    })
  }));

  const response = await request(app)
    .get('/api/ec2/instances')
    .set('access_key', 'test')
    .set('secret_key', 'test');

  expect(response.body.instances[0].isDemo).toBe(true);
  expect(response.body.demoCount).toBeGreaterThan(0);
});
```

### **Teste de Erro AWS**
```javascript
test('deve retornar 500 quando AWS falha', async () => {
  AWS.S3.mockImplementation(() => ({
    listBuckets: () => ({
      promise: () => Promise.reject(new Error('AWS Error'))
    })
  }));

  const response = await request(app)
    .get('/buckets')
    .set('access_key', 'test')
    .set('secret_key', 'test')
    .expect(500);

  expect(response.body.success).toBe(false);
});
```

## 🐛 Troubleshooting

### **Erro: Cannot find module**
```bash
npm install
```

### **Testes falhando**
```bash
# Limpar cache do Jest
npm test -- --clearCache

# Rodar teste específico
npm test -- auth.test.js
```

### **Coverage baixo**
- Adicionar mais casos de teste
- Testar edge cases
- Testar caminhos de erro

## 📝 Adicionar Novos Testes

1. Criar arquivo em `tests/unit/`
2. Importar `supertest` e `AWS`
3. Mockar AWS SDK se necessário
4. Escrever testes com `describe` e `test`
5. Rodar `npm test`

## 🎯 Próximos Passos

- [ ] Aumentar coverage para 80%+
- [ ] Adicionar testes de integração
- [ ] Adicionar testes E2E
- [ ] Configurar CI/CD para rodar testes

---

**Desenvolvido com ❤️ usando Jest + Supertest**
