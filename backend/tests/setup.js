// Mock AWS SDK
jest.mock('aws-sdk', () => {
  const mockS3 = {
    listBuckets: jest.fn(),
    listObjectsV2: jest.fn(),
    getObject: jest.fn(),
    upload: jest.fn()
  };

  const mockEC2 = {
    describeInstances: jest.fn(),
    startInstances: jest.fn(),
    stopInstances: jest.fn(),
    rebootInstances: jest.fn()
  };

  const mockDynamoDB = {
    listTables: jest.fn(),
    scan: jest.fn(),
    putItem: jest.fn()
  };

  const mockRDS = {
    describeDBInstances: jest.fn(),
    startDBInstance: jest.fn(),
    stopDBInstance: jest.fn()
  };

  const mockCloudFront = {
    listDistributions: jest.fn(),
    createInvalidation: jest.fn()
  };

  return {
    S3: jest.fn(() => mockS3),
    EC2: jest.fn(() => mockEC2),
    DynamoDB: jest.fn(() => mockDynamoDB),
    RDS: jest.fn(() => mockRDS),
    CloudFront: jest.fn(() => mockCloudFront),
    config: {
      update: jest.fn()
    }
  };
});

// Suppress console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};
