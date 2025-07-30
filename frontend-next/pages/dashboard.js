import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Head from 'next/head';
import { Sidebar } from '../components/dashboard/Sidebar';
import { StatsCards } from '../components/dashboard/StatsCards';
import { ObjectsList } from '../components/dashboard/ObjectsList';
import { StorageDetailsModal } from '../components/dashboard/StorageDetailsModal';
import CreateBucketModal from '../components/dashboard/CreateBucketModal';
import UploadModal from '../components/dashboard/UploadModal';
import { Button } from '../components/ui/Button';
import apiService from '../services/api';

export default function Dashboard({ showNotification }) {
  const { isAuthenticated, isLoading, isOfflineMode } = useAuth();
  const router = useRouter();
  
  // Estados para gerenciar a interface
  const [currentBucket, setCurrentBucket] = useState('');
  const [objectCount, setObjectCount] = useState(0);
  const [storageSize, setStorageSize] = useState('0 B');
  const [viewMode, setViewMode] = useState('list');
  const [isLoadingObjects, setIsLoadingObjects] = useState(false);
  const [objectsError, setObjectsError] = useState(null);
  const [objects, setObjects] = useState([]);
  const [prefixes, setPrefixes] = useState([]);
  const [currentPrefix, setCurrentPrefix] = useState('');
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [showCreateBucketModal, setShowCreateBucketModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedObjectItems, setSelectedObjectItems] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [storageDetails, setStorageDetails] = useState({
    totalSize: '0 B',
    totalFileCount: 0,
    largestFiles: [],
    fileTypes: []
  });
  
  // Verificar autenticação
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);
  
  const { credentials } = useAuth();
  
  // Carregar objetos quando o bucket ou prefix mudar
  useEffect(() => {
    if (currentBucket && credentials) {
      // Carregar objetos da pasta atual
      loadObjects(currentBucket, currentPrefix);
      
      // Se estiver na raiz ou ao selecionar um bucket, carregar o tamanho total do bucket
      if (!currentPrefix) {
        loadBucketTotalSize(currentBucket);
      }
    }
  }, [currentBucket, currentPrefix, credentials]);
  
  // Função para carregar o tamanho total do bucket
  const loadBucketTotalSize = async (bucketName) => {
    try {
      if (!credentials) return;
      
      const result = await apiService.getBucketSize(
        credentials.accessKey,
        credentials.secretKey,
        bucketName
      );
      
      if (result.success) {
        // Atualizar o tamanho total do bucket
        setStorageSize(result.formattedSize);
        
        // Atualizar detalhes de armazenamento
        setStorageDetails(prev => ({
          ...prev,
          totalSize: result.formattedSize,
          totalFileCount: result.totalObjects
        }));
      }
    } catch (error) {
      console.error('Erro ao obter tamanho do bucket:', error);
    }
  };
  
  // Função para carregar objetos do bucket
  const loadObjects = async (bucket, prefix = '') => {
    setIsLoadingObjects(true);
    setObjectsError(null);
    
    try {
      if (!credentials) {
        throw new Error('Credenciais não disponíveis');
      }
      
      const result = await apiService.listObjects(
        credentials.accessKey, 
        credentials.secretKey, 
        bucket, 
        prefix
      );
      
      if (result.success) {
        setObjects(result.objects || []);
        setPrefixes(result.prefixes || []);
        
        // Calcular estatísticas - contando prefixes (pastas) + objetos (arquivos)
        const totalItems = (result.objects || []).length + (result.prefixes || []).length;
        setObjectCount(totalItems);
        const totalSize = (result.objects || []).reduce((sum, obj) => sum + (obj.Size || 0), 0);
        setStorageSize(formatBytes(totalSize));
        
        // Preparar dados para o modal de detalhes de armazenamento
        prepareStorageDetails(result.objects || []);
      } else {
        // Fallback para dados simulados em caso de erro
        console.log('Erro ao carregar objetos, usando dados simulados');
        
        // Gerar objetos simulados
        const simulatedObjects = Array.from({ length: 15 }, (_, i) => ({
          Key: `${prefix}file-${i + 1}.pdf`,
          Size: Math.floor(Math.random() * 1024 * 1024 * 10), // Até 10MB
          LastModified: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Últimos 30 dias
        }));
        
        const simulatedPrefixes = ['folder1/', 'folder2/', 'images/', 'documents/'].map(p => ({ Prefix: prefix + p }));
        
        setObjects(simulatedObjects);
        setPrefixes(simulatedPrefixes);
        
        // Calcular estatísticas - contando prefixes (pastas) + objetos (arquivos)
        const totalItems = simulatedObjects.length + simulatedPrefixes.length;
        setObjectCount(totalItems);
        const totalSize = simulatedObjects.reduce((sum, obj) => sum + obj.Size, 0);
        setStorageSize(formatBytes(totalSize));
        
        setObjectsError('Usando dados simulados devido a erro na API');
      }
    } catch (err) {
      console.error(`Erro ao listar objetos do bucket ${bucket}:`, err);
      setObjectsError(`Erro ao carregar objetos: ${err.message}`);
      
      // Dados simulados em caso de erro
      const simulatedObjects = Array.from({ length: 5 }, (_, i) => ({
        Key: `${prefix}file-${i + 1}.pdf`,
        Size: Math.floor(Math.random() * 1024 * 1024 * 5),
        LastModified: new Date()
      }));
      
      setObjects(simulatedObjects);
      setPrefixes([{ Prefix: 'error/' }]);
      // Calcular estatísticas - contando prefixes (pastas) + objetos (arquivos)
      const totalItems = simulatedObjects.length + 1; // +1 para a pasta de erro
      setObjectCount(totalItems);
      const totalSize = simulatedObjects.reduce((sum, obj) => sum + obj.Size, 0);
      setStorageSize(formatBytes(totalSize));
    } finally {
      setIsLoadingObjects(false);
    }
  };
  
  // Função para selecionar um bucket
  const handleSelectBucket = (bucketName) => {
    setCurrentBucket(bucketName);
    setCurrentPrefix('');
    showNotification(`Bucket "${bucketName}" selecionado`, 'success');
    // O useEffect cuidará de carregar os objetos e o tamanho total do bucket
  };
  
  // Função para navegar para uma pasta
  const handleNavigateToPrefix = (prefix) => {
    setCurrentPrefix(prefix);
    const folderName = prefix.split('/').filter(Boolean).pop() || 'raiz';
    showNotification(`Navegando para pasta: ${folderName}`, 'info');
    // O useEffect cuidará de carregar os objetos e o tamanho total do bucket quando necessário
  };
  
  // Função para preparar detalhes de armazenamento
  const prepareStorageDetails = (objectsList) => {
    // Calcular tamanho total
    const totalSize = objectsList.reduce((sum, obj) => sum + (obj.Size || 0), 0);
    
    // Agrupar por tipo de arquivo
    const typeGroups = {};
    let totalFileCount = 0;
    
    objectsList.forEach(obj => {
      const extension = obj.Key.split('.').pop().toLowerCase();
      const type = getFileTypeInfo(extension);
      
      if (!typeGroups[type.name]) {
        typeGroups[type.name] = {
          name: type.name,
          icon: type.icon,
          color: type.color,
          count: 0,
          size: 0
        };
      }
      
      typeGroups[type.name].count++;
      typeGroups[type.name].size += obj.Size || 0;
      totalFileCount++;
    });
    
    // Converter para array e ordenar por tamanho
    const fileTypes = Object.values(typeGroups).map(type => ({
      ...type,
      size: formatBytes(type.size)
    })).sort((a, b) => b.count - a.count);
    
    // Obter os 5 maiores arquivos
    const largestFiles = [...objectsList]
      .sort((a, b) => (b.Size || 0) - (a.Size || 0))
      .slice(0, 5)
      .map(obj => ({
        name: obj.Key.split('/').pop(),
        size: formatBytes(obj.Size || 0),
        type: getFileTypeInfo(obj.Key.split('.').pop().toLowerCase()).name,
        lastModified: formatDate(obj.LastModified)
      }));
    
    setStorageDetails({
      totalSize: formatBytes(totalSize),
      totalFileCount,
      largestFiles,
      fileTypes
    });
  };
  
  // Função para obter informações sobre o tipo de arquivo
  const getFileTypeInfo = (extension) => {
    const fileTypes = {
      pdf: { name: 'PDF', icon: 'file-pdf', color: 'red' },
      doc: { name: 'Word', icon: 'file-word', color: 'blue' },
      docx: { name: 'Word', icon: 'file-word', color: 'blue' },
      xls: { name: 'Excel', icon: 'file-excel', color: 'green' },
      xlsx: { name: 'Excel', icon: 'file-excel', color: 'green' },
      ppt: { name: 'PowerPoint', icon: 'file-powerpoint', color: 'orange' },
      pptx: { name: 'PowerPoint', icon: 'file-powerpoint', color: 'orange' },
      jpg: { name: 'Imagem', icon: 'file-image', color: 'purple' },
      jpeg: { name: 'Imagem', icon: 'file-image', color: 'purple' },
      png: { name: 'Imagem', icon: 'file-image', color: 'purple' },
      gif: { name: 'Imagem', icon: 'file-image', color: 'purple' },
      mp4: { name: 'Vídeo', icon: 'file-video', color: 'pink' },
      mp3: { name: 'Áudio', icon: 'file-audio', color: 'yellow' },
      zip: { name: 'Arquivo', icon: 'file-archive', color: 'orange' },
      rar: { name: 'Arquivo', icon: 'file-archive', color: 'orange' },
      txt: { name: 'Texto', icon: 'file-alt', color: 'blue' },
      json: { name: 'JSON', icon: 'file-code', color: 'green' },
      html: { name: 'HTML', icon: 'file-code', color: 'red' },
      css: { name: 'CSS', icon: 'file-code', color: 'blue' },
      js: { name: 'JavaScript', icon: 'file-code', color: 'yellow' }
    };
    
    return fileTypes[extension] || { name: 'Outro', icon: 'file', color: 'gray' };
  };
  
  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Função para verificar se o serviço de download está disponível
  const checkDownloadService = async () => {
    try {
      // Bypass da verificação para permitir download em qualquer bucket
      return true;
      
      // Código original comentado:
      // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/download-status`);
      // return response.ok;
    } catch (error) {
      console.error('Erro ao verificar serviço de download:', error);
      return false;
    }
  };

  // Função para iniciar download com indicador de progresso
  const startDownloadWithProgress = async (downloadFn, filename, message) => {
    try {
      if (isOfflineMode) {
        showNotification('Download não disponível no modo offline', 'info');
        return null;
      }
      
      if (!credentials) {
        throw new Error('Credenciais não disponíveis');
      }
      
      setIsDownloading(true);
      showNotification(message, 'info');
      
      // Mostrar indicador de progresso
      const progressIndicator = document.createElement('div');
      progressIndicator.className = 'fixed top-0 left-0 w-full h-1 bg-blue-500 animate-pulse';
      document.body.appendChild(progressIndicator);
      
      // Adicionar overlay de progresso
      const overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      overlay.innerHTML = `
        <div class="bg-slate-800 p-6 rounded-lg shadow-lg text-center">
          <div class="loading-spinner mx-auto mb-4"></div>
          <p class="text-white text-lg mb-2">${message}</p>
          <p class="text-slate-300 text-sm">Isso pode levar algum tempo dependendo do tamanho dos arquivos</p>
        </div>
      `;
      document.body.appendChild(overlay);
      
      // Executar a função de download
      const blob = await downloadFn();
      
      // Remover indicador de progresso e overlay
      document.body.removeChild(progressIndicator);
      document.body.removeChild(overlay);
      
      // Criar URL para download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return blob;
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      showNotification(`Erro ao fazer download: ${error.message}`, 'error');
      
      // Remover indicador de progresso e overlay em caso de erro
      const progressIndicator = document.querySelector('.fixed.top-0.left-0.w-full.h-1.bg-blue-500');
      if (progressIndicator) {
        document.body.removeChild(progressIndicator);
      }
      
      const overlay = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
      if (overlay) {
        document.body.removeChild(overlay);
      }
      
      return null;
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Função para abrir o modal de criação de bucket
  const handleCreateBucket = () => {
    setShowCreateBucketModal(true);
  };
  
  // Função para criar um novo bucket
  const createBucket = async (bucketName, region) => {
    try {
      if (isOfflineMode) {
        showNotification(`Bucket "${bucketName}" criado com sucesso! (simulado)`, 'success');
        return;
      }
      
      if (!credentials) {
        throw new Error('Credenciais não disponíveis');
      }
      
      const result = await apiService.createBucket(
        credentials.accessKey,
        credentials.secretKey,
        bucketName,
        region
      );
      
      if (result.success) {
        showNotification(`Bucket "${bucketName}" criado com sucesso!`, 'success');
        // Atualizar a lista de buckets (isso será feito pelo componente Sidebar)
      } else {
        throw new Error(result.message || 'Erro ao criar bucket');
      }
    } catch (error) {
      console.error('Erro ao criar bucket:', error);
      showNotification(`Erro ao criar bucket: ${error.message}`, 'error');
      throw error;
    }
  };
  
  // Função para abrir o modal de upload
  const handleUploadFiles = () => {
    if (isOfflineMode) {
      showNotification('Funcionalidade de upload não disponível no modo offline', 'info');
      return;
    }
    setShowUploadModal(true);
  };
  
  // Função para realizar o upload de arquivos
  const uploadFiles = async (files, prefix = '', progressCallback = null) => {
    try {
      if (isOfflineMode) {
        showNotification('Upload simulado com sucesso!', 'success');
        return;
      }
      
      if (!credentials) {
        throw new Error('Credenciais não disponíveis');
      }
      
      if (!currentBucket) {
        throw new Error('Nenhum bucket selecionado');
      }
      
      // Usar o prefixo atual se não for fornecido
      const targetPrefix = prefix || currentPrefix;
      
      // Fazer upload dos arquivos com suporte a progresso
      const result = await apiService.uploadFiles(
        credentials.accessKey,
        credentials.secretKey,
        currentBucket,
        files,
        targetPrefix,
        progressCallback
      );
      
      if (result.success) {
        showNotification(`${files.length} arquivo(s) enviado(s) com sucesso!`, 'success');
        // Recarregar a lista de objetos para mostrar os novos arquivos
        loadObjects(currentBucket, currentPrefix);
      } else {
        throw new Error(result.message || 'Erro ao fazer upload');
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      showNotification(`Erro ao fazer upload: ${error.message}`, 'error');
      throw error;
    }
  };
  
  // Função para deletar bucket
  const handleDeleteBucket = async () => {
    if (!currentBucket) return;
    
    // Verificar se o bucket está vazio
    if (objects.length > 0 || prefixes.length > 0) {
      showNotification(`O bucket "${currentBucket}" não está vazio. Remova todos os objetos antes de deletar o bucket.`, 'warning');
      return;
    }
    
    const confirm = window.confirm(`Tem certeza que deseja deletar o bucket "${currentBucket}"? Esta ação não pode ser desfeita.`);
    if (!confirm) return;
    
    try {
      if (isOfflineMode) {
        showNotification(`Bucket "${currentBucket}" deletado com sucesso! (simulado)`, 'success');
      } else {
        if (!credentials) {
          throw new Error('Credenciais não disponíveis');
        }
        
        const result = await apiService.deleteBucket(
          credentials.accessKey,
          credentials.secretKey,
          currentBucket
        );
        
        if (result.success) {
          showNotification(`Bucket "${currentBucket}" deletado com sucesso!`, 'success');
        } else {
          throw new Error(result.message || 'Erro ao deletar bucket');
        }
      }
      
      // Limpar o estado após a deleção
      setCurrentBucket('');
      setObjects([]);
      setPrefixes([]);
      setObjectCount(0);
      setStorageSize('0 B');
    } catch (error) {
      console.error('Erro ao deletar bucket:', error);
      showNotification(`Erro ao deletar bucket: ${error.message}`, 'error');
    }
  };
  
  if (isLoading) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
        <p className="mt-4 text-lg text-white">Carregando...</p>
      </div>
    );
  }
  
  return (
    <div className="gradient-bg min-h-screen text-white">
      <Head>
        <title>S3 Explorer - Dashboard</title>
      </Head>
      
      {/* Banner de modo offline */}
      {isOfflineMode && (
        <div className="bg-yellow-600 text-white text-center py-2 px-4">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          Modo offline: Usando dados simulados. Algumas funcionalidades estão limitadas.
        </div>
      )}
      
      <div className="dashboard-container flex flex-col md:flex-row">
        {/* Sidebar */}
        <Sidebar 
          onCreateBucket={handleCreateBucket} 
          onSelectBucket={handleSelectBucket}
          selectedBucket={currentBucket}
          isOfflineMode={isOfflineMode}
        />
        
        {/* Main Content */}
        <main className="main-content flex-1 p-4">
          {/* Header */}
          <header className="mb-6">
            <div className="neon-border rounded-xl p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                  <h1 className="text-2xl font-bold neon-blue">AWS S3 Explorer</h1>
                  <p className="text-slate-300">Gerencie seus buckets e objetos</p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-search text-slate-400"></i>
                    </div>
                    <input 
                      type="text" 
                      className="w-full md:w-64 bg-slate-700 bg-opacity-70 border border-slate-600 rounded-lg pl-10 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-400"
                      placeholder="Filtrar por pasta"
                      onChange={(e) => setCurrentPrefix(e.target.value)}
                      disabled={!currentBucket}
                    />
                  </div>
                  
                  <div className="view-toggle hidden md:flex bg-slate-700 rounded-lg p-1">
                    <button 
                      className={`view-toggle-btn p-2 rounded-md ${viewMode === 'list' ? 'active bg-slate-600' : ''}`}
                      onClick={() => setViewMode('list')}
                    >
                      <i className={`fas fa-list ${viewMode === 'list' ? 'text-white' : 'text-slate-400'}`}></i>
                    </button>
                    <button 
                      className={`view-toggle-btn p-2 rounded-md ${viewMode === 'grid' ? 'active bg-slate-600' : ''}`}
                      onClick={() => setViewMode('grid')}
                    >
                      <i className={`fas fa-th-large ${viewMode === 'grid' ? 'text-white' : 'text-slate-400'}`}></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </header>
          
          {/* Stats Cards */}
          <div>
            <div className="cursor-pointer" onClick={() => storageSize !== '0 Bytes' && setShowStorageModal(true)}>
              <StatsCards 
                bucket={currentBucket} 
                objectCount={objectCount > 0 ? `${objectCount} objetos` : 0} 
                storageSize={storageSize} 
              />
            </div>
          </div>
          
          {/* Objects Container */}
          <div className="neon-border rounded-xl p-6 mb-6">
            <div className="custom-scrollbar overflow-auto max-h-[60vh]">
              <ObjectsList 
                isLoading={isLoadingObjects}
                error={objectsError}
                currentBucket={currentBucket}
                objects={objects}
                prefixes={prefixes}
                viewMode={viewMode}
                onNavigateToPrefix={handleNavigateToPrefix}
                currentPrefix={currentPrefix}
                onSelect={(items) => setSelectedObjectItems(items)}
                onDownload={async (item, type) => {
                try {
                  const itemName = typeof item === 'string' ? item.split('/').pop() || item : 'múltiplos itens';
                  showNotification(`Download de ${itemName} iniciado`, 'info');
                  
                  if (!credentials) {
                    throw new Error('Credenciais não disponíveis');
                  }
                  
                  setIsDownloading(true);
                  
                  if (type === 'file') {
                    // Download de arquivo individual
                    const blob = await apiService.downloadObject(
                      credentials.accessKey,
                      credentials.secretKey,
                      currentBucket,
                      item
                    );
                    
                    // Criar URL para download
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = item.split('/').pop();
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    
                    showNotification(`Download de ${itemName} concluído`, 'success');
                  } else if (type === 'folder') {
                    // Download de pasta como ZIP
                    const blob = await apiService.downloadFolder(
                      credentials.accessKey,
                      credentials.secretKey,
                      currentBucket,
                      item
                    );
                    
                    // Criar URL para download
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = `${itemName.replace(/\/$/, '')}.zip`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    
                    showNotification(`Download da pasta ${itemName} concluído`, 'success');
                  } else if (type === 'multiple') {
                    // Download de múltiplos itens selecionados
                    const blob = await apiService.downloadMultipleObjects(
                      credentials.accessKey,
                      credentials.secretKey,
                      currentBucket,
                      Array.isArray(item) ? item : [item]
                    );
                    
                    // Criar URL para download
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = `${currentBucket}-selected.zip`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    
                    showNotification(`Download de múltiplos itens concluído`, 'success');
                  }
                } catch (error) {
                  console.error('Erro ao fazer download:', error);
                  showNotification(`Erro ao fazer download: ${error.message}`, 'error');
                } finally {
                  setIsDownloading(false);
                }
              }}
              onDelete={async (item, type) => {
                try {
                  if (isOfflineMode) {
                    const itemName = typeof item === 'string' ? item.split('/').pop() || item : 'múltiplos itens';
                    showNotification(`${itemName} deletado com sucesso (simulado)`, 'success');
                    return;
                  }
                  
                  if (!credentials) {
                    throw new Error('Credenciais não disponíveis');
                  }
                  
                  if (type === 'file') {
                    // Deletar um único arquivo
                    const result = await apiService.deleteObject(
                      credentials.accessKey,
                      credentials.secretKey,
                      currentBucket,
                      item
                    );
                    
                    if (result.success) {
                      const itemName = item.split('/').pop() || item;
                      showNotification(`Arquivo "${itemName}" deletado com sucesso`, 'success');
                      // Recarregar a lista de objetos
                      loadObjects(currentBucket, currentPrefix);
                    } else {
                      throw new Error(result.message || 'Erro ao deletar arquivo');
                    }
                  } else if (type === 'folder') {
                    // Confirmar deleção de pasta
                    const folderName = item.split('/').filter(Boolean).pop() || item;
                    const confirm = window.confirm(`Tem certeza que deseja deletar a pasta "${folderName}" e todo seu conteúdo? Esta ação não pode ser desfeita.`);
                    if (!confirm) return;
                    
                    // Listar todos os objetos com o prefixo da pasta
                    const listResult = await apiService.listObjects(
                      credentials.accessKey,
                      credentials.secretKey,
                      currentBucket,
                      item
                    );
                    
                    if (listResult.success && listResult.objects && listResult.objects.length > 0) {
                      // Deletar todos os objetos na pasta
                      const keys = listResult.objects.map(obj => obj.Key);
                      const deleteResult = await apiService.deleteObjects(
                        credentials.accessKey,
                        credentials.secretKey,
                        currentBucket,
                        keys
                      );
                      
                      if (deleteResult.success) {
                        showNotification(`Pasta "${folderName}" e ${keys.length} objeto(s) deletados com sucesso`, 'success');
                        // Recarregar a lista de objetos
                        loadObjects(currentBucket, currentPrefix);
                      } else {
                        throw new Error(deleteResult.message || 'Erro ao deletar pasta');
                      }
                    } else {
                      showNotification(`Pasta "${folderName}" está vazia ou não existe`, 'info');
                    }
                  } else if (type === 'multiple') {
                    // Confirmar deleção de múltiplos itens
                    const itemCount = Array.isArray(item) ? item.length : 1;
                    const confirm = window.confirm(`Tem certeza que deseja deletar ${itemCount} item(ns) selecionado(s)? Esta ação não pode ser desfeita.`);
                    if (!confirm) return;
                    
                    const keys = Array.isArray(item) ? item : [item];
                    const deleteResult = await apiService.deleteObjects(
                      credentials.accessKey,
                      credentials.secretKey,
                      currentBucket,
                      keys
                    );
                    
                    if (deleteResult.success) {
                      showNotification(`${itemCount} item(ns) deletado(s) com sucesso`, 'success');
                      // Recarregar a lista de objetos
                      loadObjects(currentBucket, currentPrefix);
                    } else {
                      throw new Error(deleteResult.message || 'Erro ao deletar itens');
                    }
                  }
                } catch (error) {
                  console.error('Erro ao deletar:', error);
                  showNotification(`Erro ao deletar: ${error.message}`, 'error');
                }
              }}
            />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="neon-border rounded-xl p-6">
            <div className="text-center mb-6">
              <i className="fas fa-exchange-alt text-4xl neon-blue mb-3"></i>
              <h3 className="text-2xl font-bold neon-blue">Opções de Arquivo</h3>
            </div>
            
            {/* Upload Button */}
            <div className="mb-4">
              <Button 
                variant="neon" 
                fullWidth
                onClick={handleUploadFiles}
                disabled={!currentBucket || isOfflineMode}
                tooltip={isOfflineMode ? "Não disponível no modo offline" : "Enviar arquivos para este bucket"}
              >
                <i className="fas fa-cloud-upload-alt mr-2"></i>
                <span>Enviar Arquivos</span>
              </Button>
            </div>
            
            {/* Download Buttons */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <Button 
                variant="primary" 
                fullWidth
                disabled={!currentBucket || isOfflineMode || isDownloading}
                tooltip={
                  isOfflineMode ? "Não disponível no modo offline" : 
                  isDownloading ? "Download em andamento..." :
                  `Baixar todo o bucket ${currentBucket} (${objectCount} objetos)`
                }
                onClick={async () => {
                  try {
                    setIsDownloading(true);
                    showNotification(`Download do bucket ${currentBucket} iniciado`, 'info');
                    
                    // Mostrar indicador de progresso
                    const progressIndicator = document.createElement('div');
                    progressIndicator.className = 'fixed top-0 left-0 w-full h-1 bg-blue-500 animate-pulse';
                    document.body.appendChild(progressIndicator);
                    
                    // Adicionar overlay de progresso
                    const overlay = document.createElement('div');
                    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                    overlay.innerHTML = `
                      <div class="bg-slate-800 p-6 rounded-lg shadow-lg text-center">
                        <div class="loading-spinner mx-auto mb-4"></div>
                        <p class="text-white text-lg mb-2">Download do bucket ${currentBucket} iniciado</p>
                        <p class="text-slate-300 text-sm">Isso pode levar algum tempo dependendo do tamanho dos arquivos</p>
                      </div>
                    `;
                    document.body.appendChild(overlay);
                    
                    const blob = await apiService.downloadBucket(
                      credentials.accessKey,
                      credentials.secretKey,
                      currentBucket
                    );
                    
                    // Remover indicador de progresso e overlay
                    document.body.removeChild(progressIndicator);
                    document.body.removeChild(overlay);
                    
                    // Criar URL para download
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = `${currentBucket}.zip`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    
                    showNotification(`Download do bucket ${currentBucket} concluído`, 'success');
                  } catch (error) {
                    console.error('Erro ao fazer download:', error);
                    showNotification(`Erro ao fazer download: ${error.message}`, 'error');
                    
                    // Remover indicador de progresso e overlay em caso de erro
                    const progressIndicator = document.querySelector('.fixed.top-0.left-0.w-full.h-1.bg-blue-500');
                    if (progressIndicator) {
                      document.body.removeChild(progressIndicator);
                    }
                    
                    const overlay = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
                    if (overlay) {
                      document.body.removeChild(overlay);
                    }
                  } finally {
                    setIsDownloading(false);
                  }
                }}
              >
                <i className="fas fa-cloud-download-alt mr-2"></i>
                <span>Download Todo o Bucket</span>
                {isDownloading && <div className="loading-spinner ml-2 w-4 h-4"></div>}
              </Button>

              <Button 
                variant="primary" 
                fullWidth
                disabled={!currentBucket || isOfflineMode || isDownloading || selectedObjectItems.length === 0}
                tooltip={
                  isOfflineMode ? "Não disponível no modo offline" : 
                  selectedObjectItems.length === 0 ? "Selecione pelo menos um item" :
                  isDownloading ? "Download em andamento..." :
                  `Baixar ${selectedObjectItems.length} item(s) selecionado(s)`
                }
                onClick={async () => {
                  if (selectedObjectItems.length === 0) {
                    showNotification('Selecione pelo menos um item para download', 'info');
                    return;
                  }
                  
                  try {
                    setIsDownloading(true);
                    showNotification(`Download de ${selectedObjectItems.length} item(s) iniciado`, 'info');
                    
                    // Mostrar indicador de progresso
                    const progressIndicator = document.createElement('div');
                    progressIndicator.className = 'fixed top-0 left-0 w-full h-1 bg-green-500 animate-pulse';
                    document.body.appendChild(progressIndicator);
                    
                    // Adicionar overlay de progresso
                    const overlay = document.createElement('div');
                    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                    overlay.innerHTML = `
                      <div class="bg-slate-800 p-6 rounded-lg shadow-lg text-center">
                        <div class="loading-spinner mx-auto mb-4"></div>
                        <p class="text-white text-lg mb-2">Download de ${selectedObjectItems.length} item(s) iniciado</p>
                        <p class="text-slate-300 text-sm">Isso pode levar algum tempo dependendo do tamanho dos arquivos</p>
                      </div>
                    `;
                    document.body.appendChild(overlay);
                    
                    const blob = await apiService.downloadMultipleObjects(
                      credentials.accessKey,
                      credentials.secretKey,
                      currentBucket,
                      selectedObjectItems
                    );
                    
                    // Remover indicador de progresso e overlay
                    document.body.removeChild(progressIndicator);
                    document.body.removeChild(overlay);
                    
                    // Criar URL para download
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = `${currentBucket}-selected.zip`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    
                    showNotification(`Download de ${selectedObjectItems.length} item(s) concluído`, 'success');
                  } catch (error) {
                    console.error('Erro ao fazer download:', error);
                    showNotification(`Erro ao fazer download: ${error.message}`, 'error');
                    
                    // Remover indicador de progresso e overlay em caso de erro
                    const progressIndicator = document.querySelector('.fixed.top-0.left-0.w-full.h-1.bg-green-500');
                    if (progressIndicator) {
                      document.body.removeChild(progressIndicator);
                    }
                    
                    const overlay = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
                    if (overlay) {
                      document.body.removeChild(overlay);
                    }
                  } finally {
                    setIsDownloading(false);
                  }
                }}
              >
                <i className="fas fa-check-square mr-2"></i>
                <span>Download Selecionados</span>
                {isDownloading && <div className="loading-spinner ml-2 w-4 h-4"></div>}
              </Button>
            </div>
            
            {/* Delete Buttons */}
            <div className="flex flex-col md:flex-row gap-4">
            <Button 
                variant="danger" 
                fullWidth
                onClick={handleDeleteBucket}
                disabled={!currentBucket || isOfflineMode}
                tooltip={isOfflineMode ? "Não disponível no modo offline" : "Deletar bucket atual (deve estar vazio)"}
              >
                <i className="fas fa-trash mr-2"></i>
                <span>Deletar Bucket</span>
              </Button>
              
              <Button 
                variant="danger" 
                fullWidth
                disabled={!currentBucket || selectedObjectItems.length === 0 || isOfflineMode}
                tooltip={
                  isOfflineMode ? "Não disponível no modo offline" : 
                  selectedObjectItems.length === 0 ? "Selecione pelo menos um item" :
                  `Deletar ${selectedObjectItems.length} item(ns) selecionado(s)`
                }
                onClick={async () => {
                  if (selectedObjectItems.length === 0) {
                    showNotification('Selecione pelo menos um item para deletar', 'info');
                    return;
                  }
                  
                  try {
                    // Confirmar deleção
                    const confirm = window.confirm(`Tem certeza que deseja deletar ${selectedObjectItems.length} item(ns) selecionado(s)? Esta ação não pode ser desfeita.`);
                    if (!confirm) return;
                    
                    if (isOfflineMode) {
                      showNotification(`${selectedObjectItems.length} item(ns) deletado(s) com sucesso (simulado)`, 'success');
                      return;
                    }
                    
                    if (!credentials) {
                      throw new Error('Credenciais não disponíveis');
                    }
                    
                    const result = await apiService.deleteObjects(
                      credentials.accessKey,
                      credentials.secretKey,
                      currentBucket,
                      selectedObjectItems
                    );
                    
                    if (result.success) {
                      showNotification(`${selectedObjectItems.length} item(ns) deletado(s) com sucesso`, 'success');
                      // Recarregar a lista de objetos
                      loadObjects(currentBucket, currentPrefix);
                    } else {
                      throw new Error(result.message || 'Erro ao deletar itens');
                    }
                  } catch (error) {
                    console.error('Erro ao deletar itens:', error);
                    showNotification(`Erro ao deletar itens: ${error.message}`, 'error');
                  }
                }}
              >
                <i className="fas fa-trash-alt mr-2"></i>
                <span>Deletar Selecionados</span>
              </Button>
              
              
            </div>
          </div>
        </main>
      </div>
      
      {/* Help Text */}
      <div className="mt-6 text-center text-sm text-slate-400 pb-4">
        <p>Precisa de ajuda para gerenciar seus buckets S3?</p>
        <a 
          href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 transition-colors hover-glow"
        >
          Consulte a documentação do Amazon S3
        </a>
      </div>
      
      {/* Modal de detalhes de armazenamento */}
      <StorageDetailsModal 
        isOpen={showStorageModal}
        onClose={() => setShowStorageModal(false)}
        storageData={storageDetails}
        bucketName={currentBucket}
      />
      
      {/* Modal de criação de bucket */}
      <CreateBucketModal
        isOpen={showCreateBucketModal}
        onClose={() => setShowCreateBucketModal(false)}
        onCreateBucket={createBucket}
      />
      
      {/* Modal de upload de arquivos */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={uploadFiles}
        currentBucket={currentBucket}
        currentPrefix={currentPrefix}
      />
    </div>
  );
}

// Função auxiliar para formatar bytes
function formatBytes(bytes, decimals = 2) {
  if (!bytes) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}