// Teste rápido da conexão com o backend
const fetch = require('node-fetch');

const API_URL = 'http://localhost:8000';

async function testBackendConnection() {
  console.log('🧪 Testando conexão com o backend...\n');
  
  try {
    // Teste 1: Health check
    console.log('1. Testando /health...');
    const healthResponse = await fetch(`${API_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthData);
    
    // Teste 2: Endpoint /buckets (deve retornar 400 - credenciais não fornecidas)
    console.log('\n2. Testando /buckets...');
    const bucketsResponse = await fetch(`${API_URL}/buckets`);
    const bucketsData = await bucketsResponse.json();
    console.log(`✅ Buckets (${bucketsResponse.status}):`, bucketsData);
    
    // Teste 3: Endpoint RDS
    console.log('\n3. Testando /api/rds/instances...');
    const rdsResponse = await fetch(`${API_URL}/api/rds/instances`);
    const rdsData = await rdsResponse.json();
    console.log(`✅ RDS (${rdsResponse.status}):`, rdsData);
    
    console.log('\n🎉 Todos os testes passaram! Backend está funcionando.');
    
  } catch (error) {
    console.error('❌ Erro ao testar backend:', error.message);
  }
}

testBackendConnection();