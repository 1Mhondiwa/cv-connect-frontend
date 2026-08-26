import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import * as axiosModule from '../src/utils/axios'
import ResetPassword from '../src/components/ResetPassword'

vi.mock('../src/utils/axios', () => ({
  default: {
    post: vi.fn(),
  },
}))

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('ResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders reset password heading and description', () => {
    renderWithRouter(<ResetPassword />)
    expect(screen.getByRole('heading', { name: 'Reset Password' })).toBeInTheDocument()
    expect(screen.getByText(/Enter your new password below/)).toBeInTheDocument()
  })

  it('renders token input field', () => {
    renderWithRouter(<ResetPassword />)
    expect(screen.getByLabelText('Reset Token')).toBeInTheDocument()
  })

  it('renders password and confirm password fields', () => {
    renderWithRouter(<ResetPassword />)
    expect(screen.getByLabelText('New Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument()
  })

  it('shows password strength indicator', async () => {
    renderWithRouter(<ResetPassword />)
    const passwordInput = screen.getByLabelText('New Password')

    fireEvent.change(passwordInput, { target: { name: 'password', value: 'weak' } })
    expect(screen.getByText(/WEAK/i)).toBeInTheDocument()

    fireEvent.change(passwordInput, { target: { name: 'password', value: 'Test12345!' } })
    await waitFor(() => {
      const strengthContainer = screen.getByText(/Requirements:/i).parentElement
      expect(strengthContainer.textContent).toContain('STRONG')
    }, { timeout: 3000 })

    fireEvent.change(passwordInput, { target: { name: 'password', value: 'StrongPass123!' } })
    const strongElements = screen.getAllByText('STRONG')
    expect(strongElements.length).toBeGreaterThanOrEqual(1)
  })

  it('toggles password visibility', async () => {
    renderWithRouter(<ResetPassword />)
    const passwordInput = screen.getByLabelText('New Password')
    expect(passwordInput).toHaveAttribute('type', 'password')

    const toggleButton = screen.getByRole('button', { name: /show password/i })
    fireEvent.click(toggleButton)
    expect(screen.getByLabelText('New Password')).toHaveAttribute('type', 'text')

    fireEvent.click(screen.getByRole('button', { name: /hide password/i }))
    expect(screen.getByLabelText('New Password')).toHaveAttribute('type', 'password')
  })

  it('toggles confirm password visibility', async () => {
    renderWithRouter(<ResetPassword />)
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password')
    expect(confirmPasswordInput).toHaveAttribute('type', 'password')

    const confirmPasswordToggle = confirmPasswordInput.parentElement.querySelector('button[aria-label*="password"]')
    fireEvent.click(confirmPasswordToggle)
    expect(screen.getByLabelText('Confirm New Password')).toHaveAttribute('type', 'text')

    fireEvent.click(confirmPasswordInput.parentElement.querySelector('button[aria-label*="password"]'))
    expect(screen.getByLabelText('Confirm New Password')).toHaveAttribute('type', 'password')
  })

  it('shows error when token is empty on submit', async () => {
    renderWithRouter(<ResetPassword />)
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))
    await waitFor(() => {
      expect(screen.getByText('Reset token is required.')).toBeInTheDocument()
    })
  })

  it('shows error when passwords do not match', async () => {
    renderWithRouter(<ResetPassword />)
    fireEvent.change(screen.getByLabelText('Reset Token'), { target: { name: 'token', value: 'some-token' } })
    fireEvent.change(screen.getByLabelText('New Password'), { target: { name: 'password', value: 'Password123!' } })
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { name: 'confirmPassword', value: 'DifferentPass123!' } })
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))
    await waitFor(() => {
      const errorDiv = screen.getByTestId('error-message')
      expect(errorDiv).toHaveTextContent(/Passwords do not match/i)
    })
  })

  it('shows error when password is too short', async () => {
    renderWithRouter(<ResetPassword />)
    fireEvent.change(screen.getByLabelText('Reset Token'), { target: { name: 'token', value: 'some-token' } })
    fireEvent.change(screen.getByLabelText('New Password'), { target: { name: 'password', value: '123' } })
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { name: 'confirmPassword', value: '123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))
    await waitFor(() => {
      const errorDiv = screen.getByTestId('error-message')
      expect(errorDiv).toHaveTextContent('Password must be at least 6 characters long')
    })
  })

  it('shows success message on successful reset', async () => {
    axiosModule.default.post.mockResolvedValue({
      data: { success: true, message: 'Password updated successfully! You can now log in.' }
    })

    renderWithRouter(<ResetPassword />)
    fireEvent.change(screen.getByLabelText('Reset Token'), { target: { name: 'token', value: 'valid-token' } })
    fireEvent.change(screen.getByLabelText('New Password'), { target: { name: 'password', value: 'NewPass123!' } })
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { name: 'confirmPassword', value: 'NewPass123!' } })
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))

    await waitFor(() => {
      const successDiv = screen.getByTestId('success-message')
      expect(successDiv).toHaveTextContent('Password updated successfully! You can now log in.')
    })
  })
})
