const AWS = require('aws-sdk');

// Handler para gerenciamento EC2 (simulado)
exports.listInstances = async (event) => {
    try {
        // Simular listagem de instâncias EC2
        const instances = [
            {
                InstanceId: 'i-1234567890abcdef0',
                InstanceType: 't3.micro',
                State: { Name: 'running' },
                PublicIpAddress: '54.123.45.67',
                PrivateIpAddress: '10.0.1.100',
                LaunchTime: new Date(Date.now() - 86400000).toISOString(),
                Tags: [{ Key: 'Name', Value: 'Web Server' }]
            },
            {
                InstanceId: 'i-0987654321fedcba0',
                InstanceType: 't3.small',
                State: { Name: 'stopped' },
                PublicIpAddress: null,
                PrivateIpAddress: '10.0.1.101',
                LaunchTime: new Date(Date.now() - 172800000).toISOString(),
                Tags: [{ Key: 'Name', Value: 'Database Server' }]
            }
        ];

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                success: true,
                instances,
                message: 'Instâncias EC2 simuladas (demo)'
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

exports.manageInstance = async (event) => {
    try {
        const { instanceId, action } = JSON.parse(event.body);
        
        const actions = {
            start: 'Iniciando',
            stop: 'Parando',
            restart: 'Reiniciando',
            terminate: 'Terminando'
        };

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                success: true,
                instanceId,
                action: actions[action] || action,
                message: `${actions[action]} instância ${instanceId} (demo)`
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