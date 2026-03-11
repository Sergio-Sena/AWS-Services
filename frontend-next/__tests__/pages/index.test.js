import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/router'
import Login from '@/pages/index'
import { useAuth } from '@/context/AuthContext'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

// Mock AuthContext
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn()
}))

// Mock API service
jest.mock('@/services/api', () => ({
  default: {
    checkBackend: jest.fn()
  }
}))

describe('Login Page', () => {
  const mockPush = jest.fn()
  const mockLogin = jest.fn()
  const mockShowNotification = jest.fn()

  beforeEach(() => {
    useRouter.mockReturnValue({
      push: mockPush
    })

    useAuth.mockReturnValue({
      login: mockLogin,
      isAuthenticated: false
    })

    // Mock API service
    const apiService = require('@/services/api').default
    apiService.checkBackend.mockResolvedValue(true)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('deve renderizar formulário de login', () => {
    render(<Login showNotification={mockShowNotification} />)

    expect(screen.getByText('AWS Services')).toBeInTheDocument()
    expect(screen.getByLabelText(/Access Key ID/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Secret Access Key/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Logar/i })).toBeInTheDocument()
  })

  test('deve verificar disponibilidade do backend ao carregar', async () => {
    const apiService = require('@/services/api').default
    
    render(<Login showNotification={mockShowNotification} />)

    await waitFor(() => {
      expect(apiService.checkBackend).toHaveBeenCalled()
    })
  })

  test('deve mostrar status online quando backend disponível', async () => {
    render(<Login showNotification={mockShowNotification} />)

    await waitFor(() => {
      expect(screen.getByText(/Sistema online/i)).toBeInTheDocument()
    })
  })

  test('deve mostrar status offline quando backend indisponível', async () => {
    const apiService = require('@/services/api').default
    apiService.checkBackend.mockResolvedValue(false)

    render(<Login showNotification={mockShowNotification} />)

    await waitFor(() => {
      expect(screen.getByText(/Backend não disponível/i)).toBeInTheDocument()
    })
  })

  test('deve alternar visibilidade da senha', () => {
    render(<Login showNotification={mockShowNotification} />)

    const passwordInput = screen.getByLabelText(/Secret Access Key/i)
    const toggleButton = passwordInput.parentElement.querySelector('.fa-eye')

    expect(passwordInput).toHaveAttribute('type', 'password')

    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')

    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('deve fazer login com credenciais válidas', async () => {
    mockLogin.mockResolvedValue({
      success: true
    })

    render(<Login showNotification={mockShowNotification} />)

    const accessKeyInput = screen.getByLabelText(/Access Key ID/i)
    const secretKeyInput = screen.getByLabelText(/Secret Access Key/i)
    const submitButton = screen.getByRole('button', { name: /Logar/i })

    fireEvent.change(accessKeyInput, { target: { value: 'test-access-key' } })
    fireEvent.change(secretKeyInput, { target: { value: 'test-secret-key' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test-access-key', 'test-secret-key')
      expect(mockShowNotification).toHaveBeenCalledWith(
        'Login realizado com sucesso!',
        'success'
      )
    })
  })

  test('deve mostrar erro com credenciais inválidas', async () => {
    mockLogin.mockResolvedValue({
      success: false,
      error: 'Credenciais inválidas'
    })

    render(<Login showNotification={mockShowNotification} />)

    const accessKeyInput = screen.getByLabelText(/Access Key ID/i)
    const secretKeyInput = screen.getByLabelText(/Secret Access Key/i)
    const submitButton = screen.getByRole('button', { name: /Logar/i })

    fireEvent.change(accessKeyInput, { target: { value: 'invalid' } })
    fireEvent.change(secretKeyInput, { target: { value: 'invalid' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockShowNotification).toHaveBeenCalledWith(
        'Credenciais inválidas',
        'error'
      )
    })
  })

  test('deve redirecionar para /services se já autenticado', () => {
    useAuth.mockReturnValue({
      login: mockLogin,
      isAuthenticated: true
    })

    render(<Login showNotification={mockShowNotification} />)

    expect(mockPush).toHaveBeenCalledWith('/services')
  })

  test('deve desabilitar botão durante loading', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))

    render(<Login showNotification={mockShowNotification} />)

    const accessKeyInput = screen.getByLabelText(/Access Key ID/i)
    const secretKeyInput = screen.getByLabelText(/Secret Access Key/i)
    const submitButton = screen.getByRole('button', { name: /Logar/i })

    fireEvent.change(accessKeyInput, { target: { value: 'test' } })
    fireEvent.change(secretKeyInput, { target: { value: 'test' } })
    fireEvent.click(submitButton)

    expect(submitButton).toBeDisabled()
  })
})
