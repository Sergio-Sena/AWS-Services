import { useState, useRef } from 'react';
import { Button } from '../ui/Button';

const UploadModal = ({ isOpen, onClose, onUpload, currentBucket, currentPrefix }) => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  
  // Limites do S3 (em bytes)
  const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024 * 1024; // 5TB por arquivo (limite máximo do S3)
  
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles(droppedFiles);
    }
  };
  
  const handleUpload = async () => {
    if (files.length === 0) return;
    
    // Limite aumentado para 5TB (limite máximo do S3 para objetos)
    const MAX_OBJECT_SIZE = 5 * 1024 * 1024 * 1024 * 1024; // 5TB
    
    // Verificar tamanho dos arquivos
    const oversizedFiles = files.filter(file => file.size > MAX_OBJECT_SIZE);
    if (oversizedFiles.length > 0) {
      alert(`Os seguintes arquivos excedem o limite de 5TB: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Passar função de callback para atualizar o progresso
      await onUpload(files, currentPrefix, (progress) => {
        setUploadProgress(progress);
      });
      onClose();
    } catch (error) {
      console.error('Erro no upload:', error);
      alert(`Erro ao fazer upload: ${error.message}`);
    } finally {
      setIsUploading(false);
      setFiles([]);
      setUploadProgress(0);
    }
  };
  
  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-blue-500 shadow-lg shadow-blue-500/30 w-full max-w-2xl p-6 animate-fadeIn">
        <div className="text-center mb-6">
          <i className="fas fa-cloud-upload-alt text-4xl neon-blue mb-3"></i>
          <h3 className="text-2xl font-bold neon-blue">Upload para {currentBucket}</h3>
          {currentPrefix && (
            <p className="text-slate-300 mt-1">
              Pasta: {currentPrefix}
            </p>
          )}
        </div>
        
        {/* Área de drop e seleção de arquivos */}
        <div 
          className="border-2 border-dashed border-slate-600 rounded-lg p-8 mb-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
          />
          
          <i className="fas fa-file-upload text-4xl text-slate-400 mb-4"></i>
          <p className="text-slate-300">
            Arraste arquivos aqui ou clique para selecionar
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Suporta arquivos de até 5TB, qualquer tipo de arquivo
          </p>
        </div>
        
        {/* Lista de arquivos selecionados */}
        {files.length > 0 && (
          <div className="mb-6">
            <h4 className="text-slate-300 font-medium mb-2">Arquivos selecionados:</h4>
            <div className="max-h-40 overflow-y-auto custom-scrollbar bg-slate-700 rounded-md p-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between py-1 border-b border-slate-600 last:border-0">
                  <div className="flex items-center">
                    <i className="fas fa-file text-slate-400 mr-2"></i>
                    <span className="text-slate-300 text-sm">{file.name}</span>
                  </div>
                  <span className="text-slate-400 text-xs">{formatBytes(file.size)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Barra de progresso */}
        {isUploading && (
          <div className="mb-6">
            <div className="w-full bg-slate-700 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-center text-slate-400 text-sm mt-1">
              {uploadProgress}% concluído
            </p>
          </div>
        )}
        
        {/* Botões de ação */}
        <div className="flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button
            variant="neon"
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
          >
            {isUploading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Enviando...
              </>
            ) : (
              <>
                <i className="fas fa-cloud-upload-alt mr-2"></i>
                Enviar {files.length} {files.length === 1 ? 'arquivo' : 'arquivos'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;