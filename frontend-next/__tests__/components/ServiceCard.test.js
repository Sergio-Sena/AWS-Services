import { render, screen } from '@testing-library/react'

// Mock component for testing
const ServiceCard = ({ title, icon, description, status }) => {
  return (
    <div className="service-card" data-testid="service-card">
      <div className="icon">
        <i className={icon}></i>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {status && (
        <span className={`status ${status}`} data-testid="status-badge">
          {status}
        </span>
      )}
    </div>
  )
}

describe('ServiceCard Component', () => {
  test('deve renderizar card com título e descrição', () => {
    render(
      <ServiceCard
        title="Amazon S3"
        icon="fas fa-database"
        description="Object storage service"
      />
    )

    expect(screen.getByText('Amazon S3')).toBeInTheDocument()
    expect(screen.getByText('Object storage service')).toBeInTheDocument()
  })

  test('deve renderizar ícone correto', () => {
    const { container } = render(
      <ServiceCard
        title="Amazon EC2"
        icon="fas fa-server"
        description="Virtual servers"
      />
    )

    const icon = container.querySelector('.fa-server')
    expect(icon).toBeInTheDocument()
  })

  test('deve mostrar badge de status quando fornecido', () => {
    render(
      <ServiceCard
        title="Amazon RDS"
        icon="fas fa-database"
        description="Managed database"
        status="active"
      />
    )

    const statusBadge = screen.getByTestId('status-badge')
    expect(statusBadge).toBeInTheDocument()
    expect(statusBadge).toHaveTextContent('active')
    expect(statusBadge).toHaveClass('status', 'active')
  })

  test('deve não mostrar badge quando status não fornecido', () => {
    render(
      <ServiceCard
        title="Amazon Lambda"
        icon="fas fa-bolt"
        description="Serverless compute"
      />
    )

    const statusBadge = screen.queryByTestId('status-badge')
    expect(statusBadge).not.toBeInTheDocument()
  })

  test('deve renderizar múltiplos cards', () => {
    const { container } = render(
      <>
        <ServiceCard title="S3" icon="fas fa-database" description="Storage" />
        <ServiceCard title="EC2" icon="fas fa-server" description="Compute" />
        <ServiceCard title="RDS" icon="fas fa-database" description="Database" />
      </>
    )

    const cards = container.querySelectorAll('[data-testid="service-card"]')
    expect(cards).toHaveLength(3)
  })
})
