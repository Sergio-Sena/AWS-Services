import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { BucketList } from './BucketList';

export function Sidebar({ onCreateBucket, onSelectBucket, selectedBucket, isOfflineMode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    router.push('/');
  };
  
  return (
    <aside className={`sidebar w-full md:w-64 md:min-h-screen p-4 transition-all duration-300 ${isCollapsed ? 'md:w-20' : ''}`}>
      <div className="neon-border rounded-xl p-4 h-full bg-slate-800 bg-opacity-50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <i className="fas fa-cloud text-3xl neon-blue mr-3"></i>
            {!isCollapsed && <h2 className="text-xl font-bold neon-blue">S3 Explorer</h2>}
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-400 hover:text-white"
          >
            <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
          </button>
        </div>
        
        <div className="text-center mb-6">
          <i className="fas fa-folder text-4xl neon-blue mb-3"></i>
          {!isCollapsed && <h2 className="text-2xl font-bold neon-blue">Seus Buckets S3</h2>}
        </div>
        
        {/* Indicador de modo offline */}
        {isOfflineMode && !isCollapsed && (
          <div className="text-yellow-500 text-center py-2 mb-4 text-xs bg-yellow-900 bg-opacity-30 rounded-lg">
            <i className="fas fa-exclamation-triangle mr-1"></i>
            Modo offline (dados simulados)
          </div>
        )}
        
        {/* Lista de buckets real usando o componente BucketList */}
        <BucketList onSelectBucket={onSelectBucket} selectedBucket={selectedBucket} />
        
        <div className="mt-6 pt-6 border-t border-slate-700">
          <Button 
            variant="neon" 
            fullWidth
            onClick={onCreateBucket}
            disabled={isOfflineMode}
            tooltip={isOfflineMode ? "Não disponível no modo offline" : ""}
          >
            <i className="fas fa-plus-circle mr-2"></i>
            {!isCollapsed && <span>Criar Novo Bucket</span>}
          </Button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-slate-700">
          <div className="flex flex-col space-y-2">
            <Link href="/services">
              <span className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center hover-lift cursor-pointer">
                <i className="fas fa-th-large mr-2"></i>
                {!isCollapsed && <span>Serviços AWS</span>}
              </span>
            </Link>
            <Button 
              variant="danger" 
              fullWidth
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              {!isCollapsed && <span>Logout</span>}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}