import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import HiringModal from '../src/components/HiringModal'

const mockPost = vi.fn()

vi.mock('../src/utils/axios', () => ({
  default: { post: (...args) => mockPost(...args) },
  API_BASE_URL: 'http://localhost:5000',
}))

const freelancer = {
  freelancer_id: 5,
  first_name: 'Jane',
  last_name: 'Doe',
  headline: 'React Developer',
  hourly_rate: 450,
}

const request = {
  request_id: 12,
  title: 'Build Company Website',
  description: 'A marketing site with a blog',
}

const pdfFile = new File(['%PDF-1.4 test'], 'contract.pdf', { type: 'application/pdf' })

// The component's file input has no label association, so query by type
const getFileInput = (container) => container.querySelector('input[type="file"]')

const renderModal = (props = {}) =>
  render(
    <HiringModal
      isOpen={true}
      onClose={vi.fn()}
      freelancer={freelancer}
      request={request}
      onHireSuccess={vi.fn()}
      {...props}
    />
  )

describe('HiringModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when closed', () => {
    const { container } = renderModal({ isOpen: false })
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when freelancer is missing', () => {
    const { container } = renderModal({ freelancer: null })
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when request is missing', () => {
    const { container } = renderModal({ request: null })
    expect(container.firstChild).toBeNull()
  })

  it('shows the freelancer name in the title', () => {
    renderModal()
    expect(screen.getByText('Hire Jane Doe')).toBeInTheDocument()
  })

  it('prefills the project title and description from the request', () => {
    renderModal()
    expect(screen.getByDisplayValue('Build Company Website')).toBeInTheDocument()
    expect(screen.getByDisplayValue('A marketing site with a blog')).toBeInTheDocument()
  })

  it('requires a contract PDF before submit', async () => {
    renderModal()
    fireEvent.click(screen.getByRole('button', { name: /hire freelancer/i }))
    await waitFor(() => {
      expect(screen.getByText('Please upload a contract PDF file.')).toBeInTheDocument()
    })
    expect(mockPost).not.toHaveBeenCalled()
  })

  it('rejects non-PDF files', async () => {
    const { container } = renderModal()
    const input = getFileInput(container)
    fireEvent.change(input, {
      target: { files: [new File(['x'], 'contract.docx', { type: 'application/msword' })] },
    })
    await waitFor(() => {
      expect(screen.getByText('Please upload a PDF file only.')).toBeInTheDocument()
    })
  })

  it('rejects files over 10MB', async () => {
    const { container } = renderModal()
    const bigFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'big.pdf', { type: 'application/pdf' })
    Object.defineProperty(bigFile, 'size', { value: 11 * 1024 * 1024 })
    const input = getFileInput(container)
    fireEvent.change(input, { target: { files: [bigFile] } })
    await waitFor(() => {
      expect(screen.getByText('File size must be less than 10MB.')).toBeInTheDocument()
    })
  })

  it('accepts a valid PDF and clears the error', async () => {
    const { container } = renderModal()
    const input = getFileInput(container)
    fireEvent.change(input, { target: { files: [pdfFile] } })
    await waitFor(() => {
      expect(screen.queryByText('Please upload a PDF file only.')).not.toBeInTheDocument()
    })
  })

  it('submits the hire form with all fields', async () => {
    mockPost.mockResolvedValue({ data: { success: true, data: { hire_id: 77 } } })
    const { container } = renderModal()

    fireEvent.change(screen.getByPlaceholderText('Enter agreed rate'), {
      target: { name: 'agreed_rate', value: '450' },
    })
    const input = getFileInput(container)
    fireEvent.change(input, { target: { files: [pdfFile] } })

    fireEvent.click(screen.getByRole('button', { name: /hire freelancer/i }))

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledTimes(1)
      const [url, body] = mockPost.mock.calls[0]
      expect(url).toBe('/hiring/hire')
      expect(body.get('request_id')).toBe('12')
      expect(body.get('freelancer_id')).toBe('5')
      expect(body.get('project_title')).toBe('Build Company Website')
      expect(body.get('agreed_rate')).toBe('450')
      expect(body.get('rate_type')).toBe('hourly')
      expect(body.get('contract_pdf')).toBe(pdfFile)
    })
  })

  it('shows success and calls onHireSuccess on a successful hire', async () => {
    const onHireSuccess = vi.fn()
    mockPost.mockResolvedValue({ data: { success: true, data: { hire_id: 77 } } })
    const { container } = renderModal({ onHireSuccess })

    const input = getFileInput(container)
    fireEvent.change(input, { target: { files: [pdfFile] } })
    fireEvent.click(screen.getByRole('button', { name: /hire freelancer/i }))

    await waitFor(() => {
      expect(screen.getByText(/Freelancer hired successfully/i)).toBeInTheDocument()
      expect(onHireSuccess).toHaveBeenCalledTimes(1)
    })
  })

  it('shows the backend error message on failure', async () => {
    mockPost.mockRejectedValue({
      response: { data: { message: 'This freelancer was not recommended for this request' } },
    })
    const { container } = renderModal()

    const input = getFileInput(container)
    fireEvent.change(input, { target: { files: [pdfFile] } })
    fireEvent.click(screen.getByRole('button', { name: /hire freelancer/i }))

    await waitFor(() => {
      expect(
        screen.getByText('This freelancer was not recommended for this request')
      ).toBeInTheDocument()
    })
  })
})
