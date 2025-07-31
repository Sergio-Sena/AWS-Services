// Carregar dotenv apenas em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');
const serverless = require('serverless-http');
const app = express();

// Middleware
app.use(cors({
    origin: [
        'http://localhost:3000', 
        'http://localhost:8000', 
        'https://aws-services.sstechnologies-cloud.com',
        'https://d1gsuffpry1o53.cloudfront.net',
        '*'
    ],
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'access_key', 'secret_key'],
    exposedHeaders: ['Content-Disposition'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar multer para upload de arquivos
const multer = require('multer');

// Rota de autenticação
app.post('/auth', async (req, res) => {
    const { access_key, secret_key } = req.body;

    if (!access_key || !secret_key) {
        return res.status(400).json({ 
            success: false, 
            message: 'Credenciais não fornecidas' 
        });
    }

    try {
        const s3 = new AWS.S3({
            accessKeyId: access_key,
            secretAccessKey: secret_key,
            region: 'us-east-1'
        });

        await s3.listBuckets().promise();

        return res.status(200).json({
            success: true,
            message: 'Autenticação bem-sucedida',
            redirect: 'aws-services.html'
        });
    } catch (error) {
        console.error('Erro de autenticação:', error);
        return res.status(401).json({
            success: false,
            message: 'Credenciais inválidas',
            error: error.message
        });
    }
});

// Rota para listar buckets
app.get('/buckets', async (req, res) => {
    const access_key = req.headers['access_key'];
    const secret_key = req.headers['secret_key'];
    
    if (!access_key || !secret_key) {
        return res.status(400).json({ 
            success: false, 
            message: 'Credenciais não fornecidas nos headers' 
        });
    }

    try {
        const s3 = new AWS.S3({
            accessKeyId: access_key,
            secretAccessKey: secret_key,
            region: 'us-east-1'
        });

        const data = await s3.listBuckets().promise();
        
        return res.status(200).json({
            success: true,
            buckets: data.Buckets
        });
    } catch (error) {
        console.error('Erro ao listar buckets:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao listar buckets',
            error: error.message
        });
    }
});

// Rota para listar objetos de um bucket
app.get('/objects/:bucket', async (req, res) => {
    const access_key = req.headers['access_key'];
    const secret_key = req.headers['secret_key'];
    const { bucket } = req.params;
    const { prefix } = req.query;
    
    if (!access_key || !secret_key) {
        return res.status(400).json({ 
            success: false, 
            message: 'Credenciais não fornecidas nos headers' 
        });
    }

    try {
        const s3 = new AWS.S3({
            accessKeyId: access_key,
            secretAccessKey: secret_key,
            region: 'us-east-1'
        });

        const params = {
            Bucket: bucket,
            Delimiter: '/'
        };
        
        if (prefix) {
            params.Prefix = prefix;
        }

        const data = await s3.listObjectsV2(params).promise();
        
        return res.status(200).json({
            success: true,
            objects: data.Contents || [],
            prefixes: data.CommonPrefixes || [],
            bucket: bucket,
            prefix: prefix || ''
        });
    } catch (error) {
        console.error('Erro ao listar objetos:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao listar objetos',
            error: error.message
        });
    }
});

// Rota para upload de arquivos
app.post('/upload/:bucket', require('multer')().array('files'), async (req, res) => {
    const access_key = req.headers['access_key'];
    const secret_key = req.headers['secret_key'];
    const { bucket } = req.params;
    const { prefix } = req.body;
    
    if (!access_key || !secret_key) {
        return res.status(400).json({ 
            success: false, 
            message: 'Credenciais não fornecidas nos headers' 
        });
    }

    try {
        const s3 = new AWS.S3({
            accessKeyId: access_key,
            secretAccessKey: secret_key,
            region: 'us-east-1'
        });

        const uploadPromises = req.files.map(file => {
            const key = prefix ? `${prefix}${file.originalname}` : file.originalname;
            return s3.upload({
                Bucket: bucket,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype
            }).promise();
        });

        const results = await Promise.all(uploadPromises);
        
        return res.status(200).json({
            success: true,
            message: `${req.files.length} arquivo(s) enviado(s) com sucesso`,
            results
        });
    } catch (error) {
        console.error('Erro ao fazer upload:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao fazer upload',
            error: error.message
        });
    }
});

