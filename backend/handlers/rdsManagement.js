const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');
const { Client } = require('pg');

// Handler para listar instâncias RDS
exports.listInstances = async (event) => {
    try {
        const { accessKey, secretKey } = event.credentials;
        
        const rds = new AWS.RDS({
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
            region: 'us-east-1'
        });

        let realInstances = [];
        
        try {
            const data = await rds.describeDBInstances().promise();
            realInstances = data.DBInstances.map(instance => ({
                DBInstanceIdentifier: instance.DBInstanceIdentifier,
                DBInstanceClass: instance.DBInstanceClass,
                Engine: instance.Engine,
                EngineVersion: instance.EngineVersion,
                DBInstanceStatus: instance.DBInstanceStatus,
                Endpoint: instance.Endpoint,
                AllocatedStorage: instance.AllocatedStorage,
                StorageType: instance.StorageType,
                MultiAZ: instance.MultiAZ,
                VpcSecurityGroups: instance.VpcSecurityGroups,
                DBSubnetGroup: instance.DBSubnetGroup,
                InstanceCreateTime: instance.InstanceCreateTime,
                isReal: true
            }));
        } catch (error) {
            console.log('Erro ao buscar instâncias reais:', error.message);
        }

        // Dados demo se não houver instâncias reais
        const demoInstances = [
            {
                DBInstanceIdentifier: 'demo-mysql-prod',
                DBInstanceClass: 'db.t3.micro',
                Engine: 'mysql',
                EngineVersion: '8.0.35',
                DBInstanceStatus: 'available',
                Endpoint: {
                    Address: 'demo-mysql-prod.cluster-xyz.us-east-1.rds.amazonaws.com',
                    Port: 3306
                },
                AllocatedStorage: 20,
                StorageType: 'gp2',
                MultiAZ: false,
                VpcSecurityGroups: [{ VpcSecurityGroupId: 'sg-demo123', Status: 'active' }],
                DBSubnetGroup: { DBSubnetGroupName: 'demo-subnet-group' },
                InstanceCreateTime: new Date(Date.now() - 86400000 * 7).toISOString(),
                isDemo: true
            },
            {
                DBInstanceIdentifier: 'demo-postgres-dev',
                DBInstanceClass: 'db.t3.small',
                Engine: 'postgres',
                EngineVersion: '15.4',
                DBInstanceStatus: 'stopped',
                Endpoint: {
                    Address: 'demo-postgres-dev.cluster-abc.us-east-1.rds.amazonaws.com',
                    Port: 5432
                },
                AllocatedStorage: 50,
                StorageType: 'gp3',
                MultiAZ: true,
                VpcSecurityGroups: [{ VpcSecurityGroupId: 'sg-demo456', Status: 'active' }],
                DBSubnetGroup: { DBSubnetGroupName: 'demo-subnet-group' },
                InstanceCreateTime: new Date(Date.now() - 86400000 * 3).toISOString(),
                isDemo: true
            }
        ];

        const allInstances = [...realInstances, ...demoInstances];

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                success: true,
                instances: allInstances,
                realCount: realInstances.length,
                demoCount: demoInstances.length,
                message: realInstances.length > 0 ? 
                    `${realInstances.length} instância(s) real(is) + ${demoInstances.length} demo` :
                    'Exibindo dados demo (nenhuma instância real encontrada)'
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ 
                success: false,
                error: error.message 
            })
        };
    }
};

// Handler para operações em instâncias RDS
exports.instanceOperation = async (event) => {
    try {
        const { instanceId, action } = JSON.parse(event.body);
        
        // Apenas operações demo para segurança
        if (!instanceId.startsWith('demo-')) {
            return {
                statusCode: 403,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({
                    success: false,
                    error: 'Operações permitidas apenas em instâncias demo'
                })
            };
        }

        const actions = {
            start: 'Iniciando',
            stop: 'Parando',
            restart: 'Reiniciando',
            backup: 'Criando backup',
            modify: 'Modificando configurações'
        };

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                success: true,
                instanceId,
                action: actions[action] || action,
                message: `${actions[action]} instância ${instanceId} (demo)`,
                timestamp: new Date().toISOString()
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ 
                success: false,
                error: error.message 
            })
        };
    }
};

