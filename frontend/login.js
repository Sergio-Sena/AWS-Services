document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');
    const loading = document.getElementById('loading');

    if (!loginForm || !errorMessage || !loading) {
        console.error('Elementos necessários não encontrados!');
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const accessKey = document.getElementById('accessKey').value.trim();
        const secretKey = document.getElementById('secretKey').value.trim();
        const region = document.getElementById('region').value;

        if (!accessKey || !secretKey) {
            errorMessage.textContent = 'Por favor, preencha todos os campos.';
            return;
        }

        // Mostra o loading
        loading.style.display = 'flex';
        errorMessage.textContent = '';

        try {
            console.log('Enviando requisição de autenticação...');
            const response = await fetch('http://localhost:8000/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_key: accessKey,
                    secret_key: secretKey,
                    region: region
                })
            });

            const data = await response.json();
            console.log('Resposta recebida:', response.status, data);

            if (response.ok) {
                console.log('Autenticação bem-sucedida, salvando dados...');
                // Salva o access key para usar como identificador da sessão
                localStorage.setItem('s3_access_key', accessKey);
                localStorage.setItem('s3_region', region);
                
                console.log('Redirecionando para o dashboard...');
                // Redireciona para o dashboard
                window.location.href = './dashboard.html';
            } else {
                console.error('Erro na autenticação:', data);
                errorMessage.textContent = data.detail || 'Erro ao autenticar. Verifique suas credenciais.';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Erro na autenticação:', error);
            errorMessage.textContent = 'Erro ao conectar com o servidor. Verifique se o backend está rodando.';
            errorMessage.style.display = 'block';
        } finally {
            loading.style.display = 'none';
        }
    });

    // Limpa mensagens de erro quando o usuário começa a digitar
    document.querySelectorAll('input, select').forEach(element => {
        element.addEventListener('input', () => {
            errorMessage.textContent = '';
            errorMessage.style.display = 'none';
        });
    });
}); 