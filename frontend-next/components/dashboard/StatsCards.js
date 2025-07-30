import React from 'react';
import { StatsCard } from './StatsCard';

export function StatsCards({ bucket, objectCount, storageSize }) {
  // Determinar o valor a ser exibido para objetos
  const objectsValue = objectCount === 0 ? '-' : objectCount;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <StatsCard 
        icon="folder" 
        title="Bucket Atual" 
        value={bucket || '-'} 
        color="blue" 
      />
      
      <StatsCard 
        icon="object-group" 
        title="Total de Itens" 
        value={objectsValue} 
        color="green" 
      />
      
      <StatsCard 
        icon="database" 
        title="Armazenamento"
        value={storageSize || '-'} 
        color="purple" 
        subtitle={bucket ? bucket : (storageSize !== '0 Bytes' ? 'Clique para detalhes' : null)}
      />
    </div>
  );
}