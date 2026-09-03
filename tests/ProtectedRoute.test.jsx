import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../src/components/ProtectedRoute'

const mockGet = vi.fn()

vi.mock('../src/utils/axios', () => ({
  default: { get: (...args) => mockGet(...args) },
  API_BASE_URL: 'http://localhost:5000',
}))

let authState = { user: null, isAuthenticated: false, loading: false }

vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => authState,
}))

const SecretContent = () => <div data-testid="protected-content">Protected</div>
const LoginPage = () => <div data-testid="login">Login Page</div>
const WelcomePage = () => <div data-testid="welcome">Welcome Page</div>

const renderRoute = (requiredRole) =>
  render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute requiredRole={requiredRole}>
              <SecretContent />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/freelancer/welcome" element={<WelcomePage />} />
      </Routes>
    </MemoryRouter>
  )

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    authState = { user: null, isAuthenticated: false, loading: false }
  })

  it('renders children when authenticated with the required role', () => {
    authState = {
      user: { user_type: 'admin', user_id: 1 },
      isAuthenticated: true,
      loading: false,
    }
    renderRoute('admin')
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })

  it('renders children without a role requirement', () => {
    authState = {
      user: { user_type: 'freelancer', user_id: 2 },
      isAuthenticated: true,
      loading: false,
    }
    renderRoute(undefined)
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })

  it('redirects to login when not authenticated', () => {
    renderRoute('admin')
    expect(screen.getByTestId('login')).toBeInTheDocument()
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })

  it('redirects to login when the role does not match', () => {
    authState = {
      user: { user_type: 'freelancer', user_id: 2 },
      isAuthenticated: true,
      loading: false,
    }
    renderRoute('admin')
    expect(screen.getByTestId('login')).toBeInTheDocument()
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })

  it('shows a loading spinner while auth is loading', () => {
    authState = {
      user: null,
      isAuthenticated: false,
      loading: true,
    }
    const { container } = renderRoute('admin')
    expect(container.querySelector('.spinner-border')).toBeInTheDocument()
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })

  it('redirects freelancers without a CV to the welcome page', async () => {
    authState = {
      user: { user_type: 'freelancer', user_id: 3 },
      isAuthenticated: true,
      loading: false,
    }
    localStorage.setItem('token', 'test-token')
    mockGet.mockResolvedValue({ data: { success: true, profile: { cv: null } } })

    renderRoute('freelancer')

    await waitFor(() => {
      expect(screen.getByTestId('welcome')).toBeInTheDocument()
    })
    expect(mockGet).toHaveBeenCalledWith('/freelancer/profile', {
      headers: { Authorization: 'Bearer test-token' },
    })
  })

  it('keeps freelancers with a CV on the protected route', async () => {
    authState = {
      user: { user_type: 'freelancer', user_id: 3 },
      isAuthenticated: true,
      loading: false,
    }
    localStorage.setItem('token', 'test-token')
    mockGet.mockResolvedValue({ data: { success: true, profile: { cv: { cv_id: 9 } } } })

    renderRoute('freelancer')

    // Wait for the profile check to finish
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledTimes(1)
    })
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    expect(screen.queryByTestId('welcome')).not.toBeInTheDocument()
  })

  it('lets the route render when the profile check fails', async () => {
    authState = {
      user: { user_type: 'freelancer', user_id: 3 },
      isAuthenticated: true,
      loading: false,
    }
    localStorage.setItem('token', 'test-token')
    mockGet.mockRejectedValue(new Error('network down'))

    renderRoute('freelancer')

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledTimes(1)
    })
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })

  it('does not run the CV check for non-freelancer roles', async () => {
    authState = {
      user: { user_type: 'admin', user_id: 1 },
      isAuthenticated: true,
      loading: false,
    }
    renderRoute('admin')

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })
    expect(mockGet).not.toHaveBeenCalled()
  })
})
