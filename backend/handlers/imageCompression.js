const AWS = require('aws-sdk');

// Handler para compactação de imagens (simulado)
exports.compressImage = async (event) => {
    try {
        const { bucket, key, quality = 80 } = JSON.parse(event.body);
        
        // Simular compactação (sem Sharp para não quebrar)
        const originalSize = Math.floor(Math.random() * 1000000) + 500000; // 500KB - 1.5MB
        const compressedSize = Math.floor(originalSize * (quality / 100));
        const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                success: true,
                originalKey: key,
                compressedKey: `compressed/${key}`,
                originalSize,
                compressedSize,
                reduction: `${reduction}%`,
                message: 'Compactação simulada (demo)'
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: error.message })
        };
    }
};