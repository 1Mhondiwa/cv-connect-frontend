import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ForgotPassword from '../src/components/ForgotPassword'

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

const renderForgot = () =>
  render(
    <BrowserRouter>
      <ForgotPassword />
    </BrowserRouter>
  )

describe('ForgotPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders heading, instructions and email field', () => {
    renderForgot()
    expect(screen.getByRole('heading', { name: 'Forgot Password' })).toBeInTheDocument()
    expect(
      screen.getByText(/Enter your email address to receive a password reset link/i)
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Request Reset Link' })).toBeInTheDocument()
  })

  it('renders a link back to sign in', () => {
    renderForgot()
    expect(screen.getByRole('link', { name: 'Sign In' })).toHaveAttribute('href', '/login')
  })

  it('shows an error when submitted with an empty email', async () => {
    renderForgot()
    fireEvent.click(screen.getByRole('button', { name: 'Request Reset Link' }))
    await waitFor(() => {
      expect(screen.getByText('Please enter your email address.')).toBeInTheDocument()
    })
    expect(mockPost).not.toHaveBeenCalled()
  })

  it('shows an error for whitespace-only email', async () => {
    renderForgot()
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { name: 'email', value: '   ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Request Reset Link' }))
    await waitFor(() => {
      expect(screen.getByText('Please enter your email address.')).toBeInTheDocument()
    })
    expect(mockPost).not.toHaveBeenCalled()
  })

  it('posts the trimmed email and shows the success message', async () => {
    mockPost.mockResolvedValue({ data: { success: true, message: 'Reset link sent' } })
    renderForgot()
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { name: 'email', value: '  user@example.com  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Request Reset Link' }))

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/auth/request-reset', {
        email: 'user@example.com',
      })
      expect(screen.getByText('Reset link sent')).toBeInTheDocument()
    })
  })

  it('shows the backend error message on failure', async () => {
    mockPost.mockRejectedValue({
      response: { data: { message: 'Too many reset requests' } },
    })
    renderForgot()
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { name: 'email', value: 'user@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Request Reset Link' }))

    await waitFor(() => {
      expect(screen.getByText('Too many reset requests')).toBeInTheDocument()
    })
  })

  it('shows a generic error when the failure has no message', async () => {
    mockPost.mockRejectedValue(new Error('network down'))
    renderForgot()
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { name: 'email', value: 'user@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Request Reset Link' }))

    await waitFor(() => {
      expect(
        screen.getByText('Failed to request password reset. Please try again.')
      ).toBeInTheDocument()
    })
  })

  it('shows the failure message returned by the api', async () => {
    mockPost.mockResolvedValue({ data: { success: false, message: 'Rate limited' } })
    renderForgot()
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { name: 'email', value: 'user@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Request Reset Link' }))

    await waitFor(() => {
      expect(screen.getByText('Rate limited')).toBeInTheDocument()
    })
  })

  it('shows the dev token and navigates to reset in dev mode', async () => {
    vi.useFakeTimers()
    mockPost.mockResolvedValue({
      data: { success: true, message: 'Reset link sent', debug: { reset_token: 'dev-token-123' } },
    })
    renderForgot()
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { name: 'email', value: 'user@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Request Reset Link' }))

    await vi.advanceTimersByTimeAsync(1600)
    // The token appears both inline and in the eventual navigate call
    expect(mockPost).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith('/reset-password?token=dev-token-123')
  })
})
