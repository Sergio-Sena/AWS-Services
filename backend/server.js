require('dotenv').config();
const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');
const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8000', '*'],
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'access_key', 'secret_key'],
    exposedHeaders: ['Content-Disposition']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar handlers Lambda
const { getUploadUrl, getCompressionStatus } = require('./handlers/imageCompression');

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

// Rotas Lambda
app.post('/lambda/image-upload-url', async (req, res) => {
    const event = {
        headers: req.headers,
        body: JSON.stringify(req.body)
    };
    
    const result = await getUploadUrl(event);
    res.status(result.statusCode).set(result.headers || {}).json(JSON.parse(result.body));
});

app.get('/lambda/compression-status/:bucket/:key(*)', async (req, res) => {
    const event = {
        headers: req.headers,
        pathParameters: req.params
    };
    
    const result = await getCompressionStatus(event);
    res.status(result.statusCode).set(result.headers || {}).json(JSON.parse(result.body));
});

// Iniciar o servidor
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV}`);
});