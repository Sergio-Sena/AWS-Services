const request = require('supertest');
const AWS = require('aws-sdk');

jest.mock('serverless-http', () => (app) => app);

describe('EC2 Routes', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    delete require.cache[require.resolve('../../server.js')];
    const serverModule = require('../../server.js');
    app = serverModule.handler || require('express')();
  });

  describe('GET /api/ec2/instances', () => {
    test('deve retornar 400 sem credenciais', async () => {
      const response = await request(app)
        .get('/api/ec2/instances')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Credenciais');
    });

    test('deve retornar instâncias reais quando existem', async () => {
      const mockInstances = {
        Reservations: [
          {
            Instances: [
              {
                InstanceId: 'i-1234567890abcdef0',
                InstanceType: 't3.micro',
                State: { Name: 'running', Code: 16 },
                PublicIpAddress: '54.123.45.67',
                PrivateIpAddress: '10.0.1.100',
                LaunchTime: new Date(),
                Tags: [{ Key: 'Name', Value: 'Web Server' }]
              }
            ]
          }
        ]
      };

      AWS.EC2.mockImplementation(() => ({
        describeInstances: jest.fn().mockReturnValue({
          promise: () => Promise.resolve(mockInstances)
        })
      }));

      const response = await request(app)
        .get('/api/ec2/instances')
        .set('access_key', 'test-key')
        .set('secret_key', 'test-secret')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.instances).toHaveLength(1);
      expect(response.body.instances[0].InstanceId).toBe('i-1234567890abcdef0');
      expect(response.body.realCount).toBe(1);
      expect(response.body.demoCount).toBe(0);
    });

    test('deve retornar instâncias demo quando não há instâncias reais', async () => {
      const mockEmptyInstances = {
        Reservations: []
      };

      AWS.EC2.mockImplementation(() => ({
        describeInstances: jest.fn().mockReturnValue({
          promise: () => Promise.resolve(mockEmptyInstances)
        })
      }));

      const response = await request(app)
        .get('/api/ec2/instances')
        .set('access_key', 'test-key')
        .set('secret_key', 'test-secret')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.instances.length).toBeGreaterThan(0);
      expect(response.body.instances[0].isDemo).toBe(true);
      expect(response.body.instances[0].InstanceId).toContain('demo-');
      expect(response.body.realCount).toBe(0);
      expect(response.body.demoCount).toBeGreaterThan(0);
    });

    test('deve retornar 500 quando AWS falha', async () => {
      AWS.EC2.mockImplementation(() => ({
        describeInstances: jest.fn().mockReturnValue({
          promise: () => Promise.reject(new Error('AWS Error'))
        })
      }));

      const response = await request(app)
        .get('/api/ec2/instances')
        .set('access_key', 'test-key')
        .set('secret_key', 'test-secret')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/ec2/manage', () => {
    test('deve gerenciar instância EC2', async () => {
      // Mock do handler
      jest.mock('../../handlers/ec2Management', () => ({
        manageInstance: jest.fn().mockResolvedValue({
          statusCode: 200,
          body: JSON.stringify({ success: true, message: 'Instance started' })
        })
      }));

      const response = await request(app)
        .post('/api/ec2/manage')
        .send({
          action: 'start',
          instanceId: 'i-1234567890abcdef0',
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
