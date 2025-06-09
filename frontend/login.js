document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const loading = document.getElementById('loading');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const toggleUsername = document.getElementById('toggleUsername');
    const usernameInput = document.getElementById('username');

    // Adicionar efeitos de foco aos inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('neon-border-active');
        });
        
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('neon-border-active');
        });
    });

    // Funcionalidade para mostrar/esconder senha com animação
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Alterna o ícone entre olho e olho riscado com animação
            const icon = togglePassword.querySelector('i');
            icon.classList.add('animate-fade-in');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
            
            setTimeout(() => {
                icon.classList.remove('animate-fade-in');
            }, 500);
        });
    }
    
    // Funcionalidade para mostrar/esconder access key com animação
    if (toggleUsername && usernameInput) {
        toggleUsername.addEventListener('click', () => {
            const type = usernameInput.getAttribute('type') === 'password' ? 'text' : 'password';
            usernameInput.setAttribute('type', type);
            
            // Alterna o ícone entre olho e olho riscado com animação
            const icon = toggleUsername.querySelector('i');
            icon.classList.add('animate-fade-in');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
            
            setTimeout(() => {
                icon.classList.remove('animate-fade-in');
            }, 500);
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.classList.add('hidden');
        loading.style.display = 'flex';

        const accessKey = document.getElementById('username').value;
        const secretKey = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:8000/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_key: accessKey,
                    secret_key: secretKey
                })
            });

            if (!response.ok) {
                throw new Error('Credenciais inválidas');
            }

            const data = await response.json();
            
            // Salvar credenciais
            localStorage.setItem('s3_access_key', accessKey);
            localStorage.setItem('s3_secret_key', secretKey);
            
            // Mostrar notificação de sucesso
            showNotification('Login realizado com sucesso! Redirecionando...', 'success');
            
            // Redirecionar após um pequeno delay para mostrar a notificação
            setTimeout(() => {
                window.location.href = data.redirect || 'dashboard.html';
            }, 1000);

        } catch (error) {
            console.error('Erro:', error);
            // Usar o sistema de notificações em vez do alerta simples
            showNotification('Credenciais inválidas. Por favor, tente novamente.', 'error');
            errorMessage.classList.remove('hidden');
        } finally {
            loading.style.display = 'none';
        }
    });
    
    // Adicionar efeitos de partículas para o logo
    const createParticles = () => {
        const logoContainer = document.querySelector('.logo-animation');
        if (!logoContainer) return;
        
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.className = 'absolute rounded-full bg-blue-500 opacity-0';
            
            // Tamanho aleatório
            const size = Math.random() * 8 + 4;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Posição inicial aleatória
            particle.style.top = `${50 + (Math.random() * 20 - 10)}%`;
            particle.style.left = `${50 + (Math.random() * 20 - 10)}%`;
            
            // Adicionar sombra de brilho
            particle.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.8)';
            
            // Adicionar animação
            particle.style.animation = `particleFloat ${Math.random() * 3 + 2}s infinite ease-in-out ${Math.random() * 2}s`;
            
            logoContainer.appendChild(particle);
        }
    };
    
    // Adicionar keyframes para animação de partículas
    const addParticleAnimation = () => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes particleFloat {
                0% { transform: translate(0, 0) scale(0.2); opacity: 0; }
                50% { opacity: 0.8; }
                100% { transform: translate(${Math.random() > 0.5 ? '' : '-'}${Math.random() * 50 + 20}px, -${Math.random() * 50 + 20}px) scale(0); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    };
    
    // Inicializar efeitos visuais
    addParticleAnimation();
    createParticles();
});