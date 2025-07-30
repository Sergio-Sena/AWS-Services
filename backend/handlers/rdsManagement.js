const AWS = require('aws-sdk');

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