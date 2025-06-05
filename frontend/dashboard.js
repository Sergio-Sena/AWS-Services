/**
 * Dashboard do S3 Explorer
 * 
 * Este script gerencia a interface do dashboard, permitindo aos usuários:
 * - Visualizar e navegar por buckets S3
 * - Criar novos buckets
 * - Fazer upload de arquivos
 * - Fazer download de objetos
 */
document.addEventListener('DOMContentLoaded', () => {
    // Debug
    console.log('Dashboard carregado');
    
    // Elementos da UI
    const bucketsList = document.getElementById('bucketsList');
    const objectsList = document.getElementById('objectsList');
    const prefixFilter = document.getElementById('prefixFilter');
    const downloadSelected = document.getElementById('downloadSelected');
    const downloadAll = document.getElementById('downloadAll');
    const logoutBtn = document.getElementById('logoutBtn');
    const loading = document.getElementById('loading');
    
    // Elementos para criar bucket
    const createBucketBtn = document.getElementById('createBucketBtn');
    const createBucketModal = document.getElementById('createBucketModal');
    const closeBucketModal = document.getElementById('closeBucketModal');
    const cancelBucketBtn = document.getElementById('cancelBucketBtn');
    const createBucketForm = document.getElementById('createBucketForm');
    
    // Elementos para upload de arquivos
    const uploadFilesBtn = document.getElementById('uploadFilesBtn');
    const uploadModal = document.getElementById('uploadModal');
    const closeUploadModal = document.getElementById('closeUploadModal');
    const cancelUploadBtn = document.getElementById('cancelUploadBtn');
    const uploadForm = document.getElementById('uploadForm');
    const fileUpload = document.getElementById('fileUpload');
    const fileList = document.getElementById('fileList');
    
    // Função para criar um novo bucket
    const createBucket = async (bucketName, region) => {
        try {
            toggleLoading(true);
            
            const response = await fetch('http://localhost:8000/create-bucket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'access_key': accessKey,
                    'secret_key': secretKey
                },
                body: JSON.stringify({
                    bucket_name: bucketName,
                    region: region
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                return { success: true, message: `Bucket "${bucketName}" criado com sucesso!` };
            } else {
                throw new Error(data.error || 'Erro ao criar bucket');
            }
        } catch (error) {
            console.error('Erro ao criar bucket:', error);
            return { success: false, message: `Erro ao criar bucket: ${error.message}` };
        } finally {
            toggleLoading(false);
        }
    };
    
    // Função para fazer upload de arquivos
    const uploadFiles = async (files, bucket, prefix = '') => {
        try {
            toggleLoading(true);
            
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }
            
            if (prefix) {
                formData.append('prefix', prefix);
            }
            
            const response = await fetch(`http://localhost:8000/upload/${bucket}`, {
                method: 'POST',
                headers: {
                    'access_key': accessKey,
                    'secret_key': secretKey
                },
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                return { success: true, message: `${files.length} arquivo(s) enviado(s) com sucesso!` };
            } else {
                throw new Error(data.error || 'Erro ao enviar arquivos');
            }
        } catch (error) {
            console.error('Erro ao enviar arquivos:', error);
            return { success: false, message: `Erro ao enviar arquivos: ${error.message}` };
        } finally {
            toggleLoading(false);
        }
    };

    // Variáveis de estado
    let currentBucket = '';
    let currentPrefix = '';
    let selectedObjects = new Set();
    
    // Credenciais da AWS do localStorage
    const accessKey = localStorage.getItem('s3_access_key');
    const secretKey = localStorage.getItem('s3_secret_key');

    // Verificar se as credenciais existem
    if (!accessKey || !secretKey) {
        console.log('Credenciais não encontradas no localStorage, redirecionando para login');
        window.location.href = 'index.html';
        return;
    }
    
    console.log('Credenciais encontradas:', { 
        accessKey: accessKey ? accessKey.substring(0, 3) + '...' : 'undefined', 
        secretKey: secretKey ? '***' : 'undefined' 
    });

    // Função para mostrar/esconder o loading
    const toggleLoading = (show) => {
        loading.style.display = show ? 'flex' : 'none';
    };

    // Função para carregar os buckets
    const loadBuckets = async () => {
        try {
            toggleLoading(true);
            
            console.log('Carregando buckets com credenciais:', { accessKey: accessKey.substring(0, 3) + '...', secretKey: '***' });
            const response = await fetch('http://localhost:8000/buckets', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'access_key': accessKey,
                    'secret_key': secretKey
                }
            });
            console.log('Resposta do servidor:', response.status);

            if (!response.ok) {
                throw new Error('Falha ao carregar buckets');
            }

            const data = await response.json();
            console.log('Dados recebidos:', data);
            
            if (data.success && data.buckets) {
                renderBuckets(data.buckets);
            } else {
                throw new Error('Formato de resposta inválido');
            }
        } catch (error) {
            console.error('Erro ao carregar buckets:', error);
            bucketsList.innerHTML = `
                <div class="text-red-500 text-center p-4">
                    <i class="fas fa-exclamation-triangle mb-2"></i>
                    <p>Erro ao carregar buckets</p>
                </div>
            `;
        } finally {
            toggleLoading(false);
        }
    };

    // Função para renderizar a lista de buckets
    const renderBuckets = (buckets) => {
        if (buckets.length === 0) {
            bucketsList.innerHTML = `
                <div class="text-center p-4 text-slate-400">
                    <i class="fas fa-info-circle mb-2"></i>
                    <p>Nenhum bucket encontrado</p>
                </div>
            `;
            return;
        }

        bucketsList.innerHTML = buckets
            .sort((a, b) => a.Name.localeCompare(b.Name))
            .map(bucket => `
                <button 
                    class="bucket-item w-full text-left p-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors flex items-center space-x-2 ${currentBucket === bucket.Name ? 'ring-2 ring-blue-500' : ''}"
                    data-bucket="${bucket.Name}">
                    <i class="fas fa-folder text-blue-400"></i>
                    <span class="truncate">${bucket.Name}</span>
                </button>
            `)
            .join('');

        // Adicionar event listeners aos botões de bucket
        document.querySelectorAll('.bucket-item').forEach(button => {
            button.addEventListener('click', () => {
                const bucketName = button.getAttribute('data-bucket');
                currentBucket = bucketName;
                currentPrefix = '';
                prefixFilter.value = '';
                loadObjects(bucketName);
                
                // Atualizar seleção visual
                document.querySelectorAll('.bucket-item').forEach(b => {
                    b.classList.remove('ring-2', 'ring-blue-500');
                });
                button.classList.add('ring-2', 'ring-blue-500');
            });
        });
    };

    // Função para carregar objetos de um bucket
    const loadObjects = async (bucket, prefix = '') => {
        try {
            toggleLoading(true);
            
            const url = `http://localhost:8000/objects/${bucket}${prefix ? `?prefix=${encodeURIComponent(prefix)}` : ''}`;
            console.log('Carregando objetos de:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'access_key': accessKey,
                    'secret_key': secretKey
                }
            });

            if (!response.ok) {
                throw new Error('Falha ao carregar objetos');
            }

            const data = await response.json();
            console.log('Dados de objetos recebidos:', data);
            
            if (data.success) {
                renderObjects(bucket, data.objects, data.prefixes || [], prefix);
            } else {
                throw new Error('Formato de resposta inválido');
            }
        } catch (error) {
            console.error('Erro ao carregar objetos:', error);
            objectsList.querySelector('.overflow-x-auto').innerHTML = `
                <div class="text-red-500 text-center p-4">
                    <i class="fas fa-exclamation-triangle mb-2"></i>
                    <p>Erro ao carregar objetos do bucket ${bucket}</p>
                </div>
            `;
        } finally {
            toggleLoading(false);
        }
    };

    // Função para renderizar a lista de objetos
    const renderObjects = (bucket, objects, prefixes, currentPrefix) => {
        // Atualizar o título
        const objectsTitle = document.querySelector('#objectsList h3');
        objectsTitle.textContent = currentPrefix 
            ? `${bucket}: /${currentPrefix}` 
            : `Conteúdo do Bucket: ${bucket}`;
        
        // Se não houver objetos nem prefixos
        if ((objects?.length === 0 || !objects) && (prefixes?.length === 0 || !prefixes)) {
            objectsList.querySelector('.overflow-x-auto').innerHTML = `
                <div class="text-center p-4 text-slate-400">
                    <i class="fas fa-info-circle mb-2"></i>
                    <p>Bucket vazio ou nenhum objeto encontrado com o filtro atual</p>
                </div>
            `;
            downloadAll.disabled = true;
            downloadSelected.disabled = true;
            return;
        }

        // Construir navegação de pastas (breadcrumbs)
        let breadcrumbsHtml = '';
        if (currentPrefix) {
            const parts = currentPrefix.split('/').filter(Boolean);
            let path = '';
            
            breadcrumbsHtml = `
                <div class="flex flex-wrap items-center mb-4 bg-slate-700 p-2 rounded-lg overflow-x-auto">
                    <button class="text-blue-400 hover:underline flex items-center" data-prefix="">
                        <i class="fas fa-home mr-1"></i> Raiz
                    </button>
            `;
            
            parts.forEach((part, index) => {
                path += part + '/';
                breadcrumbsHtml += `
                    <span class="mx-2 text-slate-400">/</span>
                    <button class="text-blue-400 hover:underline truncate" data-prefix="${path}">
                        ${part}
                    </button>
                `;
            });
            
            breadcrumbsHtml += '</div>';
        }

        // Construir tabela de objetos
        let tableHtml = `
            ${breadcrumbsHtml}
            <table class="min-w-full">
                <thead>
                    <tr class="border-b border-slate-700">
                        <th class="py-2 px-4 text-left w-8">
                            <input type="checkbox" id="selectAll" class="rounded text-blue-500 focus:ring-blue-500">
                        </th>
                        <th class="py-2 px-4 text-left">Nome</th>
                        <th class="py-2 px-4 text-left">Tamanho</th>
                        <th class="py-2 px-4 text-left">Última Modificação</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // Adicionar pastas (prefixos)
        prefixes.forEach(prefix => {
            const folderName = prefix.Prefix.replace(currentPrefix, '').replace(/\/$/, '');
            tableHtml += `
                <tr class="border-b border-slate-700 hover:bg-slate-700">
                    <td class="py-2 px-4"></td>
                    <td class="py-2 px-4">
                        <button class="folder-item flex items-center text-blue-400 hover:underline" data-prefix="${prefix.Prefix}">
                            <i class="fas fa-folder mr-2"></i>
                            <span class="truncate">${folderName}</span>
                        </button>
                    </td>
                    <td class="py-2 px-4">-</td>
                    <td class="py-2 px-4">-</td>
                </tr>
            `;
        });

        // Adicionar arquivos (objetos)
        if (objects && objects.length > 0) {
            objects.forEach(object => {
                // Ignorar objetos que são "pastas" (terminam com /)
                if (object.Key.endsWith('/')) return;
                
                // Ignorar objetos que não estão no nível atual (estão em subpastas)
                const keyWithoutPrefix = object.Key.replace(currentPrefix, '');
                if (keyWithoutPrefix.includes('/')) return;
                
                const fileName = object.Key.split('/').pop();
                const fileSize = formatFileSize(object.Size);
                const lastModified = new Date(object.LastModified).toLocaleString();
                
                // Determinar o ícone com base na extensão do arquivo
                let fileIcon = 'fa-file';
                const extension = fileName.split('.').pop().toLowerCase();
                
                // Ícones para tipos de arquivo comuns
                if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension)) {
                    fileIcon = 'fa-file-image';
                } else if (['pdf'].includes(extension)) {
                    fileIcon = 'fa-file-pdf';
                } else if (['doc', 'docx'].includes(extension)) {
                    fileIcon = 'fa-file-word';
                } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
                    fileIcon = 'fa-file-excel';
                } else if (['ppt', 'pptx'].includes(extension)) {
                    fileIcon = 'fa-file-powerpoint';
                } else if (['zip', 'rar', 'tar', 'gz', '7z'].includes(extension)) {
                    fileIcon = 'fa-file-archive';
                } else if (['mp3', 'wav', 'ogg'].includes(extension)) {
                    fileIcon = 'fa-file-audio';
                } else if (['mp4', 'avi', 'mov', 'wmv'].includes(extension)) {
                    fileIcon = 'fa-file-video';
                } else if (['html', 'css', 'js', 'php', 'py', 'java', 'c', 'cpp', 'cs'].includes(extension)) {
                    fileIcon = 'fa-file-code';
                } else if (['txt', 'md'].includes(extension)) {
                    fileIcon = 'fa-file-alt';
                }
            
                tableHtml += `
                    <tr class="border-b border-slate-700 hover:bg-slate-700">
                        <td class="py-2 px-4">
                            <input type="checkbox" class="object-checkbox rounded text-blue-500 focus:ring-blue-500" 
                                data-key="${object.Key}" data-size="${object.Size}">
                        </td>
                        <td class="py-2 px-4">
                            <div class="flex items-center">
                                <i class="fas ${fileIcon} mr-2 text-slate-400"></i>
                                <span class="truncate">${fileName}</span>
                            </div>
                        </td>
                        <td class="py-2 px-4">${fileSize}</td>
                        <td class="py-2 px-4">${lastModified}</td>
                    </tr>
                `;
            });
        }

        tableHtml += `
                </tbody>
            </table>
        `;

        objectsList.querySelector('.overflow-x-auto').innerHTML = tableHtml;

        // Adicionar event listeners
        // Para navegação de pastas
        document.querySelectorAll('.folder-item').forEach(button => {
            button.addEventListener('click', () => {
                const prefix = button.getAttribute('data-prefix');
                currentPrefix = prefix;
                loadObjects(currentBucket, prefix);
            });
        });

        // Para breadcrumbs
        document.querySelectorAll('[data-prefix]').forEach(button => {
            button.addEventListener('click', () => {
                const prefix = button.getAttribute('data-prefix');
                currentPrefix = prefix;
                loadObjects(currentBucket, prefix);
            });
        });

        // Para seleção de objetos
        const checkboxes = document.querySelectorAll('.object-checkbox');
        const selectAllCheckbox = document.getElementById('selectAll');
        
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const key = checkbox.getAttribute('data-key');
                
                if (checkbox.checked) {
                    selectedObjects.add(key);
                } else {
                    selectedObjects.delete(key);
                }
                
                updateDownloadButtons();
            });
        });
        
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', () => {
                checkboxes.forEach(checkbox => {
                    checkbox.checked = selectAllCheckbox.checked;
                    
                    const key = checkbox.getAttribute('data-key');
                    if (selectAllCheckbox.checked) {
                        selectedObjects.add(key);
                    } else {
                        selectedObjects.delete(key);
                    }
                });
                
                updateDownloadButtons();
            });
        }
        
        // Habilitar botão de download de todo o bucket
        downloadAll.disabled = false;
    };

    // Função para atualizar o estado dos botões de download
    const updateDownloadButtons = () => {
        downloadSelected.disabled = selectedObjects.size === 0;
    };

    // Função para formatar o tamanho do arquivo
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Event listener para o filtro de prefixo
    prefixFilter.addEventListener('keyup', (e) => {
        if (e.key === 'Enter' && currentBucket) {
            currentPrefix = prefixFilter.value.trim();
            if (currentPrefix && !currentPrefix.endsWith('/')) {
                currentPrefix += '/';
            }
            loadObjects(currentBucket, currentPrefix);
        }
    });

    // Função para fazer download de um objeto
    const downloadObject = (bucket, key) => {
        console.log(`Iniciando download do objeto: ${key} do bucket: ${bucket}`);
        
        // Criar URL para download
        const downloadUrl = `http://localhost:8000/download/${bucket}/${encodeURIComponent(key)}`;
        
        // Criar um elemento <a> temporário para iniciar o download
        const link = document.createElement('a');
        link.href = downloadUrl;
        
        // Adicionar headers de autenticação via URL params (não é o ideal para produção)
        link.href += `?access_token=${encodeURIComponent(accessKey)}&secret_token=${encodeURIComponent(secretKey)}`;
        
        // Definir o nome do arquivo como a última parte da chave
        const fileName = key.split('/').pop();
        link.download = fileName;
        
        // Adicionar ao documento, clicar e remover
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Event listener para o botão de download de objetos selecionados
    downloadSelected.addEventListener('click', () => {
        if (selectedObjects.size === 0) return;
        
        const totalObjects = selectedObjects.size;
        let downloadedCount = 0;
        
        // Mostrar mensagem de início
        alert(`Download iniciado para ${totalObjects} objeto(s) selecionado(s)`);
        
        // Converter Set para Array para poder iterar
        Array.from(selectedObjects).forEach(key => {
            // Pequeno delay entre downloads para evitar sobrecarga do navegador
            setTimeout(() => {
                downloadObject(currentBucket, key);
                downloadedCount++;
                
                // Mostrar mensagem de conclusão quando todos os downloads forem iniciados
                if (downloadedCount === totalObjects) {
                    console.log(`Todos os ${totalObjects} downloads foram iniciados`);
                }
            }, 500 * downloadedCount); // 500ms de intervalo entre cada download
        });
    });

    // Event listener para o botão de download de todo o bucket
    downloadAll.addEventListener('click', () => {
        if (!currentBucket) return;
        
        // Confirmar com o usuário
        if (!confirm(`Isso iniciará o download de todos os objetos visíveis no bucket ${currentBucket}. Continuar?`)) {
            return;
        }
        
        // Obter todos os checkboxes de objetos
        const checkboxes = document.querySelectorAll('.object-checkbox');
        const objectsToDownload = [];
        
        checkboxes.forEach(checkbox => {
            const key = checkbox.getAttribute('data-key');
            if (key) {
                objectsToDownload.push(key);
            }
        });
        
        if (objectsToDownload.length === 0) {
            alert('Nenhum objeto disponível para download');
            return;
        }
        
        alert(`Download iniciado para ${objectsToDownload.length} objeto(s) do bucket ${currentBucket}`);
        
        // Iniciar downloads com pequeno intervalo
        objectsToDownload.forEach((key, index) => {
            setTimeout(() => {
                downloadObject(currentBucket, key);
                
                // Mostrar mensagem de conclusão quando todos os downloads forem iniciados
                if (index === objectsToDownload.length - 1) {
                    console.log(`Todos os ${objectsToDownload.length} downloads foram iniciados`);
                }
            }, 500 * index); // 500ms de intervalo entre cada download
        });
    });

    // Event listener para o botão de logout
    logoutBtn.addEventListener('click', () => {
        console.log('Logout clicked');
        // Limpar as credenciais do localStorage
        localStorage.removeItem('s3_access_key');
        localStorage.removeItem('s3_secret_key');
        // Forçar o redirecionamento para a página de login
        window.location.replace('index.html');
    });

    // Event listeners para o modal de criar bucket
    if (createBucketBtn && createBucketModal) {
        createBucketBtn.addEventListener('click', () => {
            createBucketModal.classList.remove('hidden');
        });
        
        if (closeBucketModal) {
            closeBucketModal.addEventListener('click', () => {
                createBucketModal.classList.add('hidden');
            });
        }
        
        if (cancelBucketBtn) {
            cancelBucketBtn.addEventListener('click', () => {
                createBucketModal.classList.add('hidden');
            });
        }
        
        if (createBucketForm) {
            createBucketForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const bucketName = document.getElementById('bucketName').value.trim();
                const bucketRegion = document.getElementById('bucketRegion').value;
                
                if (!bucketName) {
                    alert('Por favor, insira um nome para o bucket.');
                    return;
                }
                
                const result = await createBucket(bucketName, bucketRegion);
                alert(result.message);
                
                if (result.success) {
                    createBucketModal.classList.add('hidden');
                    document.getElementById('bucketName').value = '';
                    // Recarregar a lista de buckets
                    loadBuckets();
                }
            });
        }
    }
    
    // Event listeners para o modal de upload
    if (uploadFilesBtn && uploadModal) {
        uploadFilesBtn.addEventListener('click', () => {
            // Verificar se um bucket foi selecionado
            if (!currentBucket) {
                alert('Por favor, selecione um bucket primeiro.');
                return;
            }
            
            console.log('Abrindo modal de upload para bucket:', currentBucket);
            
            // Preencher o prefixo atual se existir
            document.getElementById('uploadPrefix').value = currentPrefix || '';
            
            // Limpar a lista de arquivos selecionados
            fileList.innerHTML = '';
            fileUpload.value = '';
            
            uploadModal.classList.remove('hidden');
        });
        
        if (closeUploadModal) {
            closeUploadModal.addEventListener('click', () => {
                uploadModal.classList.add('hidden');
            });
        }
        
        if (cancelUploadBtn) {
            cancelUploadBtn.addEventListener('click', () => {
                uploadModal.classList.add('hidden');
            });
        }
        
        // Event listener para seleção de arquivos
        if (fileUpload && fileList) {
            fileUpload.addEventListener('change', () => {
                const files = fileUpload.files;
                
                fileList.innerHTML = '';
                
                if (files.length === 0) {
                    fileList.innerHTML = '<p class="text-slate-400 text-center">Nenhum arquivo selecionado</p>';
                    return;
                }
                
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const fileSize = formatFileSize(file.size);
                    
                    const fileItem = document.createElement('div');
                    fileItem.className = 'flex items-center justify-between p-2 border-b border-slate-700';
                    fileItem.innerHTML = `
                        <div class="flex items-center">
                            <i class="fas fa-file text-slate-400 mr-2"></i>
                            <span class="truncate">${file.name}</span>
                        </div>
                        <span class="text-xs text-slate-400">${fileSize}</span>
                    `;
                    
                    fileList.appendChild(fileItem);
                }
            });
        }
        
        // Event listener para o formulário de upload
        if (uploadForm) {
            uploadForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const files = fileUpload.files;
                if (files.length === 0) {
                    alert('Por favor, selecione pelo menos um arquivo.');
                    return;
                }
                
                const prefix = document.getElementById('uploadPrefix').value.trim();
                const formattedPrefix = prefix && !prefix.endsWith('/') ? `${prefix}/` : prefix;
                
                // Verificar novamente se um bucket está selecionado
                if (!currentBucket) {
                    alert('Nenhum bucket selecionado. Por favor, selecione um bucket primeiro.');
                    return;
                }
                
                console.log('Enviando arquivos para bucket:', currentBucket);
                const result = await uploadFiles(Array.from(files), currentBucket, formattedPrefix);
                alert(result.message);
                
                if (result.success) {
                    uploadModal.classList.add('hidden');
                    // Recarregar a lista de objetos
                    loadObjects(currentBucket, currentPrefix);
                }
            });
        }
    }
    
    // Inicializar a aplicação
    loadBuckets();
});


