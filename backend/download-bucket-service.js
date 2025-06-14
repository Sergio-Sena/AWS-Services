const AWS = require('aws-sdk');
const archiver = require('archiver');
const path = require('path');

/**
 * Faz download de um bucket inteiro como ZIP
 * @param {string} accessKey - Access Key ID da AWS
 * @param {string} secretKey - Secret Access Key da AWS
 * @param {string} bucket - Nome do bucket
 * @param {object} res - Objeto de resposta do Express
 */
async function downloadBucket(accessKey, secretKey, bucket, res) {
  try {
    // Configurar o cliente S3
    const s3 = new AWS.S3({
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
      region: 'us-east-1'
    });
    
    // Configurar o arquivo ZIP
    const archive = archiver('zip', {
      zlib: { level: 5 } // Nível de compressão
    });
    
    // Configurar cabeçalhos para download
    res.setHeader('Content-Disposition', `attachment; filename="${bucket}.zip"`);
    res.setHeader('Content-Type', 'application/zip');
    
    // Pipe do arquivo ZIP para a resposta
    archive.pipe(res);
    
    // Listar todos os objetos no bucket
    let continuationToken = null;
    let isTruncated = true;
    
    while (isTruncated) {
      const params = {
        Bucket: bucket,
        ContinuationToken: continuationToken
      };
      
      const data = await s3.listObjectsV2(params).promise();
      
      // Processar cada objeto
      for (const object of data.Contents || []) {
        // Obter o objeto do S3
        const objectData = await s3.getObject({
          Bucket: bucket,
          Key: object.Key
        }).promise();
        
        // Adicionar o objeto ao arquivo ZIP
        archive.append(objectData.Body, { name: object.Key });
      }
      
      // Verificar se há mais objetos
      isTruncated = data.IsTruncated;
      continuationToken = data.NextContinuationToken;
    }
    
    // Finalizar o arquivo ZIP
    await archive.finalize();
    
  } catch (error) {
    console.error('Erro ao fazer download do bucket:', error);
    // Se o cabeçalho ainda não foi enviado
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Erro ao fazer download do bucket',
        error: error.message
      });
    }
  }
}

/**
 * Faz download de múltiplos objetos como ZIP
 * @param {string} accessKey - Access Key ID da AWS
 * @param {string} secretKey - Secret Access Key da AWS
 * @param {string} bucket - Nome do bucket
 * @param {string[]} keys - Lista de chaves dos objetos
 * @param {object} res - Objeto de resposta do Express
 */
async function downloadMultipleObjects(accessKey, secretKey, bucket, keys, res) {
  try {
    // Configurar o cliente S3
    const s3 = new AWS.S3({
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
      region: 'us-east-1'
    });
    
    // Configurar o arquivo ZIP
    const archive = archiver('zip', {
      zlib: { level: 5 } // Nível de compressão
    });
    
    // Configurar cabeçalhos para download
    res.setHeader('Content-Disposition', `attachment; filename="${bucket}-selected.zip"`);
    res.setHeader('Content-Type', 'application/zip');
    
    // Pipe do arquivo ZIP para a resposta
    archive.pipe(res);
    
    // Processar cada objeto
    for (const key of keys) {
      try {
        // Verificar se é uma pasta (termina com /)
        if (key.endsWith('/')) {
          // Listar objetos na pasta
          const folderObjects = await s3.listObjectsV2({
            Bucket: bucket,
            Prefix: key
          }).promise();
          
          // Adicionar cada objeto da pasta ao ZIP
          for (const object of folderObjects.Contents || []) {
            const objectData = await s3.getObject({
              Bucket: bucket,
              Key: object.Key
            }).promise();
            
            // Manter a estrutura de pastas no ZIP
            archive.append(objectData.Body, { name: object.Key });
          }
        } else {
          // É um arquivo individual
          const objectData = await s3.getObject({
            Bucket: bucket,
            Key: key
          }).promise();
          
          // Adicionar o objeto ao arquivo ZIP
          archive.append(objectData.Body, { name: key });
        }
      } catch (objectError) {
        console.error(`Erro ao processar objeto ${key}:`, objectError);
        // Continuar com os próximos objetos
      }
    }
    
    // Finalizar o arquivo ZIP
    await archive.finalize();
    
  } catch (error) {
    console.error('Erro ao fazer download de múltiplos objetos:', error);
    // Se o cabeçalho ainda não foi enviado
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Erro ao fazer download de múltiplos objetos',
        error: error.message
      });
    }
  }
}

module.exports = {
  downloadBucket,
  downloadMultipleObjects
};