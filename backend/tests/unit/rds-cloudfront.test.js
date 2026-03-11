const request = require('supertest');

jest.mock('serverless-http', () => (app) => app);

describe('RDS Routes', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    delete require.cache[require.resolve('../../server.js')];
    
    jest.mock('../../handlers/rdsManagement', () => ({
      listInstances: jest.fn().mockResolvedValue({
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          instances: [
            { id: 'demo-db', engine: 'postgres', status: 'available' }
          ]
        })
      }),
      instanceOperation: jest.fn().mockResolvedValue({
        statusCode: 200,
        body: JSON.stringify({ success: true })
      })
    }));

    const serverModule = require('../../server.js');
    app = serverModule.handler || require('express')();
  });

  describe('GET /api/rds/instances', () => {
    test('deve retornar 400 sem credenciais', async () => {
      const response = await request(app)
        .get('/api/rds/instances')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('deve listar instâncias RDS', async () => {
      const response = await request(app)
        .get('/api/rds/instances')
        .set('access_key', 'test-key')
        .set('secret_key', 'test-secret')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.instances).toBeDefined();
    });
  });
});

describe('CloudFront Routes', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    delete require.cache[require.resolve('../../server.js')];
    
    jest.mock('../../handlers/cloudFrontManagement', () => ({
      listDistributions: jest.fn().mockResolvedValue({
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          distributions: [
            { id: 'E123DEMO', domainName: 'd123.cloudfront.net', status: 'Deployed' }
          ]
        })
      }),
      distributionOperation: jest.fn().mockResolvedValue({
        statusCode: 200,
        body: JSON.stringify({ success: true })
      })
    }));

    const serverModule = require('../../server.js');
    app = serverModule.handler || require('express')();
  });

  describe('GET /api/cloudfront/distributions', () => {
    test('deve retornar 400 sem credenciais', async () => {
      const response = await request(app)
        .get('/api/cloudfront/distributions')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('deve listar distribuições CloudFront', async () => {
      const response = await request(app)
        .get('/api/cloudfront/distributions')
        .set('access_key', 'test-key')
        .set('secret_key', 'test-secret')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.distributions).toBeDefined();
    });
  });
});
