const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

/**
 * Inicia um upload multipart para um arquivo grande
 * @param {string} accessKey - Access Key ID da AWS
 * @param {string} secretKey - Secret Access Key da AWS
 * @param {string} bucket - Nome do bucket
 * @param {string} key - Chave do objeto (caminho no S3)
 * @returns {Promise<Object>} - Resultado da operação com UploadId
 */
async function initiateMultipartUpload(accessKey, secretKey, bucket, key) {
  const s3 = new AWS.S3({
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
    region: 'us-east-1'
  });
  
  const params = {
    Bucket: bucket,
    Key: key
  };
  
  try {
    const result = await s3.createMultipartUpload(params).promise();
    return {
      success: true,
      uploadId: result.UploadId,
      key: key
    };
  } catch (error) {
    console.error('Erro ao iniciar upload multipart:', error);
    throw error;
  }
}

/**
 * Faz upload de uma parte do arquivo
 * @param {string} accessKey - Access Key ID da AWS
 * @param {string} secretKey - Secret Access Key da AWS
 * @param {string} bucket - Nome do bucket
 * @param {string} key - Chave do objeto (caminho no S3)
 * @param {string} uploadId - ID do upload multipart
 * @param {number} partNumber - Número da parte (1-10000)
 * @param {Buffer} body - Conteúdo da parte
 * @returns {Promise<Object>} - Resultado da operação com ETag
 */
async function uploadPart(accessKey, secretKey, bucket, key, uploadId, partNumber, body) {
  const s3 = new AWS.S3({
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
    region: 'us-east-1'
  });
  
  const params = {
    Bucket: bucket,
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber,
    Body: body
  };
  
  try {
    const result = await s3.uploadPart(params).promise();
    return {
      success: true,
      partNumber: partNumber,
      ETag: result.ETag
    };
  } catch (error) {
    console.error(`Erro ao fazer upload da parte ${partNumber}:`, error);
    throw error;
  }
}

/**
 * Completa um upload multipart
 * @param {string} accessKey - Access Key ID da AWS
 * @param {string} secretKey - Secret Access Key da AWS
 * @param {string} bucket - Nome do bucket
 * @param {string} key - Chave do objeto (caminho no S3)
 * @param {string} uploadId - ID do upload multipart
 * @param {Array<{ETag: string, PartNumber: number}>} parts - Lista de partes enviadas
 * @returns {Promise<Object>} - Resultado da operação
 */
async function completeMultipartUpload(accessKey, secretKey, bucket, key, uploadId, parts) {
  const s3 = new AWS.S3({
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
    region: 'us-east-1'
  });
  
  const params = {
    Bucket: bucket,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: parts
    }
  };
  
  try {
    const result = await s3.completeMultipartUpload(params).promise();
    return {
      success: true,
      location: result.Location,
      key: result.Key,
      bucket: result.Bucket
    };
  } catch (error) {
    console.error('Erro ao completar upload multipart:', error);
    throw error;
  }
}

/**
 * Aborta um upload multipart
 * @param {string} accessKey - Access Key ID da AWS
 * @param {string} secretKey - Secret Access Key da AWS
 * @param {string} bucket - Nome do bucket
 * @param {string} key - Chave do objeto (caminho no S3)
 * @param {string} uploadId - ID do upload multipart
 * @returns {Promise<Object>} - Resultado da operação
 */
async function abortMultipartUpload(accessKey, secretKey, bucket, key, uploadId) {
  const s3 = new AWS.S3({
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
    region: 'us-east-1'
  });
  
  const params = {
    Bucket: bucket,
    Key: key,
    UploadId: uploadId
  };
  
  try {
    await s3.abortMultipartUpload(params).promise();
    return {
      success: true,
      message: 'Upload multipart abortado com sucesso'
    };
  } catch (error) {
    console.error('Erro ao abortar upload multipart:', error);
    throw error;
  }
}

/**
 * Processa um arquivo grande usando upload multipart
 * @param {string} accessKey - Access Key ID da AWS
 * @param {string} secretKey - Secret Access Key da AWS
 * @param {string} bucket - Nome do bucket
 * @param {string} key - Chave do objeto (caminho no S3)
 * @param {string} filePath - Caminho do arquivo local
 * @param {Function} progressCallback - Função de callback para progresso
 * @returns {Promise<Object>} - Resultado da operação
 */
async function processLargeFile(accessKey, secretKey, bucket, key, filePath, progressCallback) {
  // Tamanho mínimo de parte para upload multipart (5MB)
  const PART_SIZE = 5 * 1024 * 1024;
  
  try {
    // Obter tamanho do arquivo
    const fileSize = fs.statSync(filePath).size;
    
    // Iniciar upload multipart
    const initResult = await initiateMultipartUpload(accessKey, secretKey, bucket, key);
    const uploadId = initResult.uploadId;
    
    // Calcular número de partes
    const numParts = Math.ceil(fileSize / PART_SIZE);
    const uploadedParts = [];
    
    // Abrir stream de leitura do arquivo
    const fileStream = fs.createReadStream(filePath);
    let buffer = Buffer.alloc(0);
    let partNumber = 1;
    let bytesProcessed = 0;
    
    return new Promise((resolve, reject) => {
      fileStream.on('data', async (chunk) => {
        // Pausar stream para processar o chunk
        fileStream.pause();
        
        // Adicionar chunk ao buffer
        buffer = Buffer.concat([buffer, chunk]);
        bytesProcessed += chunk.length;
        
        // Se o buffer atingiu o tamanho da parte ou é o último chunk
        if (buffer.length >= PART_SIZE || bytesProcessed >= fileSize) {
          try {
            // Fazer upload da parte
            const partResult = await uploadPart(
              accessKey, 
              secretKey, 
              bucket, 
              key, 
              uploadId, 
              partNumber, 
              buffer
            );
            
            // Adicionar parte à lista de partes enviadas
            uploadedParts.push({
              ETag: partResult.ETag,
              PartNumber: partNumber
            });
            
            // Atualizar progresso
            const progress = Math.min(Math.round((bytesProcessed / fileSize) * 100), 100);
            if (progressCallback) {
              progressCallback(progress);
            }
            
            // Resetar buffer e incrementar número da parte
            buffer = Buffer.alloc(0);
            partNumber++;
            
            // Continuar leitura
            fileStream.resume();
          } catch (error) {
            // Abortar upload em caso de erro
            await abortMultipartUpload(accessKey, secretKey, bucket, key, uploadId);
            reject(error);
          }
        } else {
          // Continuar leitura se o buffer ainda não atingiu o tamanho da parte
          fileStream.resume();
        }
      });
      
      fileStream.on('end', async () => {
        try {
          // Completar upload multipart
          const result = await completeMultipartUpload(
            accessKey, 
            secretKey, 
            bucket, 
            key, 
            uploadId, 
            uploadedParts
          );
          
          // Atualizar progresso para 100%
          if (progressCallback) {
            progressCallback(100);
          }
          
          resolve(result);
        } catch (error) {
          // Abortar upload em caso de erro
          await abortMultipartUpload(accessKey, secretKey, bucket, key, uploadId);
          reject(error);
        }
      });
      
      fileStream.on('error', async (error) => {
        // Abortar upload em caso de erro
        await abortMultipartUpload(accessKey, secretKey, bucket, key, uploadId);
        reject(error);
      });
    });
  } catch (error) {
    console.error('Erro ao processar arquivo grande:', error);
    throw error;
  }
}

module.exports = {
  initiateMultipartUpload,
  uploadPart,
  completeMultipartUpload,
  abortMultipartUpload,
  processLargeFile
};