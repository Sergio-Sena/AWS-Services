import React, { useState, useEffect } from 'react';

export function ObjectsList({ 
  isLoading, 
  error, 
  currentBucket, 
  objects = [], 
  prefixes = [],
  viewMode = 'list',
  onNavigateToPrefix = () => {},
  currentPrefix = '',
  onDownload = () => {},
  onDelete = () => {},
  onSelect = () => {}
}) {
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Expor os itens selecionados para o componente pai
  useEffect(() => {
    onSelect(selectedItems);
  }, [selectedItems, onSelect]);
  
  // Função para alternar seleção de um item
  const toggleItemSelection = (itemKey) => {
    setSelectedItems(prev => {
      if (prev.includes(itemKey)) {
        return prev.filter(key => key !== itemKey);
      } else {
        return [...prev, itemKey];
      }
    });
  };
  if (isLoading) {
    return (
      <div className="text-center p-4">
        <div className="loading-spinner mx-auto"></div>
        <p className="mt-4 text-slate-300">Carregando objetos...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        <i className="fas fa-exclamation-triangle mb-2"></i>
        <p>{error}</p>
      </div>
    );
  }
  
  if (!currentBucket) {
    return (
      <div className="text-center mb-6">
        <i className="fas fa-box text-4xl neon-blue mb-3"></i>
        <h3 className="text-2xl font-bold neon-blue">Selecione um bucket para ver seu conteúdo</h3>
      </div>
    );
  }
  
  if (objects.length === 0 && prefixes.length === 0) {
    return (
      <div className="text-center p-4 text-slate-400">
        <i className="fas fa-info-circle mb-2"></i>
        <p>Bucket vazio ou nenhum objeto encontrado com o filtro atual</p>
      </div>
    );
  }
  
  // Mostrar caminho atual (breadcrumb)
  const renderBreadcrumb = () => {
    if (!currentBucket) return null;
    
    const parts = currentPrefix ? currentPrefix.split('/').filter(Boolean) : [];
    
    return (
      <div className="mb-4 flex items-center flex-wrap">
        <span 
          className="text-blue-400 hover:text-blue-300 cursor-pointer mr-2"
          onClick={() => onNavigateToPrefix('')}
        >
          <i className="fas fa-home mr-1"></i>
          {currentBucket}
        </span>
        
        {parts.map((part, index) => {
          const prefix = parts.slice(0, index + 1).join('/') + '/';
          return (
            <span key={prefix}>
              <i className="fas fa-chevron-right mx-2 text-slate-500"></i>
              <span 
                className="text-blue-400 hover:text-blue-300 cursor-pointer"
                onClick={() => onNavigateToPrefix(prefix)}
              >
                {part}
              </span>
            </span>
          );
        })}
      </div>
    );
  };
  
  // Exibir informações sobre itens selecionados
  const renderSelectionInfo = () => {
    if (selectedItems.length === 0) return null;
    
    return (
      <div className="mb-4 p-2 bg-blue-900 bg-opacity-30 rounded-lg flex justify-between items-center">
        <span>
          <i className="fas fa-check-square mr-2 text-blue-400"></i>
          {selectedItems.length} {selectedItems.length === 1 ? 'item selecionado' : 'itens selecionados'}
        </span>
        <div>
          <button 
            className="text-red-400 hover:text-red-300 mr-3"
            onClick={() => onDelete(selectedItems, 'multiple')}
            title="Deletar itens selecionados"
          >
            <i className="fas fa-trash-alt mr-1"></i>
            Deletar
          </button>
          <button 
            className="text-slate-400 hover:text-slate-300"
            onClick={() => setSelectedItems([])}
            title="Limpar seleção"
          >
            <i className="fas fa-times mr-1"></i>
            Limpar
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div className={`${viewMode === 'grid' ? 'grid-view' : 'list-view'}`}>
      {renderBreadcrumb()}
      {renderSelectionInfo()}
      
      {/* Versão para desktop */}
      <div className="hidden md:block overflow-x-auto max-h-96 custom-scrollbar">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-800 text-left">
              <th className="py-2 px-4 w-10 rounded-tl-lg">
                <input 
                  type="checkbox" 
                  className="form-checkbox h-5 w-5 text-blue-500 rounded border-slate-500 focus:ring-blue-500"
                  onChange={(e) => {
                    if (e.target.checked) {
                      const allKeys = [
                        ...prefixes.map(p => p.Prefix || p),
                        ...objects.map(o => o.Key)
                      ];
                      setSelectedItems(allKeys);
                    } else {
                      setSelectedItems([]);
                    }
                  }}
                  checked={selectedItems.length > 0 && selectedItems.length === (prefixes.length + objects.length)}
                />
              </th>
              <th className="py-2 px-4">Nome</th>
              <th className="py-2 px-4">Tipo</th>
              <th className="py-2 px-4">Tamanho</th>
              <th className="py-2 px-4">Modificado</th>
              <th className="py-2 px-4 rounded-tr-lg">Ações</th>
            </tr>
          </thead>
          <tbody>
            {prefixes.map((prefix, index) => {
              const prefixKey = prefix.Prefix || prefix;
              const isSelected = selectedItems.includes(prefixKey);
              
              return (
                <tr key={`prefix-${index}`} className={`border-b border-slate-700 hover:bg-slate-700 ${isSelected ? 'bg-slate-700' : ''}`} data-key={prefixKey}>
                  <td className="py-2 px-4">
                    <input 
                      type="checkbox" 
                      className="form-checkbox h-5 w-5 text-blue-500 rounded border-slate-500 focus:ring-blue-500"
                      checked={isSelected}
                      onChange={() => toggleItemSelection(prefixKey)}
                    />
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex items-center">
                      <i className="fas fa-folder text-blue-400 mr-2"></i>
                      <span>{prefixKey}</span>
                    </div>
                  </td>
                  <td className="py-2 px-4">Pasta</td>
                  <td className="py-2 px-4">-</td>
                  <td className="py-2 px-4">-</td>
                  <td className="py-2 px-4 flex">
                    <button 
                      className="text-blue-400 hover:text-blue-300 mr-2"
                      onClick={() => onNavigateToPrefix(prefixKey)}
                      title="Navegar para esta pasta"
                    >
                      <i className="fas fa-folder-open"></i>
                      <span className="ml-1 text-xs">Navegar</span>
                    </button>
                    
                    <button 
                      className="text-red-400 hover:text-red-300"
                      onClick={() => onDelete(prefixKey, 'folder')}
                      title="Deletar pasta e todo seu conteúdo"
                    >
                      <i className="fas fa-trash-alt"></i>
                      <span className="ml-1 text-xs">Deletar</span>
                    </button>
                  </td>
                </tr>
              );
            })}
            
            {objects.map((object, index) => {
              const isSelected = selectedItems.includes(object.Key);
              
              return (
                <tr key={`object-${index}`} className={`border-b border-slate-700 hover:bg-slate-700 ${isSelected ? 'bg-slate-700' : ''}`} data-key={object.Key}>
                  <td className="py-2 px-4">
                    <input 
                      type="checkbox" 
                      className="form-checkbox h-5 w-5 text-blue-500 rounded border-slate-500 focus:ring-blue-500"
                      checked={isSelected}
                      onChange={() => toggleItemSelection(object.Key)}
                    />
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex items-center">
                      <i className="fas fa-file text-slate-400 mr-2"></i>
                      <span>{object.Key.split('/').pop()}</span>
                    </div>
                  </td>
                  <td className="py-2 px-4">{getFileType(object.Key)}</td>
                  <td className="py-2 px-4">{formatBytes(object.Size)}</td>
                  <td className="py-2 px-4">{formatDate(object.LastModified)}</td>
                  <td className="py-2 px-4 flex">
                    <button 
                      className="text-red-400 hover:text-red-300"
                      onClick={() => onDelete(object.Key, 'file')}
                      title="Deletar arquivo"
                    >
                      <i className="fas fa-trash-alt"></i>
                      <span className="ml-1 text-xs">Deletar</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Versão simplificada para mobile */}
      <div className="md:hidden overflow-y-auto max-h-96 custom-scrollbar">
        <div className="bg-slate-800 p-2 rounded-t-lg flex items-center">
          <div className="w-10 flex-shrink-0">
            <input 
              type="checkbox" 
              className="form-checkbox h-5 w-5 text-blue-500 rounded border-slate-500 focus:ring-blue-500"
              onChange={(e) => {
                if (e.target.checked) {
                  const allKeys = [
                    ...prefixes.map(p => p.Prefix || p),
                    ...objects.map(o => o.Key)
                  ];
                  setSelectedItems(allKeys);
                } else {
                  setSelectedItems([]);
                }
              }}
              checked={selectedItems.length > 0 && selectedItems.length === (prefixes.length + objects.length)}
            />
          </div>
          <div className="flex-grow font-medium">Nome</div>
          <div className="w-20 text-right">Ações</div>
        </div>
        
        {/* Lista de pastas */}
        {prefixes.map((prefix, index) => {
          const prefixKey = prefix.Prefix || prefix;
          const isSelected = selectedItems.includes(prefixKey);
          const folderName = prefixKey.split('/').filter(Boolean).pop() || prefixKey;
          
          return (
            <div 
              key={`mobile-prefix-${index}`} 
              className={`border-b border-slate-700 p-2 flex items-center ${isSelected ? 'bg-slate-700' : ''}`}
            >
              <div className="w-10 flex-shrink-0">
                <input 
                  type="checkbox" 
                  className="form-checkbox h-5 w-5 text-blue-500 rounded border-slate-500 focus:ring-blue-500"
                  checked={isSelected}
                  onChange={() => toggleItemSelection(prefixKey)}
                />
              </div>
              <div className="flex-grow flex items-center">
                <i className="fas fa-folder text-blue-400 mr-2"></i>
                <span className="truncate">{folderName}</span>
              </div>
              <div className="w-20 flex justify-end">
                <button 
                  className="text-blue-400 hover:text-blue-300 p-1 mr-1"
                  onClick={() => onNavigateToPrefix(prefixKey)}
                  title="Navegar para esta pasta"
                >
                  <i className="fas fa-folder-open"></i>
                </button>
                <button 
                  className="text-red-400 hover:text-red-300 p-1"
                  onClick={() => onDelete(prefixKey, 'folder')}
                  title="Deletar pasta"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          );
        })}
        
        {/* Lista de arquivos */}
        {objects.map((object, index) => {
          const isSelected = selectedItems.includes(object.Key);
          const fileName = object.Key.split('/').pop();
          
          return (
            <div 
              key={`mobile-object-${index}`} 
              className={`border-b border-slate-700 p-2 flex items-center ${isSelected ? 'bg-slate-700' : ''}`}
            >
              <div className="w-10 flex-shrink-0">
                <input 
                  type="checkbox" 
                  className="form-checkbox h-5 w-5 text-blue-500 rounded border-slate-500 focus:ring-blue-500"
                  checked={isSelected}
                  onChange={() => toggleItemSelection(object.Key)}
                />
              </div>
              <div className="flex-grow flex items-center">
                <i className="fas fa-file text-slate-400 mr-2"></i>
                <span className="truncate">{fileName}</span>
              </div>
              <div className="w-20 flex justify-end">
                <button 
                  className="text-red-400 hover:text-red-300 p-1"
                  onClick={() => onDelete(object.Key, 'file')}
                  title="Deletar arquivo"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Funções auxiliares
function getFileType(filename) {
  const extension = filename.split('.').pop().toLowerCase();
  const fileTypes = {
    pdf: 'PDF',
    doc: 'Word',
    docx: 'Word',
    xls: 'Excel',
    xlsx: 'Excel',
    ppt: 'PowerPoint',
    pptx: 'PowerPoint',
    jpg: 'Imagem',
    jpeg: 'Imagem',
    png: 'Imagem',
    gif: 'Imagem',
    mp4: 'Vídeo',
    mp3: 'Áudio',
    zip: 'Arquivo',
    rar: 'Arquivo',
    txt: 'Texto',
    json: 'JSON',
    html: 'HTML',
    css: 'CSS',
    js: 'JavaScript'
  };
  
  return fileTypes[extension] || 'Arquivo';
}

function formatBytes(bytes, decimals = 2) {
  if (!bytes) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatDate(dateString) {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}