// Rota para download de objeto
app.get('/download/:bucket/:key(*)', async (req, res) => {
    const access_key = req.headers['access_key'];
    const secret_key = req.headers['secret_key'];
    const { bucket, key } = req.params;
    
    if (!access_key || !secret_key) {
        return res.status(400).json({ 
            success: false, 
            message: 'Credenciais não fornecidas nos headers' 
        });
    }

    try {
        const s3 = new AWS.S3({
            accessKeyId: access_key,
            secretAccessKey: secret_key,
            region: 'us-east-1'
        });

        const data = await s3.getObject({
            Bucket: bucket,
            Key: decodeURIComponent(key)
        }).promise();
        
        res.set({
            'Content-Type': data.ContentType || 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${key.split('/').pop()}"`
        });
        
        return res.send(data.Body);
    } catch (error) {
        console.error('Erro ao fazer download:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao fazer download',
            error: error.message
        });
    }
});

// Rota para obter tamanho do bucket
app.get('/bucket-size/:bucket', async (req, res) => {
    const access_key = req.headers['access_key'];
    const secret_key = req.headers['secret_key'];
    const { bucket } = req.params;
    
    if (!access_key || !secret_key) {
        return res.status(400).json({ 
            success: false, 
            message: 'Credenciais não fornecidas nos headers' 
        });
    }

    try {
        const s3 = new AWS.S3({
            accessKeyId: access_key,
            secretAccessKey: secret_key,
            region: 'us-east-1'
        });

        let totalSize = 0;
        let objectCount = 0;
        let continuationToken = null;

        do {
            const params = {
                Bucket: bucket,
                MaxKeys: 1000
            };
            
            if (continuationToken) {
                params.ContinuationToken = continuationToken;
            }

            const data = await s3.listObjectsV2(params).promise();
            
            data.Contents.forEach(obj => {
                totalSize += obj.Size;
                objectCount++;
            });
            
            continuationToken = data.NextContinuationToken;
        } while (continuationToken);
        
        return res.status(200).json({
            success: true,
            bucket: bucket,
            totalSize: totalSize,
            objectCount: objectCount,
            formattedSize: formatBytes(totalSize)
        });
    } catch (error) {
        console.error('Erro ao obter tamanho do bucket:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao obter tamanho do bucket',
            error: error.message
        });
    }
});

