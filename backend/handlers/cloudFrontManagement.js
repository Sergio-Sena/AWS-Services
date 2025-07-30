const AWS = require('aws-sdk');

// Handler para listagem de distribuições CloudFront
exports.listDistributions = async (event) => {
    try {
        const { accessKey, secretKey } = event.credentials;
        
        const cloudfront = new AWS.CloudFront({
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
            region: 'us-east-1'
        });

        // Tentar listar distribuições reais
        let realDistributions = [];
        try {
            const data = await cloudfront.listDistributions().promise();
            realDistributions = data.DistributionList?.Items || [];
        } catch (error) {
            console.log('Sem distribuições reais ou erro de acesso:', error.message);
        }

        // Distribuições demo
        const demoDistributions = [
            {
                Id: 'demo-E1234567890ABC',
                DomainName: 'd1234567890abc.cloudfront.net',
                Aliases: {
                    Quantity: 2,
                    Items: ['www.exemplo.com', 'exemplo.com']
                },
                Status: 'Deployed',
                Enabled: true,
                Origins: {
                    Quantity: 1,
                    Items: [{
                        DomainName: 'exemplo.s3.amazonaws.com',
                        Id: 'S3-exemplo'
                    }]
                },
                Comment: 'Demo - Site principal',
                LastModifiedTime: new Date(Date.now() - 86400000),
                isDemo: true
            },
            {
                Id: 'demo-E0987654321DEF',
                DomainName: 'd0987654321def.cloudfront.net',
                Aliases: {
                    Quantity: 1,
                    Items: ['api.exemplo.com']
                },
                Status: 'Deployed',
                Enabled: true,
                Origins: {
                    Quantity: 1,
                    Items: [{
                        DomainName: 'api-gateway.us-east-1.amazonaws.com',
                        Id: 'API-Gateway'
                    }]
                },
                Comment: 'Demo - API Gateway',
                LastModifiedTime: new Date(Date.now() - 172800000),
                isDemo: true
            }
        ];

        // Processar distribuições reais
        const processedReal = realDistributions.map(dist => ({
            ...dist,
            isDemo: false
        }));

        const allDistributions = [...processedReal, ...demoDistributions];

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                success: true,
                distributions: allDistributions,
                realCount: processedReal.length,
                demoCount: demoDistributions.length,
                message: 'Distribuições CloudFront listadas com sucesso'
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ 
                error: error.message,
                message: 'Erro ao listar distribuições CloudFront'
            })
        };
    }
};

// Handler para operações em distribuições
exports.distributionOperation = async (event) => {
    try {
        const { distributionId, operation } = JSON.parse(event.body);
        
        // Operações permitidas apenas em distribuições demo
        if (!distributionId.startsWith('demo-')) {
            throw new Error('Operações permitidas apenas em distribuições demo');
        }

        const operations = {
            invalidate: {
                message: 'Cache invalidado com sucesso (simulado)',
                paths: ['/*', '/index.html', '/assets/*'],
                invalidationId: `I${Date.now()}`
            },
            disable: {
                message: 'Distribuição desabilitada (simulado)',
                status: 'InProgress'
            },
            enable: {
                message: 'Distribuição habilitada (simulado)',
                status: 'InProgress'
            }
        };

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                success: true,
                operation: operation,
                result: operations[operation],
                message: `Operação ${operation} simulada com sucesso`
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: error.message })
        };
    }
};