import React from 'react';

export function StorageDetailsModal({ isOpen, onClose, storageData, bucketName }) {
  if (!isOpen) return null;
  
  const { totalSize, totalFileCount, largestFiles, fileTypes } = storageData;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="neon-border rounded-xl bg-slate-800 bg-opacity-95 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold neon-purple">
            Armazenamento Total: {totalSize}
            {bucketName && <span className="block text-sm text-slate-300 mt-1">Bucket: {bucketName}</span>}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="neon-border rounded-lg p-4">
            <h3 className="text-lg font-semibold neon-blue mb-2">Uso Total no Bucket</h3>
            <div className="flex items-center">
              <i className="fas fa-database text-4xl neon-purple mr-4"></i>
              <div>
                <p className="text-2xl font-bold">{totalSize}</p>
                <p className="text-sm text-slate-400">
                  {totalFileCount} {totalFileCount === 1 ? 'arquivo' : 'arquivos'} em {bucketName}
                </p>
              </div>
            </div>
          </div>
          
          <div className="neon-border rounded-lg p-4">
            <h3 className="text-lg font-semibold neon-blue mb-2">Distribuição por Tipo</h3>
            <div className="space-y-2">
              {fileTypes.map((type, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <i className={`fas fa-${type.icon} text-${type.color}-400 mr-2`}></i>
                    <span>{type.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-slate-300 mr-2">{type.count} arquivos</span>
                    <span className="font-semibold">{type.size}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="neon-border rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold neon-blue mb-4">Maiores Arquivos</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="py-2 px-4 text-left">Nome</th>
                  <th className="py-2 px-4 text-left">Tamanho</th>
                  <th className="py-2 px-4 text-left">Tipo</th>
                  <th className="py-2 px-4 text-left">Última Modificação</th>
                </tr>
              </thead>
              <tbody>
                {largestFiles.map((file, index) => (
                  <tr key={index} className="border-b border-slate-700 hover:bg-slate-700">
                    <td className="py-2 px-4">
                      <div className="flex items-center">
                        <i className="fas fa-file text-slate-400 mr-2"></i>
                        <span className="truncate max-w-[200px]" title={file.name}>{file.name}</span>
                      </div>
                    </td>
                    <td className="py-2 px-4">{file.size}</td>
                    <td className="py-2 px-4">{file.type}</td>
                    <td className="py-2 px-4">{file.lastModified}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button 
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}