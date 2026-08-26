import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Login from '../src/components/Login'

const mockLogin = vi.fn()

vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    login: mockLogin,
  }),
}))

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders sign in heading and welcome text', () => {
    renderWithRouter(<Login />)
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
    expect(screen.getByText(/Welcome back to CV‑Connect/)).toBeInTheDocument()
  })

  it('renders email and password input fields', () => {
    renderWithRouter(<Login />)
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('renders sign in button', () => {
    renderWithRouter(<Login />)
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('renders register and forgot password links', () => {
    renderWithRouter(<Login />)
    expect(screen.getByRole('link', { name: 'Register' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Forgot Your Password/i })).toBeInTheDocument()
  })

  it('shows error when email is empty on submit', async () => {
    renderWithRouter(<Login />)
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))
    await waitFor(() => {
      expect(screen.getByText('Please fill in all fields.')).toBeInTheDocument()
    })
  })

  it('shows error when password is empty on submit', async () => {
    renderWithRouter(<Login />)
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { name: 'email', value: 'test@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))
    await waitFor(() => {
      expect(screen.getByText('Please fill in all fields.')).toBeInTheDocument()
    })
  })

  it('toggles password visibility', async () => {
    renderWithRouter(<Login />)
    const passwordInput = screen.getByLabelText('Password')
    expect(passwordInput).toHaveAttribute('type', 'password')

    const toggleButton = screen.getByRole('button', { name: /show password/i })
    fireEvent.click(toggleButton)
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text')

    fireEvent.click(screen.getByRole('button', { name: /hide password/i }))
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
  })

  it('shows loading state during login', async () => {
    mockLogin.mockImplementation(() => new Promise(() => {}))
    renderWithRouter(<Login />)
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { name: 'email', value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { name: 'password', value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() => {
      expect(screen.getByText('Signing in...')).toBeInTheDocument()
    })
  })

  it('shows error when login fails', async () => {
    mockLogin.mockRejectedValue(new Error('Network error'))
    renderWithRouter(<Login />)
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { name: 'email', value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { name: 'password', value: 'wrongpassword' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() => {
      expect(screen.getByText('Login failed. Please check your credentials and try again.')).toBeInTheDocument()
    })
  })

  it('calls authLogin with correct credentials', async () => {
    mockLogin.mockResolvedValue({ success: true, user: { user_type: 'freelancer', user_id: 1 } })
    renderWithRouter(<Login />)
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { name: 'email', value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { name: 'password', value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })
})
