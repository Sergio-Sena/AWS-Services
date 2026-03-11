import apiService from '@/services/api'

describe('API Service', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  describe('checkBackend', () => {
    test('deve retornar true quando backend está disponível', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' })
      })

      const result = await apiService.checkBackend()
      expect(result).toBe(true)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
        expect.any(Object)
      )
    })

    test('deve retornar false quando backend não está disponível', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await apiService.checkBackend()
      expect(result).toBe(false)
    })
  })

  describe('validateCredentials', () => {
    test('deve validar credenciais corretas', async () => {
      // Mock health check
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' })
      })

      // Mock auth
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: 'Autenticação bem-sucedida'
        })
      })

      const result = await apiService.validateCredentials('test-key', 'test-secret')
      
      expect(result.success).toBe(true)
      expect(fetch).toHaveBeenCalledTimes(2)
    })

    test('deve retornar erro quando backend não disponível', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await apiService.validateCredentials('test-key', 'test-secret')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Backend não disponível')
    })

    test('deve retornar erro com credenciais inválidas', async () => {
      // Mock health check
      fetch.mockResolvedValueOnce({
        ok: true
      })

      // Mock auth failure
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      })

      const result = await apiService.validateCredentials('invalid', 'invalid')
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('listBuckets', () => {
    test('deve listar buckets com sucesso', async () => {
      const mockBuckets = {
        success: true,
        buckets: [
          { Name: 'bucket-1', CreationDate: '2024-01-01' },
          { Name: 'bucket-2', CreationDate: '2024-01-02' }
        ]
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBuckets
      })

      const result = await apiService.listBuckets('test-key', 'test-secret')
      
      expect(result.success).toBe(true)
      expect(result.buckets).toHaveLength(2)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/buckets'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'access_key': 'test-key',
            'secret_key': 'test-secret'
          })
        })
      )
    })

    test('deve lançar erro quando requisição falha', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      await expect(
        apiService.listBuckets('test-key', 'test-secret')
      ).rejects.toThrow()
    })
  })

  describe('getEC2Instances', () => {
    test('deve listar instâncias EC2', async () => {
      const mockInstances = {
        success: true,
        instances: [
          { InstanceId: 'i-123', State: { Name: 'running' } }
        ]
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockInstances
      })

      const result = await apiService.getEC2Instances('test-key', 'test-secret')
      
      expect(result.success).toBe(true)
      expect(result.instances).toBeDefined()
    })
  })

  describe('getDynamoTables', () => {
    test('deve listar tabelas DynamoDB', async () => {
      const mockTables = {
        success: true,
        tables: ['table-1', 'table-2']
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTables
      })

      const result = await apiService.getDynamoTables('test-key', 'test-secret')
      
      expect(result.success).toBe(true)
      expect(result.tables).toHaveLength(2)
    })
  })

  describe('getHealth', () => {
    test('deve retornar status de saúde do backend', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok', timestamp: '2024-01-01' })
      })

      const result = await apiService.getHealth()
      
      expect(result.status).toBe('ok')
      expect(result.timestamp).toBeDefined()
    })

    test('deve retornar erro quando backend não responde', async () => {
      fetch.mockResolvedValueOnce({
        ok: false
      })

      const result = await apiService.getHealth()
      
      expect(result.status).toBe('error')
    })
  })
})
