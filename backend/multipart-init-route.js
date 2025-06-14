const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const { initiateMultipartUpload, uploadPart, completeMultipartUpload, abortMultipartUpload } = require('./multipart-upload-service');

// Rota para iniciar um upload multipart
router.post('/multipart/init', async (req, res) => {
  try {
    const { access_key, secret_key } = req.headers;
    const { bucket, key } = req.body;
    
    if (!access_key || !secret_key || !bucket || !key) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros inválidos'
      });
    }
    
    const result = await initiateMultipartUpload(access_key, secret_key, bucket, key);
    
    res.json({
      success: true,
      uploadId: result.uploadId,
      key: result.key
    });
  } catch (error) {
    console.error('Erro ao iniciar upload multipart:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Rota para fazer upload de uma parte
router.post('/multipart/part', express.raw({ limit: '10mb', type: '*/*' }), async (req, res) => {
  try {
    const { access_key, secret_key } = req.headers;
    const { bucket, key, uploadId, partNumber } = req.query;
    
    if (!access_key || !secret_key || !bucket || !key || !uploadId || !partNumber) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros inválidos'
      });
    }
    
    const result = await uploadPart(
      access_key,
      secret_key,
      bucket,
      key,
      uploadId,
      parseInt(partNumber),
      req.body
    );
    
    res.json({
      success: true,
      partNumber: result.partNumber,
      ETag: result.ETag
    });
  } catch (error) {
    console.error('Erro ao fazer upload de parte:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Rota para completar um upload multipart
router.post('/multipart/complete', async (req, res) => {
  try {
    const { access_key, secret_key } = req.headers;
    const { bucket, key, uploadId, parts } = req.body;
    
    if (!access_key || !secret_key || !bucket || !key || !uploadId || !parts) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros inválidos'
      });
    }
    
    const result = await completeMultipartUpload(
      access_key,
      secret_key,
      bucket,
      key,
      uploadId,
      parts
    );
    
    res.json({
      success: true,
      location: result.location,
      key: result.key,
      bucket: result.bucket
    });
  } catch (error) {
    console.error('Erro ao completar upload multipart:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Rota para abortar um upload multipart
router.post('/multipart/abort', async (req, res) => {
  try {
    const { access_key, secret_key } = req.headers;
    const { bucket, key, uploadId } = req.body;
    
    if (!access_key || !secret_key || !bucket || !key || !uploadId) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros inválidos'
      });
    }
    
    const result = await abortMultipartUpload(
      access_key,
      secret_key,
      bucket,
      key,
      uploadId
    );
    
    res.json({
      success: true,
      message: 'Upload multipart abortado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao abortar upload multipart:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;