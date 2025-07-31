const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const { downloadBucket, downloadMultipleObjects } = require('./download-bucket-service');
const { invalidateCache } = require('./handlers/cacheInvalidation');

// Configurar CORS para as rotas
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, access_key, secret_key');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Expose-Headers', 'Content-Disposition');
  next();
});

// Rota para verificar se o serviço de download está funcionando
router.get('/download-status', (req, res) => {
    res.json({ status: 'ok', message: 'Serviço de download está funcionando' });
});

// Rota para download de um bucket inteiro
router.get('/download-bucket/:bucket', async (req, res) => {
    // Tentar obter credenciais dos headers ou query params
    let access_key = req.headers['access_key'];
    let secret_key = req.headers['secret_key'];
    
    // Se não estiver nos headers, tentar nos query params
    if (!access_key || !secret_key) {
        access_key = req.query.access_token;
        secret_key = req.query.secret_token;
    }
    
    const { bucket } = req.params;
    
    if (!access_key || !secret_key) {
        return res.status(400).json({ 
            success: false, 
            message: 'Credenciais não fornecidas nos headers ou query params' 
        });
    }

    try {
        console.log(`Iniciando download do bucket ${bucket}`);
        // Fazer download do bucket como ZIP
        await downloadBucket(access_key, secret_key, bucket, res);
    } catch (error) {
        console.error(`Erro ao fazer download do bucket ${bucket}:`, error);
        // Se o cabeçalho ainda não foi enviado
        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: `Erro ao fazer download do bucket`,
                error: error.message
            });
        }
    }
});

// Rota para download de múltiplos objetos
router.post('/download-multiple/:bucket', express.json(), async (req, res) => {
    // Tentar obter credenciais dos headers ou query params
    let access_key = req.headers['access_key'];
    let secret_key = req.headers['secret_key'];
    
    // Se não estiver nos headers, tentar nos query params
    if (!access_key || !secret_key) {
        access_key = req.query.access_token;
        secret_key = req.query.secret_token;
    }
    
    const { bucket } = req.params;
    const { keys } = req.body;
    
    if (!access_key || !secret_key || !keys || !Array.isArray(keys) || keys.length === 0) {
        return res.status(400).json({ 
            success: false, 
            message: 'Parâmetros inválidos' 
        });
    }

    try {
        console.log(`Iniciando download de ${keys.length} objetos do bucket ${bucket}`);
        // Fazer download dos objetos como ZIP
        await downloadMultipleObjects(access_key, secret_key, bucket, keys, res);
    } catch (error) {
        console.error(`Erro ao fazer download de múltiplos objetos:`, error);
        // Se o cabeçalho ainda não foi enviado
        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: `Erro ao fazer download de múltiplos objetos`,
                error: error.message
            });
        }
    }
});

// Rota para invalidação de cache do CloudFront
router.post('/invalidate-cache', express.json(), async (req, res) => {
    const access_key = req.headers['access_key'];
    const secret_key = req.headers['secret_key'];
    
    if (!access_key || !secret_key) {
        return res.status(400).json({ 
            success: false, 
            message: 'Credenciais não fornecidas nos headers' 
        });
    }
    
    const requestBody = {
        ...req.body,
        accessKey: access_key,
        secretKey: secret_key
    };
    
    const event = { body: JSON.stringify(requestBody) };
    const result = await invalidateCache(event, {});
    
    res.status(result.statusCode).json(JSON.parse(result.body));
});

// Rota para verificar status de invalidação
router.post('/invalidation-status', express.json(), async (req, res) => {
    const access_key = req.headers['access_key'];
    const secret_key = req.headers['secret_key'];
    
    if (!access_key || !secret_key) {
        return res.status(400).json({ 
            success: false, 
            message: 'Credenciais não fornecidas nos headers' 
        });
    }
    
    const { getInvalidationStatus } = require('./handlers/cacheInvalidation');
    const requestBody = {
        ...req.body,
        accessKey: access_key,
        secretKey: secret_key
    };
    
    const event = { body: JSON.stringify(requestBody) };
    const result = await getInvalidationStatus(event, {});
    
    res.status(result.statusCode).json(JSON.parse(result.body));
});

// Rota para listar invalidações
router.post('/list-invalidations', express.json(), async (req, res) => {
    const access_key = req.headers['access_key'];
    const secret_key = req.headers['secret_key'];
    
    if (!access_key || !secret_key) {
        return res.status(400).json({ 
            success: false, 
            message: 'Credenciais não fornecidas nos headers' 
        });
    }
    
    const { listInvalidations } = require('./handlers/cacheInvalidation');
    const requestBody = {
        ...req.body,
        accessKey: access_key,
        secretKey: secret_key
    };
    
    const event = { body: JSON.stringify(requestBody) };
    const result = await listInvalidations(event, {});
    
    res.status(result.statusCode).json(JSON.parse(result.body));
});

module.exports = router;