const request = require('supertest');

jest.mock('serverless-http', () => (app) => app);

describe('DynamoDB Routes', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    delete require.cache[require.resolve('../../server.js')];
    
    // Mock handlers
    jest.mock('../../handlers/dynamoManagement', () => ({
      listTables: jest.fn().mockResolvedValue({
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          tables: ['demo-table-1', 'demo-table-2']
        })
      }),
      tableOperation: jest.fn().mockResolvedValue({
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          items: [{ id: '1', name: 'Test Item' }]
        })
      })
    }));

    const serverModule = require('../../server.js');
    app = serverModule.handler || require('express')();
  });

  describe('GET /api/dynamodb/tables', () => {
    test('deve retornar 400 sem credenciais', async () => {
      const response = await request(app)
        .get('/api/dynamodb/tables')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Credenciais');
    });

    test('deve listar tabelas DynamoDB', async () => {
      const response = await request(app)
        .get('/api/dynamodb/tables')
        .set('access_key', 'test-key')
        .set('secret_key', 'test-secret')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.tables).toBeDefined();
    });
  });

  describe('POST /api/dynamodb/operation', () => {
    test('deve executar operação na tabela', async () => {
      const response = await request(app)
        .post('/api/dynamodb/operation')
        .send({
          operation: 'scan',
          tableName: 'test-table',
          credentials: {
            accessKey: 'test-key',
            secretKey: 'test-secret'
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