// Handler para conectar e listar dados de uma instância RDS
exports.connectAndListData = async (event) => {
    try {
        const { instanceId, dbName, username, password } = JSON.parse(event.body);
        
        if (!instanceId || !dbName || !username || !password) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({
                    success: false,
                    error: 'Parâmetros obrigatórios: instanceId, dbName, username, password'
                })
            };
        }

        // Para instâncias demo, retornar dados simulados
        if (instanceId.startsWith('demo-')) {
            const demoData = await getDemoData(instanceId);
            return {
                statusCode: 200,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({
                    success: true,
                    instanceId,
                    connected: true,
                    isDemo: true,
                    data: demoData,
                    message: `Conectado à instância demo ${instanceId}`
                })
            };
        }

        // Para instâncias reais, tentar conexão real
        const { accessKey, secretKey } = event.credentials;
        const rds = new AWS.RDS({
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
            region: 'us-east-1'
        });

        // Buscar detalhes da instância
        const instanceData = await rds.describeDBInstances({
            DBInstanceIdentifier: instanceId
        }).promise();

        const instance = instanceData.DBInstances[0];
        if (!instance || !instance.Endpoint) {
            throw new Error('Instância não encontrada ou endpoint não disponível');
        }

        const endpoint = instance.Endpoint.Address;
        const port = instance.Endpoint.Port;
        const engine = instance.Engine;

        let connection;
        let tables = [];
        let sampleData = {};

        if (engine === 'mysql' || engine === 'mariadb') {
            connection = await mysql.createConnection({
                host: endpoint,
                port: port,
                user: username,
                password: password,
                database: dbName,
                connectTimeout: 10000
            });

            // Listar tabelas
            const [rows] = await connection.execute('SHOW TABLES');
            tables = rows.map(row => Object.values(row)[0]);

            // Obter dados de amostra das primeiras 3 tabelas
            for (let i = 0; i < Math.min(3, tables.length); i++) {
                const tableName = tables[i];
                try {
                    const [data] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 5`);
                    sampleData[tableName] = data;
                } catch (err) {
                    sampleData[tableName] = { error: err.message };
                }
            }

            await connection.end();
        } else if (engine === 'postgres') {
            const client = new Client({
                host: endpoint,
                port: port,
                user: username,
                password: password,
                database: dbName,
                connectionTimeoutMillis: 10000
            });

            await client.connect();

            // Listar tabelas
            const result = await client.query(
                "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
            );
            tables = result.rows.map(row => row.table_name);

            // Obter dados de amostra das primeiras 3 tabelas
            for (let i = 0; i < Math.min(3, tables.length); i++) {
                const tableName = tables[i];
                try {
                    const data = await client.query(`SELECT * FROM ${tableName} LIMIT 5`);
                    sampleData[tableName] = data.rows;
                } catch (err) {
                    sampleData[tableName] = { error: err.message };
                }
            }

            await client.end();
        } else {
            throw new Error(`Engine ${engine} não suportado para conexão direta`);
        }

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                success: true,
                instanceId,
                connected: true,
                isDemo: false,
                engine,
                endpoint,
                port,
                database: dbName,
                tables,
                sampleData,
                message: `Conectado com sucesso à instância ${instanceId}`
            })
        };
    } catch (error) {
        console.error('Erro ao conectar com RDS:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                success: false,
                error: error.message,
                message: 'Erro ao conectar com a instância RDS'
            })
        };
    }
};

// Função para gerar dados demo
async function getDemoData(instanceId) {
    const demoTables = {
        'demo-mysql-prod': {
            tables: ['users', 'products', 'orders'],
            sampleData: {
                users: [
                    { id: 1, name: 'João Silva', email: 'joao@email.com', created_at: '2024-01-15' },
                    { id: 2, name: 'Maria Santos', email: 'maria@email.com', created_at: '2024-01-16' },
                    { id: 3, name: 'Pedro Costa', email: 'pedro@email.com', created_at: '2024-01-17' }
                ],
                products: [
                    { id: 1, name: 'Notebook Dell', price: 2500.00, category: 'Electronics' },
                    { id: 2, name: 'Mouse Logitech', price: 89.90, category: 'Accessories' },
                    { id: 3, name: 'Teclado Mecânico', price: 299.99, category: 'Accessories' }
                ],
                orders: [
                    { id: 1, user_id: 1, product_id: 1, quantity: 1, total: 2500.00, order_date: '2024-01-20' },
                    { id: 2, user_id: 2, product_id: 2, quantity: 2, total: 179.80, order_date: '2024-01-21' }
                ]
            }
        },
        'demo-postgres-dev': {
            tables: ['customers', 'invoices', 'payments'],
            sampleData: {
                customers: [
                    { id: 1, company: 'Tech Corp', contact: 'Ana Lima', phone: '11999999999' },
                    { id: 2, company: 'Digital Solutions', contact: 'Carlos Mendes', phone: '11888888888' }
                ],
                invoices: [
                    { id: 1, customer_id: 1, amount: 5000.00, status: 'paid', issue_date: '2024-01-10' },
                    { id: 2, customer_id: 2, amount: 3200.00, status: 'pending', issue_date: '2024-01-15' }
                ],
                payments: [
                    { id: 1, invoice_id: 1, amount: 5000.00, payment_date: '2024-01-12', method: 'bank_transfer' }
                ]
            }
        }
    };

    return demoTables[instanceId] || {
        tables: ['demo_table'],
        sampleData: {
            demo_table: [
                { id: 1, name: 'Demo Data', value: 'Sample Value' }
            ]
        }
    };
}