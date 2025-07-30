const AWS = require('aws-sdk');

// Handler para calculadora de custos AWS
exports.getBillingInfo = async (event) => {
    try {
        const { accessKey, secretKey } = event.credentials;
        
        const currentDate = new Date();
        const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const nextBillDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        
        // Cotação USD para BRL (simulada - em produção usar API real)
        const usdToBrl = 5.15;
        
        let realBillingData = null;
        let hasRealData = false;
        
        // Tentar obter dados reais do Cost Explorer
        try {
            const costexplorer = new AWS.CostExplorer({
                accessKeyId: accessKey,
                secretAccessKey: secretKey,
                region: 'us-east-1'
            });
            
            // Obter custos do mês passado
            const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
            const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            
            const lastMonthCosts = await costexplorer.getCostAndUsage({
                TimePeriod: {
                    Start: lastMonthStart.toISOString().split('T')[0],
                    End: lastMonthEnd.toISOString().split('T')[0]
                },
                Granularity: 'MONTHLY',
                Metrics: ['BlendedCost'],
                GroupBy: [{
                    Type: 'DIMENSION',
                    Key: 'SERVICE'
                }]
            }).promise();
            
            // Obter custos do mês atual
            const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const today = new Date();
            
            const currentMonthCosts = await costexplorer.getCostAndUsage({
                TimePeriod: {
                    Start: currentMonthStart.toISOString().split('T')[0],
                    End: today.toISOString().split('T')[0]
                },
                Granularity: 'MONTHLY',
                Metrics: ['BlendedCost'],
                GroupBy: [{
                    Type: 'DIMENSION',
                    Key: 'SERVICE'
                }]
            }).promise();
            
            // Processar dados reais
            if (lastMonthCosts.ResultsByTime && lastMonthCosts.ResultsByTime.length > 0) {
                const lastMonthData = lastMonthCosts.ResultsByTime[0];
                const currentMonthData = currentMonthCosts.ResultsByTime[0] || { Groups: [], Total: { BlendedCost: { Amount: '0' } } };
                
                // Calcular total do mês passado
                const lastMonthTotal = lastMonthData.Groups ? 
                    lastMonthData.Groups.reduce((sum, group) => sum + parseFloat(group.Metrics?.BlendedCost?.Amount || 0), 0) :
                    parseFloat(lastMonthData.Total?.BlendedCost?.Amount || 0);
                
                // Calcular total do mês atual
                const currentMonthTotal = currentMonthData.Groups ? 
                    currentMonthData.Groups.reduce((sum, group) => sum + parseFloat(group.Metrics?.BlendedCost?.Amount || 0), 0) :
                    parseFloat(currentMonthData.Total?.BlendedCost?.Amount || 0);
                
                realBillingData = {
                    lastBill: {
                        amount: lastMonthTotal,
                        currency: 'USD',
                        period: lastMonthStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
                        date: lastMonthStart.toISOString(),
                        services: (lastMonthData.Groups || []).map(group => ({
                            name: group.Keys[0],
                            cost: parseFloat(group.Metrics?.BlendedCost?.Amount || 0)
                        })).filter(service => service.cost > 0)
                    },
                    currentBill: {
                        amount: currentMonthTotal,
                        currency: 'USD',
                        period: `${currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} (até agora)`,
                        date: currentDate.toISOString(),
                        nextBillDate: nextBillDate.toISOString(),
                        services: (currentMonthData.Groups || []).map(group => ({
                            name: group.Keys[0],
                            cost: parseFloat(group.Metrics?.BlendedCost?.Amount || 0)
                        })).filter(service => service.cost > 0)
                    }
                };
                
                hasRealData = true;
                console.log('Dados reais de faturamento obtidos com sucesso');
            }
        } catch (error) {
            console.log('Não foi possível obter dados reais de faturamento:', error.message);
        }
        
        // Usar dados reais se disponíveis, senão usar dados demo
        let billingData;
        
        if (hasRealData && realBillingData) {
            billingData = {
                ...realBillingData,
                exchangeRate: usdToBrl,
                lastUpdate: currentDate.toISOString(),
                hasRealData: true,
                isDemo: false
            };
            
            // Marcar como dados reais
            billingData.lastBill.isDemo = false;
            billingData.currentBill.isDemo = false;
        } else {
            billingData = {
                lastBill: {
                    amount: 127.45,
                    currency: 'USD',
                    period: `${lastMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
                    date: lastMonth.toISOString(),
                    services: [
                        { name: 'Amazon S3', cost: 23.50 },
                        { name: 'Amazon EC2', cost: 45.20 },
                        { name: 'Amazon Lambda', cost: 8.75 },
                        { name: 'Amazon CloudFront', cost: 15.30 },
                        { name: 'Amazon DynamoDB', cost: 12.40 },
                        { name: 'Outros serviços', cost: 22.30 }
                    ],
                    isDemo: true
                },
                currentBill: {
                    amount: 89.32,
                    currency: 'USD',
                    period: `${currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} (até agora)`,
                    date: currentDate.toISOString(),
                    nextBillDate: nextBillDate.toISOString(),
                    services: [
                        { name: 'Amazon S3', cost: 18.20 },
                        { name: 'Amazon EC2', cost: 32.15 },
                        { name: 'Amazon Lambda', cost: 6.50 },
                        { name: 'Amazon CloudFront', cost: 11.80 },
                        { name: 'Amazon DynamoDB', cost: 9.67 },
                        { name: 'Outros serviços', cost: 11.00 }
                    ],
                    isDemo: true
                },
                exchangeRate: usdToBrl,
                lastUpdate: currentDate.toISOString(),
                hasRealData: false,
                isDemo: true
            };
        }

        // Converter para BRL
        billingData.lastBill.amountBRL = billingData.lastBill.amount * usdToBrl;
        billingData.currentBill.amountBRL = billingData.currentBill.amount * usdToBrl;
        
        billingData.lastBill.services = billingData.lastBill.services.map(service => ({
            ...service,
            costBRL: service.cost * usdToBrl
        }));
        
        billingData.currentBill.services = billingData.currentBill.services.map(service => ({
            ...service,
            costBRL: service.cost * usdToBrl
        }));

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                success: true,
                billing: billingData,
                hasRealData: hasRealData,
                message: hasRealData ? 
                    'Informações de faturamento reais obtidas com sucesso' : 
                    'Dados de faturamento simulados (sem acesso ao Cost Explorer)'
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ 
                error: error.message,
                message: 'Erro ao obter informações de faturamento'
            })
        };
    }
};

// Handler para obter cotação atual
exports.getExchangeRate = async (event) => {
    try {
        // Em produção, usar API real como exchangerate-api.com
        const exchangeRate = {
            from: 'USD',
            to: 'BRL',
            rate: 5.15,
            lastUpdate: new Date().toISOString(),
            source: 'Simulado - Use API real em produção'
        };

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                success: true,
                exchangeRate,
                message: 'Cotação obtida com sucesso'
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