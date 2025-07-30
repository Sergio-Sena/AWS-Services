@echo off
echo 🧪 AWS Services - Test Runner
echo ================================

echo.
echo 📋 Verificando dependências...

:: Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado
    exit /b 1
)
echo ✅ Node.js instalado

:: Verificar npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm não encontrado
    exit /b 1
)
echo ✅ npm instalado

echo.
echo 🔧 Instalando dependências do backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências do backend
    exit /b 1
)
echo ✅ Backend dependencies OK

echo.
echo 🔧 Instalando dependências do frontend...
cd ..\frontend-next
call npm install
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências do frontend
    exit /b 1
)
echo ✅ Frontend dependencies OK

echo.
echo 🧪 Executando testes básicos...

:: Testar build do frontend
echo 📦 Testando build do frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build do frontend falhou
    exit /b 1
)
echo ✅ Frontend build OK

echo.
echo 🎯 Testes concluídos com sucesso!
echo.
echo 📋 Próximos passos:
echo 1. Iniciar backend: cd backend && npm run dev
echo 2. Iniciar frontend: cd frontend-next && npm run dev  
echo 3. Abrir http://localhost:3000
echo 4. Seguir checklist em test-plan.md

pause