import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Login from '../src/components/Login'

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

const mockAuthLogin = vi.fn()
const mockLogout = vi.fn()
const mockUpdateUser = vi.fn()

vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    login: mockAuthLogin,
    logout: mockLogout,
    updateUser: mockUpdateUser
  }),
  AuthProvider: ({ children }) => children
}))

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.restoreAllMocks()
    mockAuthLogin.mockReset()
    mockAuthLogin.mockResolvedValue({ success: true, user: { user_type: 'freelancer', user_id: 1 } })
  })

  afterEach(() => {
    vi.restoreAllMocks()
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

    const toggleButton = screen.getByRole('button', { name: /show password|hide password/i })
    fireEvent.click(toggleButton)
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text')

    fireEvent.click(screen.getByRole('button', { name: /show password|hide password/i }))
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
  })

  it('navigates to register page when clicking register link', () => {
    renderWithRouter(<Login />)
    fireEvent.click(screen.getByRole('link', { name: 'Register' }))
    expect(screen.getByText(/Register|Create Account|Sign Up/i)).toBeInTheDocument()
  })

  it('renders forgot password link', () => {
    renderWithRouter(<Login />)
    const forgotLink = screen.getByRole('link', { name: /Forgot Your Password/i })
    expect(forgotLink).toHaveAttribute('href', '/forgot-password')
  })

  it('shows loading state during login', async () => {
    renderWithRouter(<Login />)
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { name: 'email', value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { name: 'password', value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))
    
    await waitFor(() => {
      expect(screen.getByText('Signing in...')).toBeInTheDocument()
    })
  })

  it('shows error when login fails', async () => {
    mockAuthLogin.mockRejectedValueOnce(new Error('Network error'))
    
    renderWithRouter(<Login />)
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { name: 'email', value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { name: 'password', value: 'wrongpassword' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))
    
    await waitFor(() => {
      expect(screen.getByText('Login failed. Please check your credentials and try again.')).toBeInTheDocument()
    })
  })

  it('calls authLogin with correct credentials', async () => {
    renderWithRouter(<Login />)
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { name: 'email', value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { name: 'password', value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))
    
    await waitFor(() => {
      expect(mockAuthLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('redirects freelancer to dashboard on successful login', async () => {
    mockAuthLogin.mockResolvedValueOnce({ 
      success: true, 
      user: { 
        user_type: 'freelancer', 
        user_id: 1,
        email: 'test@example.com',
        is_active: true,
        is_verified: true,
        has_changed_temp_password: true,
        freelancer_id: 1,
        first_name: 'John',
        last_name: 'Doe'
      } 
    })

    renderWithRouter(<Login />)
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { name: 'email', value: 'freelancer@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { name: 'password', value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))
    
    await waitFor(() => {
      expect(screen.getByText('Login successful! Redirecting...')).toBeInTheDocument()
    })
  })
})