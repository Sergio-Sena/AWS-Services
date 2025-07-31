// Configuração base da API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname.includes('dev') 
    ? 'https://api-dev.aws-services.com'
    : window.location.hostname.includes('test')
    ? 'https://api-test.aws-services.com'  
    : window.location.hostname.includes('localhost')
    ? 'http://localhost:8000'
    : 'https://api.aws-services.com');

/**
 * Verifica se o backend está disponível
 * @returns {Promise<boolean>} true se o backend estiver disponível
 */
async function isBackendAvailable() {
  try {
    // Usar endpoint /health que sempre responde se o servidor estiver online
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors',
    });
    return response.ok;
  } catch (error) {
    console.error('Backend não disponível:', error);
    return false;
  }
}

/**
 * Serviço para comunicação com o backend
 */
const apiService = {
  /**
   * Verifica se o backend está disponível
   * @returns {Promise<boolean>} true se o backend estiver disponível
   */
  checkBackend: async () => {
    return await isBackendAvailable();
  },

  /**
   * Obtém informações de saúde do backend
   * @returns {Promise<Object>} Informações do backend
   */
  getHealth: async () => {
    try {
      const response = await fetch(`${API_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        return await response.json();
      }
      return { status: 'error', message: 'Backend não responde' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  },

  /**
   * Valida as credenciais AWS
   * @param {string} accessKey - Access Key ID da AWS
   * @param {string} secretKey - Secret Access Key da AWS
   * @returns {Promise<Object>} Resultado da validação
   */
  validateCredentials: async (accessKey, secretKey) => {
    // Verificar primeiro se o backend está disponível
    if (!(await isBackendAvailable())) {
      return { 
        success: false, 
        error: 'Backend não disponível. Verifique se o servidor está em execução.' 
      };
    }

    try {
      // Usar o endpoint /auth que existe no backend
      const response = await fetch(`${API_URL}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Usar os nomes de parâmetros corretos: access_key e secret_key
        body: JSON.stringify({ 
          access_key: accessKey, 
          secret_key: secretKey 
        }),
      });
      
      if (response.status === 404) {
        return { 
          success: false, 
          error: 'Endpoint não encontrado. Verifique se o backend implementa /auth' 
        };
      }
      
      if (!response.ok) {
        return {
          success: false,
          error: `Erro do servidor: ${response.status} ${response.statusText}`
        };
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao validar credenciais:', error);
      return { 
        success: false, 
        error: 'Erro de conexão com o servidor. Verifique se o backend está em execução.' 
      };
    }
  },

  /**
   * Lista todos os buckets S3
   * @param {string} accessKey - Access Key ID da AWS
   * @param {string} secretKey - Secret Access Key da AWS
   * @returns {Promise<Object>} Lista de buckets
   */
  listBuckets: async (accessKey, secretKey) => {
    try {
      const response = await fetch(`${API_URL}/buckets`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'access_key': accessKey,
          'secret_key': secretKey
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao listar buckets:', error);
      throw error;
    }
  },

  /**
   * Lista objetos em um bucket
   * @param {string} accessKey - Access Key ID da AWS
   * @param {string} secretKey - Secret Access Key da AWS
   * @param {string} bucket - Nome do bucket
   * @param {string} prefix - Prefixo para filtrar objetos (opcional)
   * @returns {Promise<Object>} Lista de objetos
   */
  listObjects: async (accessKey, secretKey, bucket, prefix = '') => {
    try {
      const url = `${API_URL}/objects/${bucket}${prefix ? `?prefix=${encodeURIComponent(prefix)}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'access_key': accessKey,
          'secret_key': secretKey
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Garantir que os prefixes estejam no formato correto
      if (data.prefixes && Array.isArray(data.prefixes)) {
        // Se já não estiver no formato { Prefix: string }
        if (data.prefixes.length > 0 && typeof data.prefixes[0] === 'string') {
          data.prefixes = data.prefixes.map(prefix => ({ Prefix: prefix }));
        }
      }
      
      return {
        ...data,
        success: true
      };
    } catch (error) {
      console.error('Erro ao listar objetos:', error);
      throw error;
    }
  },
  
  /**
   * Obtém o tamanho total do bucket
   * @param {string} accessKey - Access Key ID da AWS
   * @param {string} secretKey - Secret Access Key da AWS
   * @param {string} bucket - Nome do bucket
   * @returns {Promise<Object>} Informações sobre o tamanho do bucket
   */
  getBucketSize: async (accessKey, secretKey, bucket) => {
    try {
      const response = await fetch(`${API_URL}/bucket-size/${bucket}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'access_key': accessKey,
          'secret_key': secretKey
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao obter tamanho do bucket:', error);
      throw error;
    }
  },

  /**
   * Cria um novo bucket
   * @param {string} accessKey - Access Key ID da AWS
   * @param {string} secretKey - Secret Access Key da AWS
   * @param {string} bucketName - Nome do bucket
   * @param {string} region - Região AWS (opcional)
   * @returns {Promise<Object>} Resultado da operação
   */
  createBucket: async (accessKey, secretKey, bucketName, region = 'us-east-1') => {
    try {
      const response = await fetch(`${API_URL}/create-bucket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_key': accessKey,
          'secret_key': secretKey
        },
        body: JSON.stringify({ bucket_name: bucketName, region })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar bucket:', error);
      throw error;
    }
  },

  /**
   * Faz upload de arquivos para um bucket
   * @param {string} accessKey - Access Key ID da AWS
   * @param {string} secretKey - Secret Access Key da AWS
   * @param {string} bucket - Nome do bucket
   * @param {FileList} files - Lista de arquivos para upload
   * @param {string} prefix - Prefixo para os arquivos (opcional)
   * @param {Function} progressCallback - Função de callback para progresso
   * @returns {Promise<Object>} Resultado da operação
   */
  uploadFiles: async (accessKey, secretKey, bucket, files, prefix = '', progressCallback = null) => {
    try {
      // Limite para upload multipart (5MB)
      const MULTIPART_THRESHOLD = 5 * 1024 * 1024;
      // Tamanho da parte para upload multipart (5MB)
      const PART_SIZE = 5 * 1024 * 1024;
      
      // Verificar se há arquivos grandes que precisam de upload multipart
      const largeFiles = Array.from(files).filter(file => file.size > MULTIPART_THRESHOLD);
      const smallFiles = Array.from(files).filter(file => file.size <= MULTIPART_THRESHOLD);
      
      // Resultados dos uploads
      const results = [];
      
      // Upload de arquivos pequenos usando o método padrão
      if (smallFiles.length > 0) {
        const formData = new FormData();
        smallFiles.forEach(file => {
          formData.append('files', file);
        });
        if (prefix) {
          formData.append('prefix', prefix);
        }

        const response = await fetch(`${API_URL}/upload/${bucket}`, {
          method: 'POST',
          headers: {
            'access_key': accessKey,
            'secret_key': secretKey
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        results.push(result);
      }
      
      // Upload de arquivos grandes usando multipart
      for (const file of largeFiles) {
        const key = prefix ? `${prefix}${file.name}` : file.name;
        
        // Iniciar upload multipart
        const initResponse = await fetch(`${API_URL}/multipart/init`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'access_key': accessKey,
            'secret_key': secretKey
          },
          body: JSON.stringify({ bucket, key })
        });
        
        if (!initResponse.ok) {
          throw new Error(`HTTP error! status: ${initResponse.status}`);
        }
        
        const initResult = await initResponse.json();
        const uploadId = initResult.uploadId;
        
        // Dividir o arquivo em partes
        const totalParts = Math.ceil(file.size / PART_SIZE);
        const parts = [];
        
        // Fazer upload de cada parte
        for (let i = 0; i < totalParts; i++) {
          const start = i * PART_SIZE;
          const end = Math.min(start + PART_SIZE, file.size);
          const chunk = file.slice(start, end);
          
          const partResponse = await fetch(`${API_URL}/multipart/part?bucket=${bucket}&key=${encodeURIComponent(key)}&uploadId=${uploadId}&partNumber=${i + 1}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/octet-stream',
              'access_key': accessKey,
              'secret_key': secretKey
            },
            body: chunk
          });
          
          if (!partResponse.ok) {
            // Abortar upload em caso de erro
            await fetch(`${API_URL}/multipart/abort`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'access_key': accessKey,
                'secret_key': secretKey
              },
              body: JSON.stringify({ bucket, key, uploadId })
            });
            
            throw new Error(`HTTP error! status: ${partResponse.status}`);
          }
          
          const partResult = await partResponse.json();
          parts.push({
            ETag: partResult.ETag,
            PartNumber: i + 1
          });
          
          // Atualizar progresso
          if (progressCallback) {
            const progress = Math.round(((i + 1) / totalParts) * 100);
            progressCallback(progress);
          }
        }
        
        // Completar upload multipart
        const completeResponse = await fetch(`${API_URL}/multipart/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'access_key': accessKey,
            'secret_key': secretKey
          },
          body: JSON.stringify({ bucket, key, uploadId, parts })
        });
        
        if (!completeResponse.ok) {
          throw new Error(`HTTP error! status: ${completeResponse.status}`);
        }
        
        const completeResult = await completeResponse.json();
        results.push(completeResult);
      }
      
      return {
        success: true,
        message: `${files.length} arquivo(s) enviado(s) com sucesso`,
        results
      };
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      throw error;
    }
  },

  /**
   * Faz download de um objeto
   * @param {string} accessKey - Access Key ID da AWS
   * @param {string} secretKey - Secret Access Key da AWS
   * @param {string} bucket - Nome do bucket
   * @param {string} key - Chave do objeto
   * @returns {Promise<Blob>} Blob do arquivo
   */
  downloadObject: async (accessKey, secretKey, bucket, key) => {
    try {
      const encodedKey = encodeURIComponent(key);
      const response = await fetch(`${API_URL}/download/${bucket}/${encodedKey}`, {
        method: 'GET',
        headers: {
          'access_key': accessKey,
          'secret_key': secretKey
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      throw error;
    }
  },
  
  /**
   * Faz download de uma pasta inteira como ZIP
   * @param {string} accessKey - Access Key ID da AWS
   * @param {string} secretKey - Secret Access Key da AWS
   * @param {string} bucket - Nome do bucket
   * @param {string} prefix - Prefixo da pasta
   * @returns {Promise<Blob>} Blob do arquivo ZIP
   */
  downloadFolder: async (accessKey, secretKey, bucket, prefix) => {
    try {
      const encodedPrefix = encodeURIComponent(prefix);
      const response = await fetch(`${API_URL}/download-folder/${bucket}/${encodedPrefix}`, {
        method: 'GET',
        headers: {
          'access_key': accessKey,
          'secret_key': secretKey
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Erro ao fazer download da pasta:', error);
      throw error;
    }
  },
  
  /**
   * Faz download de um bucket inteiro como ZIP
   * @param {string} accessKey - Access Key ID da AWS
   * @param {string} secretKey - Secret Access Key da AWS
   * @param {string} bucket - Nome do bucket
   * @returns {Promise<Blob>} Blob do arquivo ZIP
   */
  downloadBucket: async (accessKey, secretKey, bucket) => {
    try {
      const response = await fetch(`${API_URL}/download-bucket/${bucket}`, {
        method: 'GET',
        headers: {
          'access_key': accessKey,
          'secret_key': secretKey
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Erro ao fazer download do bucket:', error);
      throw error;
    }
  },
  
  /**
   * Faz download de múltiplos objetos como ZIP
   * @param {string} accessKey - Access Key ID da AWS
   * @param {string} secretKey - Secret Access Key da AWS
   * @param {string} bucket - Nome do bucket
   * @param {string[]} keys - Lista de chaves dos objetos
   * @returns {Promise<Blob>} Blob do arquivo ZIP
   */
  downloadMultipleObjects: async (accessKey, secretKey, bucket, keys) => {
    try {
      const response = await fetch(`${API_URL}/download-multiple/${bucket}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_key': accessKey,
          'secret_key': secretKey
        },
        body: JSON.stringify({ keys })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Erro ao fazer download de múltiplos objetos:', error);
      throw error;
    }
  },

  /**
   * Deleta um objeto do bucket
   * @param {string} accessKey - Access Key ID da AWS
   * @param {string} secretKey - Secret Access Key da AWS
   * @param {string} bucket - Nome do bucket
   * @param {string} key - Chave do objeto
   * @returns {Promise<Object>} Resultado da operação
   */
  deleteObject: async (accessKey, secretKey, bucket, key) => {
    try {
      const encodedKey = encodeURIComponent(key);
      const response = await fetch(`${API_URL}/object/${bucket}/${encodedKey}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'access_key': accessKey,
          'secret_key': secretKey
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao deletar objeto:', error);
      throw error;
    }
  },

  /**
   * Deleta múltiplos objetos de um bucket
   * @param {string} accessKey - Access Key ID da AWS
   * @param {string} secretKey - Secret Access Key da AWS
   * @param {string} bucket - Nome do bucket
   * @param {string[]} keys - Lista de chaves dos objetos
   * @returns {Promise<Object>} Resultado da operação
   */
  deleteObjects: async (accessKey, secretKey, bucket, keys) => {
    try {
      const response = await fetch(`${API_URL}/objects/${bucket}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'access_key': accessKey,
          'secret_key': secretKey
        },
        body: JSON.stringify({ keys })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao deletar objetos:', error);
      throw error;
    }
  },

  /**
   * Deleta um bucket
   * @param {string} accessKey - Access Key ID da AWS
   * @param {string} secretKey - Secret Access Key da AWS
   * @param {string} bucket - Nome do bucket
   * @returns {Promise<Object>} Resultado da operação
   */
  deleteBucket: async (accessKey, secretKey, bucket) => {
    try {
      const response = await fetch(`${API_URL}/bucket/${bucket}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'access_key': accessKey,
          'secret_key': secretKey
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao deletar bucket:', error);
      throw error;
    }
  },

  /**
   * Método genérico para fazer requisições GET
   * @param {string} endpoint - Endpoint da API
   * @param {Object} headers - Headers adicionais
   * @returns {Promise<Object>} Resposta da API
   */
  get: async (endpoint, headers = {}) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Erro na requisição GET ${endpoint}:`, error);
      throw error;
    }
  },

  /**
   * Método genérico para fazer requisições POST
   * @param {string} endpoint - Endpoint da API
   * @param {Object} data - Dados para enviar
   * @param {Object} headers - Headers adicionais
   * @returns {Promise<Object>} Resposta da API
   */
  post: async (endpoint, data = {}, headers = {}) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Erro na requisição POST ${endpoint}:`, error);
      throw error;
    }
  },

  // Métodos para outros serviços AWS
  getEC2Instances: async (accessKey, secretKey) => {
    return apiService.get('/api/ec2/instances', {
      'access_key': accessKey,
      'secret_key': secretKey
    });
  },

  getDynamoTables: async (accessKey, secretKey) => {
    return apiService.get('/api/dynamodb/tables', {
      'access_key': accessKey,
      'secret_key': secretKey
    });
  },

  getCloudFrontDistributions: async (accessKey, secretKey) => {
    return apiService.get('/api/cloudfront/distributions', {
      'access_key': accessKey,
      'secret_key': secretKey
    });
  },

  getRDSInstances: async (accessKey, secretKey) => {
    return apiService.get('/api/rds/instances', {
      'access_key': accessKey,
      'secret_key': secretKey
    });
  },

  getBillingInfo: async (accessKey, secretKey) => {
    return apiService.get('/api/billing/info', {
      'access_key': accessKey,
      'secret_key': secretKey
    });
  },

  getExchangeRate: async () => {
    return apiService.get('/api/billing/exchange-rate');
  },

  compressImage: async (data) => {
    return apiService.post('/api/compress-image', data);
  }
};

export default apiService;