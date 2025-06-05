const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Função para fazer download de um objeto do S3
async function downloadS3Object(accessKey, secretKey, bucket, key, downloadPath) {
    try {
        // Configurar AWS SDK com as credenciais fornecidas
        const s3 = new AWS.S3({
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
            region: 'us-east-1' // Região padrão, pode ser alterada conforme necessário
        });

        // Criar diretório de download se não existir
        const dirPath = path.dirname(downloadPath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        // Criar stream de escrita para o arquivo
        const fileStream = fs.createWriteStream(downloadPath);

        // Obter o objeto do S3 e pipe para o arquivo
        const s3Stream = s3.getObject({
            Bucket: bucket,
            Key: key
        }).createReadStream();

        // Retornar uma promise que resolve quando o download for concluído
        return new Promise((resolve, reject) => {
            s3Stream.on('error', error => {
                // Remover arquivo parcial em caso de erro
                if (fs.existsSync(downloadPath)) {
                    fs.unlinkSync(downloadPath);
                }
                reject(error);
            });

            fileStream.on('error', error => {
                // Remover arquivo parcial em caso de erro
                if (fs.existsSync(downloadPath)) {
                    fs.unlinkSync(downloadPath);
                }
                reject(error);
            });

            fileStream.on('close', () => {
                resolve({
                    success: true,
                    path: downloadPath
                });
            });

            s3Stream.pipe(fileStream);
        });
    } catch (error) {
        console.error(`Erro ao fazer download do objeto ${key} do bucket ${bucket}:`, error);
        throw error;
    }
}

module.exports = {
    downloadS3Object
};