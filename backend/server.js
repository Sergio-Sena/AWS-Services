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

// Iniciar o servidor
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV}`);
});