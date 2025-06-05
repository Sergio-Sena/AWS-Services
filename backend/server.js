require('dotenv').config();
const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');
const app = express();

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'access_key', 'secret_key']
}));
app.use(express.json());

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
        // Configurar AWS SDK com as credenciais fornecidas
        const s3 = new AWS.S3({
            accessKeyId: access_key,
            secretAccessKey: secret_key,
            region: 'us-east-1' // Região padrão, pode ser alterada conforme necessário
        });

        // Tentar listar buckets para verificar se as credenciais são válidas
        await s3.listBuckets().promise();

        // Se não lançar exceção, as credenciais são válidas
        return res.status(200).json({
            success: true,
            message: 'Autenticação bem-sucedida'
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
    
    console.log('Headers recebidos:', req.headers);
    console.log('Credenciais recebidas:', { access_key: access_key ? access_key.substring(0, 3) + '...' : 'undefined', secret_key: secret_key ? '***' : 'undefined' });

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
    const { access_key, secret_key } = req.headers;
    const { bucket } = req.params;
    const { prefix = '' } = req.query;

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

        const data = await s3.listObjectsV2({ 
            Bucket: bucket,
            Prefix: prefix,
            Delimiter: '/'  // Usar delimitador para simular navegação por pastas
        }).promise();
        
        return res.status(200).json({
            success: true,
            objects: data.Contents,
            prefixes: data.CommonPrefixes
        });
    } catch (error) {
        console.error(`Erro ao listar objetos do bucket ${bucket}:`, error);
        return res.status(500).json({
            success: false,
            message: `Erro ao listar objetos do bucket ${bucket}`,
            error: error.message
        });
    }
});

// Importar serviço de download
const { downloadS3Object } = require('./download-service');
const path = require('path');
const fs = require('fs');

// Rota para download de um objeto
app.get('/download/:bucket/:key(*)', async (req, res) => {
    // Tentar obter credenciais dos headers ou query params
    let access_key = req.headers['access_key'];
    let secret_key = req.headers['secret_key'];
    
    // Se não estiver nos headers, tentar nos query params
    if (!access_key || !secret_key) {
        access_key = req.query.access_token;
        secret_key = req.query.secret_token;
    }
    
    const { bucket } = req.params;
    let { key } = req.params;
    
    if (!access_key || !secret_key) {
        return res.status(400).json({ 
            success: false, 
            message: 'Credenciais não fornecidas nos headers ou query params' 
        });
    }

    try {
        // Decodificar a chave do objeto
        key = decodeURIComponent(key);
        
        // Obter o nome do arquivo da chave
        const fileName = path.basename(key);
        
        // Criar diretório de downloads se não existir
        const downloadsDir = path.join(__dirname, 'downloads');
        if (!fs.existsSync(downloadsDir)) {
            fs.mkdirSync(downloadsDir, { recursive: true });
        }
        
        // Caminho completo para o arquivo de download
        const downloadPath = path.join(downloadsDir, fileName);
        
        // Configurar cabeçalhos para download
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        
        // Configurar AWS SDK com as credenciais fornecidas
        const s3 = new AWS.S3({
            accessKeyId: access_key,
            secretAccessKey: secret_key,
            region: 'us-east-1'
        });
        
        // Criar stream do S3 diretamente para a resposta
        const s3Stream = s3.getObject({
            Bucket: bucket,
            Key: key
        }).createReadStream();
        
        // Pipe do stream do S3 para a resposta
        s3Stream.pipe(res);
        
        // Tratamento de erros
        s3Stream.on('error', (error) => {
            console.error(`Erro ao fazer download do objeto ${key}:`, error);
            // Se o cabeçalho ainda não foi enviado
            if (!res.headersSent) {
                return res.status(500).json({
                    success: false,
                    message: `Erro ao fazer download do objeto ${key}`,
                    error: error.message
                });
            }
        });
        
    } catch (error) {
        console.error(`Erro ao fazer download do objeto ${key}:`, error);
        return res.status(500).json({
            success: false,
            message: `Erro ao fazer download do objeto`,
            error: error.message
        });
    }
});

// Iniciar o servidor
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV}`);
});