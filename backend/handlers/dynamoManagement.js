const AWS = require('aws-sdk');

// Handler para listagem de tabelas DynamoDB
exports.listTables = async (event) => {
    try {
        const { accessKey, secretKey } = event.credentials;
        
        const dynamodb = new AWS.DynamoDB({
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
            region: 'us-east-1'
        });

        // Tentar listar tabelas reais
        const realTables = await dynamodb.listTables().promise();
        
        // Tabelas demo para exemplo
        const demoTables = [
            {
                TableName: 'demo-users',
                ItemCount: 1250,
                TableSizeBytes: 524288,
                TableStatus: 'ACTIVE',
                CreationDateTime: new Date(Date.now() - 7776000000),
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5
                },
                isDemo: true
            },
            {
                TableName: 'demo-products',
                ItemCount: 5000,
                TableSizeBytes: 1048576,
                TableStatus: 'ACTIVE',
                CreationDateTime: new Date(Date.now() - 2592000000),
                ProvisionedThroughput: {
                    ReadCapacityUnits: 10,
                    WriteCapacityUnits: 10
                },
                isDemo: true
            }
        ];

        // Combinar tabelas reais com demos
        let tables = [...demoTables];
        
        if (realTables.TableNames && realTables.TableNames.length > 0) {
            const realTablesDetails = await Promise.all(
                realTables.TableNames.map(async (tableName) => {
                    const details = await dynamodb.describeTable({ TableName: tableName }).promise();
                    return {
                        ...details.Table,
                        isDemo: false
                    };
                })
            );
            tables = [...realTablesDetails, ...tables];
        }

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                success: true,
                tables,
                realCount: realTables.TableNames?.length || 0,
                demoCount: demoTables.length,
                message: 'Tabelas DynamoDB listadas com sucesso'
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ 
                error: error.message,
                message: 'Erro ao listar tabelas DynamoDB'
            })
        };
    }
};

// Handler para operações em tabelas
exports.tableOperation = async (event) => {
    try {
        const { tableName, operation, data } = JSON.parse(event.body);
        
        // Simular operações apenas em tabelas demo
        if (!tableName.startsWith('demo-')) {
            throw new Error('Operações permitidas apenas em tabelas demo');
        }

        const operations = {
            scan: {
                message: 'Scan simulado - retornando 10 itens de exemplo',
                items: Array(10).fill(null).map((_, i) => ({
                    id: `item-${i}`,
                    timestamp: Date.now() - (i * 3600000),
                    data: `Exemplo de dado ${i}`
                }))
            },
            put: {
                message: 'Item inserido com sucesso (simulado)',
                item: { ...data, timestamp: Date.now() }
            },
            delete: {
                message: 'Item deletado com sucesso (simulado)',
                key: data.key
            }
        };

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                success: true,
                operation: operation,
                result: operations[operation],
                message: `Operação ${operation} simulada com sucesso`
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