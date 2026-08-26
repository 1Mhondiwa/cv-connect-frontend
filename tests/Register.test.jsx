import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Register from '../src/components/Register'

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders sign up heading and welcome text', () => {
    renderWithRouter(<Register />)
    expect(screen.getByRole('heading', { name: 'Sign Up' })).toBeInTheDocument()
    expect(screen.getByText(/Secure your career journey/)).toBeInTheDocument()
  })

  it('renders all form fields', () => {
    renderWithRouter(<Register />)
    expect(screen.getByLabelText('First Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
  })

  it('renders country code select', () => {
    renderWithRouter(<Register />)
    expect(screen.getByLabelText('Country code')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /🇿🇦/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /🇺🇸/ })).toBeInTheDocument()
  })

it('shows password strength indicator', async () => {
    renderWithRouter(<Register />)
    const passwordInput = screen.getByLabelText('Password')
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'weak' } })
    expect(screen.getByText(/WEAK/i)).toBeInTheDocument()

    fireEvent.change(passwordInput, { target: { name: 'password', value: 'Test123!' } })
    await waitFor(() => {
      const strengthContainer = screen.getByText(/Requirements:/i).parentElement
      expect(strengthContainer.textContent).toContain('STRONG')
    }, { timeout: 3000 })

    fireEvent.change(passwordInput, { target: { name: 'password', value: 'StrongPass123!' } })
    expect(screen.getByText(/STRONG/i)).toBeInTheDocument()
  })

  it('toggles password visibility', async () => {
    renderWithRouter(<Register />)
    const passwordInput = screen.getByLabelText('Password')
    expect(passwordInput).toHaveAttribute('type', 'password')

    const toggleButton = screen.getByRole('button', { name: /show main password/i })
    fireEvent.click(toggleButton)
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text')

    fireEvent.click(screen.getByRole('button', { name: /hide main password/i }))
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
  })

  it('toggles confirm password visibility', async () => {
    renderWithRouter(<Register />)
    const confirmPasswordInput = screen.getByLabelText('Confirm Password')
    expect(confirmPasswordInput).toHaveAttribute('type', 'password')

    // Find the toggle button associated with confirm password input
    const confirmPasswordToggle = confirmPasswordInput.parentElement.querySelector('button[aria-label*="confirm password"]')
    fireEvent.click(confirmPasswordToggle)
    expect(screen.getByLabelText('Confirm Password')).toHaveAttribute('type', 'text')

    fireEvent.click(confirmPasswordInput.parentElement.querySelector('button[aria-label*="confirm password"]'))
    expect(screen.getByLabelText('Confirm Password')).toHaveAttribute('type', 'password')
  })

  it('shows error when fields are empty on submit', async () => {
    renderWithRouter(<Register />)
    fireEvent.click(screen.getByRole('button', { name: 'Register' }))
    await waitFor(() => {
      expect(screen.getByText('Please fill in all fields.')).toBeInTheDocument()
    })
  })

  it('shows error when passwords do not match', async () => {
    renderWithRouter(<Register />)
    fireEvent.change(screen.getByLabelText('First Name'), { target: { name: 'first_name', value: 'John' } })
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { name: 'last_name', value: 'Doe' } })
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { name: 'email', value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { name: 'phone', value: '1234567890' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { name: 'password', value: 'Password123!' } })
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { name: 'confirmPassword', value: 'DifferentPass123!' } })
    fireEvent.click(screen.getByRole('button', { name: 'Register' }))
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument()
    })
  })

  it('validates password strength requirements', async () => {
    renderWithRouter(<Register />)
    fireEvent.change(screen.getByLabelText('First Name'), { target: { name: 'first_name', value: 'John' } })
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { name: 'last_name', value: 'Doe' } })
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { name: 'email', value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { name: 'phone', value: '1234567890' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { name: 'password', value: 'weak' } })
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { name: 'confirmPassword', value: 'weak' } })
    fireEvent.click(screen.getByRole('button', { name: 'Register' }))
    await waitFor(() => {
      expect(screen.getByText(/weak|weak password|strength/i)).toBeInTheDocument()
    })
  })

  it('toggles password visibility for both password fields', async () => {
    renderWithRouter(<Register />)
    
    // Test main password toggle
    const passwordInput = screen.getByLabelText('Password')
    const passwordToggle = passwordInput.parentElement.querySelector('button[aria-label*="main password"]')
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
    fireEvent.click(passwordToggle)
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text')
    
    // Test confirm password toggle
    const confirmInput = screen.getByLabelText('Confirm Password')
    const confirmToggle = confirmInput.parentElement.querySelector('button[aria-label*="confirm password"]')
    fireEvent.click(confirmToggle)
    expect(screen.getByLabelText('Confirm Password')).toHaveAttribute('type', 'text')
  })

  it('renders login link', () => {
    renderWithRouter(<Register />)
    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument()
  })
})