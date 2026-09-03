import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import FreelancerCVUpload from '../src/components/FreelancerCVUpload'

const mockPost = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../src/utils/axios', () => ({
  default: { post: (...args) => mockPost(...args) },
  API_BASE_URL: 'http://localhost:5000',
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const pdfFile = new File(['%PDF-1.4 test'], 'resume.pdf', { type: 'application/pdf' })

const renderUpload = () =>
  render(
    <BrowserRouter>
      <FreelancerCVUpload />
    </BrowserRouter>
  )

// The drop-zone input has an id but no associated label,
// so locate it by id like the component itself does
const getFileInput = (container) => container.querySelector('#cv-file-input')

describe('FreelancerCVUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the drop-zone prompt', () => {
    renderUpload()
    expect(screen.getByText('Upload Your CV')).toBeInTheDocument()
    expect(screen.getByText('Drop your CV here')).toBeInTheDocument()
    expect(screen.getByText(/Supports PDF, DOC, DOCX, TXT/)).toBeInTheDocument()
  })

  it('keeps the upload button disabled until a file is selected', () => {
    renderUpload()
    expect(screen.getByRole('button', { name: /upload cv/i })).toBeDisabled()
  })

  it('shows the selected file name, size and enables upload', () => {
    const { container } = renderUpload()
    fireEvent.change(getFileInput(container), { target: { files: [pdfFile] } })

    expect(screen.getByText('resume.pdf')).toBeInTheDocument()
    expect(screen.getByText(/MB/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /upload cv/i })).not.toBeDisabled()
    expect(screen.queryByText('Drop your CV here')).not.toBeInTheDocument()
  })

  it('clears the selected file with the remove button', () => {
    const { container } = renderUpload()
    fireEvent.change(getFileInput(container), { target: { files: [pdfFile] } })
    expect(screen.getByText('resume.pdf')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /remove file/i }))
    expect(screen.queryByText('resume.pdf')).not.toBeInTheDocument()
    expect(screen.getByText('Drop your CV here')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /upload cv/i })).toBeDisabled()
  })

  it('uploads the file with multipart encoding on submit', async () => {
    mockPost.mockResolvedValue({ data: { message: 'CV uploaded successfully' } })
    const { container } = renderUpload()
    fireEvent.change(getFileInput(container), { target: { files: [pdfFile] } })
    fireEvent.click(screen.getByRole('button', { name: /upload cv/i }))

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledTimes(1)
      const [url, body, config] = mockPost.mock.calls[0]
      expect(url).toBe('/freelancer/cv/upload')
      expect(body.get('cv')).toBe(pdfFile)
      expect(config.headers['Content-Type']).toBe('multipart/form-data')
    })
  })

  it('shows the success message after upload', async () => {
    mockPost.mockResolvedValue({ data: { message: 'CV uploaded successfully' } })
    const { container } = renderUpload()
    fireEvent.change(getFileInput(container), { target: { files: [pdfFile] } })
    fireEvent.click(screen.getByRole('button', { name: /upload cv/i }))

    await waitFor(() => {
      expect(screen.getByText('CV uploaded successfully')).toBeInTheDocument()
    })
  })

  it('navigates to the profile page after a delay on success', async () => {
    vi.useFakeTimers()
    mockPost.mockResolvedValue({ data: { message: 'CV uploaded successfully' } })
    const { container } = renderUpload()
    fireEvent.change(getFileInput(container), { target: { files: [pdfFile] } })
    fireEvent.click(screen.getByRole('button', { name: /upload cv/i }))

    // Flushes the upload promise, the success render, and the 2s close timer
    await vi.advanceTimersByTimeAsync(2500)

    expect(screen.getByText('CV uploaded successfully')).toBeInTheDocument()
    expect(mockNavigate).toHaveBeenCalledWith('/freelancer/profile')
  })

  it('shows the backend error message on failure', async () => {
    mockPost.mockRejectedValue({
      response: { data: { message: 'File too large. Maximum size is 10MB.' } },
    })
    const { container } = renderUpload()
    fireEvent.change(getFileInput(container), { target: { files: [pdfFile] } })
    fireEvent.click(screen.getByRole('button', { name: /upload cv/i }))

    await waitFor(() => {
      expect(
        screen.getByText('File too large. Maximum size is 10MB.')
      ).toBeInTheDocument()
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('shows a generic error message when the failure has no message', async () => {
    mockPost.mockRejectedValue(new Error('network down'))
    const { container } = renderUpload()
    fireEvent.change(getFileInput(container), { target: { files: [pdfFile] } })
    fireEvent.click(screen.getByRole('button', { name: /upload cv/i }))

    await waitFor(() => {
      expect(
        screen.getByText('Upload failed. Please try again or check your file format.')
      ).toBeInTheDocument()
    })
  })
})
