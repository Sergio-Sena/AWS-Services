const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

/**
 * Faz download de uma pasta inteira do S3 como um arquivo ZIP
 * @param {string} accessKey - Access Key ID da AWS
 * @param {string} secretKey - Secret Access Key da AWS
 * @param {string} bucket - Nome do bucket
 * @param {string} prefix - Prefixo da pasta
 * @param {object} res - Objeto de resposta do Express
 */
async function downloadS3Folder(accessKey, secretKey, bucket, prefix, res) {
    try {
        // Configurar AWS SDK com as credenciais fornecidas
        const s3 = new AWS.S3({
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
            region: 'us-east-1' // Região padrão
        });

        // Listar todos os objetos com o prefixo especificado
        const listParams = {
            Bucket: bucket,
            Prefix: prefix
        };

        // Obter a lista de objetos
        const listedObjects = await s3.listObjectsV2(listParams).promise();
        
        if (listedObjects.Contents.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Pasta vazia ou não encontrada'
            });
        }

        // Configurar o nome do arquivo ZIP
        const folderName = prefix.split('/').filter(Boolean).pop() || bucket;
        const zipFileName = `${folderName}.zip`;
        
        // Configurar cabeçalhos para download
        res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
        res.setHeader('Content-Type', 'application/zip');

        // Criar um arquivo ZIP
        const archive = archiver('zip', {
            zlib: { level: 5 } // Nível de compressão
        });

        // Pipe do arquivo ZIP para a resposta
        archive.pipe(res);

        // Adicionar cada objeto ao arquivo ZIP
        for (const object of listedObjects.Contents) {
            // Pular o próprio diretório
            if (object.Key === prefix) continue;
            
            // Obter o caminho relativo dentro do ZIP
            const relativePath = object.Key.slice(prefix.length);
            
            // Obter o objeto do S3
            const fileData = await s3.getObject({
                Bucket: bucket,
                Key: object.Key
            }).promise();
            
            // Adicionar o arquivo ao ZIP
            archive.append(fileData.Body, { name: relativePath });
        }

        // Finalizar o arquivo ZIP
        await archive.finalize();
        
        return true;
    } catch (error) {
        console.error(`Erro ao fazer download da pasta ${prefix} do bucket ${bucket}:`, error);
        
        // Se os cabeçalhos ainda não foram enviados
        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: `Erro ao fazer download da pasta`,
                error: error.message
            });
        }
        
        throw error;
    }
}

module.exports = {
    downloadS3Folder
};