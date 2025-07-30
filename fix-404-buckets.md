# Fix: Erro 404 ao Carregar Buckets

## 🐛 Problema Identificado
**Erro 404** ao tentar carregar buckets na página `/lambda`

## 🔍 Causa Raiz
Faltava a API route `/api/buckets.js` no frontend Next.js

## ✅ Solução Aplicada
Criado arquivo: `frontend-next/pages/api/buckets.js`

```javascript
export default async function handler(req, res) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  try {
    const response = await fetch(`${API_URL}/buckets`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'access_key': req.headers.access_key,
        'secret_key': req.headers.secret_key
      }
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

## 🚀 Status
- ✅ Arquivo criado
- ✅ Proxy para backend configurado
- ✅ Headers AWS passados corretamente
- ⏳ Aguardando teste

## 🧪 Para Testar
1. Iniciar backend: `cd backend && npm start`
2. Iniciar frontend: `cd frontend-next && npm run dev`
3. Acessar: `http://localhost:3000/lambda`
4. Verificar se buckets carregam corretamente