// Função auxiliar para formatar bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Rota Lambda isolada
app.post('/api/compress-image', express.json(), async (req, res) => {
    try {
        const { compressImage } = require('./handlers/imageCompression');
        const event = { body: JSON.stringify(req.body) };
        const result = await compressImage(event);
        
        res.status(result.statusCode).json(JSON.parse(result.body));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rotas EC2 isoladas
app.get('/api/ec2/instances', async (req, res) => {
    const access_key = req.headers['access_key'];
    const secret_key = req.headers['secret_key'];
    
    if (!access_key || !secret_key) {
        return res.status(400).json({ 
            success: false, 
            message: 'Credenciais não fornecidas nos headers' 
        });
    }

    try {
        const ec2 = new AWS.EC2({
            accessKeyId: access_key,
            secretAccessKey: secret_key,
            region: 'us-east-1'
        });

        const data = await ec2.describeInstances().promise();
        
        const instances = [];
        data.Reservations.forEach(reservation => {
            reservation.Instances.forEach(instance => {
                instances.push({
                    InstanceId: instance.InstanceId,
                    InstanceType: instance.InstanceType,
                    State: instance.State,
                    PublicIpAddress: instance.PublicIpAddress,
                    PrivateIpAddress: instance.PrivateIpAddress,
                    LaunchTime: instance.LaunchTime,
                    Tags: instance.Tags || []
                });
            });
        });
        
        // Se não houver instâncias reais, adicionar demos
        if (instances.length === 0) {
            instances.push(
                {
                    InstanceId: 'demo-i-1234567890abcdef0',
                    InstanceType: 't3.micro',
                    State: { Name: 'running', Code: 16 },
                    PublicIpAddress: '54.123.45.67',
                    PrivateIpAddress: '10.0.1.100',
                    LaunchTime: new Date(Date.now() - 86400000).toISOString(),
                    Tags: [{ Key: 'Name', Value: 'Demo Web Server' }],
                    isDemo: true
                },
                {
                    InstanceId: 'demo-i-0987654321fedcba0',
                    InstanceType: 't3.small',
                    State: { Name: 'stopped', Code: 80 },
                    PublicIpAddress: null,
                    PrivateIpAddress: '10.0.1.101',
                    LaunchTime: new Date(Date.now() - 172800000).toISOString(),
                    Tags: [{ Key: 'Name', Value: 'Demo Database Server' }],
                    isDemo: true
                }
            );
        }
        
        return res.status(200).json({
            success: true,
            instances,
            realCount: instances.filter(i => !i.isDemo).length,
            demoCount: instances.filter(i => i.isDemo).length
        });
    } catch (error) {
        console.error('Erro ao listar instâncias EC2:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao listar instâncias EC2',
            error: error.message
        });
    }
});

app.post('/api/ec2/manage', express.json(), async (req, res) => {
    try {
        const { manageInstance } = require('./handlers/ec2Management');
        const event = { body: JSON.stringify(req.body) };
        const result = await manageInstance(event);
        
        res.status(result.statusCode).json(JSON.parse(result.body));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rotas DynamoDB isoladas
app.get('/api/dynamodb/tables', async (req, res) => {
    const access_key = req.headers['access_key'];
    const secret_key = req.headers['secret_key'];
    
    if (!access_key || !secret_key) {
        return res.status(400).json({ 
            success: false, 
            message: 'Credenciais não fornecidas nos headers' 
        });
    }

    try {
        const { listTables } = require('./handlers/dynamoManagement');
        const event = { credentials: { accessKey: access_key, secretKey: secret_key } };
        const result = await listTables(event);
        
        res.status(result.statusCode).json(JSON.parse(result.body));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/dynamodb/operation', express.json(), async (req, res) => {
    try {
        const { tableOperation } = require('./handlers/dynamoManagement');
        const event = { body: JSON.stringify(req.body) };
        const result = await tableOperation(event);
        
        res.status(result.statusCode).json(JSON.parse(result.body));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rotas CloudFront isoladas
app.get('/api/cloudfront/distributions', async (req, res) => {
    const access_key = req.headers['access_key'];
    const secret_key = req.headers['secret_key'];
    
    if (!access_key || !secret_key) {
        return res.status(400).json({ 
            success: false, 
            message: 'Credenciais não fornecidas nos headers' 
        });
    }

    try {
        const { listDistributions } = require('./handlers/cloudFrontManagement');
        const event = { credentials: { accessKey: access_key, secretKey: secret_key } };
        const result = await listDistributions(event);
        
        res.status(result.statusCode).json(JSON.parse(result.body));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/cloudfront/operation', express.json(), async (req, res) => {
    try {
        const { distributionOperation } = require('./handlers/cloudFrontManagement');
        const event = { body: JSON.stringify(req.body) };
        const result = await distributionOperation(event);
        
        res.status(result.statusCode).json(JSON.parse(result.body));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rotas Calculadora AWS isoladas
app.get('/api/billing/info', async (req, res) => {
    const access_key = req.headers['access_key'];
    const secret_key = req.headers['secret_key'];
    
    if (!access_key || !secret_key) {
        return res.status(400).json({ 
            success: false, 
            message: 'Credenciais não fornecidas nos headers' 
        });
    }

    try {
        const { getBillingInfo } = require('./handlers/billingCalculator');
        const event = { credentials: { accessKey: access_key, secretKey: secret_key } };
        const result = await getBillingInfo(event);
        
        res.status(result.statusCode).json(JSON.parse(result.body));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/billing/exchange-rate', async (req, res) => {
    try {
        const { getExchangeRate } = require('./handlers/billingCalculator');
        const event = {};
        const result = await getExchangeRate(event);
        
        res.status(result.statusCode).json(JSON.parse(result.body));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rotas RDS isoladas
app.get('/api/rds/instances', async (req, res) => {
    const access_key = req.headers['access_key'];
    const secret_key = req.headers['secret_key'];
    
    if (!access_key || !secret_key) {
        return res.status(400).json({ 
            success: false, 
            message: 'Credenciais não fornecidas nos headers' 
        });
    }

    try {
        const { listInstances } = require('./handlers/rdsManagement');
        const event = { credentials: { accessKey: access_key, secretKey: secret_key } };
        const result = await listInstances(event);
        
        res.status(result.statusCode).json(JSON.parse(result.body));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/rds/operation', express.json(), async (req, res) => {
    try {
        const { instanceOperation } = require('./handlers/rdsManagement');
        const event = { body: JSON.stringify(req.body) };
        const result = await instanceOperation(event);
        
        res.status(result.statusCode).json(JSON.parse(result.body));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/rds/connect', express.json(), async (req, res) => {
    const access_key = req.headers['access_key'];
    const secret_key = req.headers['secret_key'];
    
    if (!access_key || !secret_key) {
        return res.status(400).json({ 
            success: false, 
            message: 'Credenciais não fornecidas nos headers' 
        });
    }

    try {
        const { connectAndListData } = require('./handlers/rdsManagement');
        const event = { 
            body: JSON.stringify(req.body),
            credentials: { accessKey: access_key, secretKey: secret_key }
        };
        const result = await connectAndListData(event);
        
        res.status(result.statusCode).json(JSON.parse(result.body));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        stage: process.env.STAGE || 'local',
        timestamp: new Date().toISOString()
    });
});

// Export para Lambda
const handler = serverless(app);
module.exports = { handler };

// Iniciar o servidor localmente (apenas se não for Lambda)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
        console.log(`Ambiente: ${process.env.NODE_ENV}`);
    });
}