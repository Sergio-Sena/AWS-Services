const request = require('supertest');
const AWS = require('aws-sdk');

// Mock serverless-http to return the app directly
jest.mock('serverless-http', () => (app) => app);

describe('S3 Routes', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    // Require app after mocks are set up
    delete require.cache[require.resolve('../../server.js')];
    const serverModule = require('../../server.js');
    app = serverModule.handler || require('express')();
  });

  describe('GET /buckets', () => {
    test('deve retornar 400 sem credenciais', async () => {
      const response = await request(app)
        .get('/buckets')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Credenciais');
    });

    test('deve retornar buckets com credenciais válidas', async () => {
      const mockBuckets = {
        Buckets: [
          { Name: 'test-bucket-1', CreationDate: new Date() },
          { Name: 'test-bucket-2', CreationDate: new Date() }
        ]
      };

      AWS.S3.mockImplementation(() => ({
        listBuckets: jest.fn().mockReturnValue({
          promise: () => Promise.resolve(mockBuckets)
        })
      }));

      const response = await request(app)
        .get('/buckets')
        .set('access_key', 'test-key')
        .set('secret_key', 'test-secret')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.buckets).toHaveLength(2);
      expect(response.body.buckets[0].Name).toBe('test-bucket-1');
    });

    test('deve retornar 500 quando AWS falha', async () => {
      AWS.S3.mockImplementation(() => ({
        listBuckets: jest.fn().mockReturnValue({
          promise: () => Promise.reject(new Error('AWS Error'))
        })
      }));

      const response = await request(app)
        .get('/buckets')
        .set('access_key', 'test-key')
        .set('secret_key', 'test-secret')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /objects/:bucket', () => {
    test('deve retornar 400 sem credenciais', async () => {
      const response = await request(app)
        .get('/objects/test-bucket')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('deve listar objetos de um bucket', async () => {
      const mockObjects = {
        Contents: [
          { Key: 'file1.txt', Size: 1024 },
          { Key: 'file2.txt', Size: 2048 }
        ],
        CommonPrefixes: [
          { Prefix: 'folder1/' }
        ]
      };

      AWS.S3.mockImplementation(() => ({
        listObjectsV2: jest.fn().mockReturnValue({
          promise: () => Promise.resolve(mockObjects)
        })
      }));

      const response = await request(app)
        .get('/objects/test-bucket')
        .set('access_key', 'test-key')
        .set('secret_key', 'test-secret')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.objects).toHaveLength(2);
      expect(response.body.prefixes).toHaveLength(1);
    });

    test('deve listar objetos com prefix', async () => {
      AWS.S3.mockImplementation(() => ({
        listObjectsV2: jest.fn().mockReturnValue({
          promise: () => Promise.resolve({ Contents: [], CommonPrefixes: [] })
        })
      }));

      const response = await request(app)
        .get('/objects/test-bucket?prefix=folder1/')
        .set('access_key', 'test-key')
        .set('secret_key', 'test-secret')
        .expect(200);

      expect(response.body.prefix).toBe('folder1/');
    });
  });

  describe('GET /bucket-size/:bucket', () => {
    test('deve calcular tamanho do bucket', async () => {
      const mockData = {
        Contents: [
          { Size: 1024 },
          { Size: 2048 },
          { Size: 512 }
        ],
        NextContinuationToken: null
      };

      AWS.S3.mockImplementation(() => ({
        listObjectsV2: jest.fn().mockReturnValue({
          promise: () => Promise.resolve(mockData)
        })
      }));

      const response = await request(app)
        .get('/bucket-size/test-bucket')
        .set('access_key', 'test-key')
        .set('secret_key', 'test-secret')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.totalSize).toBe(3584);
      expect(response.body.objectCount).toBe(3);
      expect(response.body.formattedSize).toBeDefined();
    });
  });
});
