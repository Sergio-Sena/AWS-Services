const AWS = require('aws-sdk');

exports.invalidateCache = async (event, context) => {
  try {
    const { distributionId, paths, accessKey, secretKey } = JSON.parse(event.body);
    
    // Validação de parâmetros
    if (!distributionId) {
      throw new Error('Distribution ID é obrigatório');
    }
    
    if (!paths || !Array.isArray(paths) || paths.length === 0) {
      throw new Error('Paths deve ser um array não vazio');
    }
    
    // Configurar CloudFront com credenciais
    const cloudfront = new AWS.CloudFront({
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
      region: 'us-east-1'
    });
    
    // Normalizar paths
    const normalizedPaths = paths.map(path => {
      if (!path.startsWith('/')) {
        return '/' + path;
      }
      return path;
    });
    
    const params = {
      DistributionId: distributionId,
      InvalidationBatch: {
        Paths: {
          Quantity: normalizedPaths.length,
          Items: normalizedPaths
        },
        CallerReference: `cache-invalidation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
    };

    const result = await cloudfront.createInvalidation(params).promise();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, access_key, secret_key',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        invalidationId: result.Invalidation.Id,
        status: result.Invalidation.Status,
        distributionId: distributionId,
        paths: normalizedPaths,
        callerReference: params.InvalidationBatch.CallerReference,
        message: `Invalidação criada com sucesso para ${normalizedPaths.length} path(s)`
      })
    };
  } catch (error) {
    console.error('Erro na invalidação de cache:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, access_key, secret_key',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
        message: 'Erro ao invalidar cache do CloudFront'
      })
    };
  }
};

// Handler para verificar status de invalidação
exports.getInvalidationStatus = async (event, context) => {
  try {
    const { distributionId, invalidationId, accessKey, secretKey } = JSON.parse(event.body);
    
    if (!distributionId || !invalidationId) {
      throw new Error('Distribution ID e Invalidation ID são obrigatórios');
    }
    
    const cloudfront = new AWS.CloudFront({
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
      region: 'us-east-1'
    });
    
    const result = await cloudfront.getInvalidation({
      DistributionId: distributionId,
      Id: invalidationId
    }).promise();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, access_key, secret_key',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        invalidation: {
          id: result.Invalidation.Id,
          status: result.Invalidation.Status,
          createTime: result.Invalidation.CreateTime,
          paths: result.Invalidation.InvalidationBatch.Paths.Items,
          callerReference: result.Invalidation.InvalidationBatch.CallerReference
        }
      })
    };
  } catch (error) {
    console.error('Erro ao verificar status da invalidação:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
        message: 'Erro ao verificar status da invalidação'
      })
    };
  }
};

// Handler para listar invalidações
exports.listInvalidations = async (event, context) => {
  try {
    const { distributionId, accessKey, secretKey } = JSON.parse(event.body);
    
    if (!distributionId) {
      throw new Error('Distribution ID é obrigatório');
    }
    
    const cloudfront = new AWS.CloudFront({
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
      region: 'us-east-1'
    });
    
    const result = await cloudfront.listInvalidations({
      DistributionId: distributionId,
      MaxItems: '20'
    }).promise();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, access_key, secret_key',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        invalidations: result.InvalidationList.Items.map(inv => ({
          id: inv.Id,
          status: inv.Status,
          createTime: inv.CreateTime
        })),
        isTruncated: result.InvalidationList.IsTruncated
      })
    };
  } catch (error) {
    console.error('Erro ao listar invalidações:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
        message: 'Erro ao listar invalidações'
      })
    };
  }
};