const request = require('supertest');
const AWS = require('aws-sdk');

jest.mock('serverless-http', () => (app) => app);

describe('Auth Routes', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    delete require.cache[require.resolve('../../server.js')];
    const serverModule = require('../../server.js');
    app = serverModule.handler || require('express')();
  });

  describe('POST /auth', () => {
    test('deve retornar 400 sem credenciais', async () => {
      const response = await request(app)
        .post('/auth')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Credenciais não fornecidas');
    });

    test('deve retornar 400 sem access_key', async () => {
      const response = await request(app)
        .post('/auth')
        .send({ secret_key: 'test-secret' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('deve retornar 400 sem secret_key', async () => {
      const response = await request(app)
        .post('/auth')
        .send({ access_key: 'test-key' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('deve autenticar com credenciais válidas', async () => {
      AWS.S3.mockImplementation(() => ({
        listBuckets: jest.fn().mockReturnValue({
          promise: () => Promise.resolve({ Buckets: [] })
        })
      }));

      const response = await request(app)
        .post('/auth')
        .send({
          access_key: 'valid-key',
          secret_key: 'valid-secret'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Autenticação bem-sucedida');
      expect(response.body.redirect).toBe('aws-services.html');
    });

    test('deve retornar 401 com credenciais inválidas', async () => {
      AWS.S3.mockImplementation(() => ({
        listBuckets: jest.fn().mockReturnValue({
          promise: () => Promise.reject(new Error('InvalidAccessKeyId'))
        })
      }));

      const response = await request(app)
        .post('/auth')
        .send({
          access_key: 'invalid-key',
          secret_key: 'invalid-secret'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Credenciais inválidas');
    });
  });

  describe('GET /health', () => {
    test('deve retornar status ok', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
    });
  });
});
