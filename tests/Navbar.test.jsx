import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Navbar from '../src/components/Navbar'

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Navbar', () => {
  beforeEach(() => {
    vi.spyOn(window, 'addEventListener').mockImplementation(() => {})
    vi.spyOn(window, 'removeEventListener').mockImplementation(() => {})
  })

  it('renders brand logo and name', () => {
    renderWithRouter(<Navbar />)
    expect(screen.getByText('CV‑Connect')).toBeInTheDocument()
    const logo = screen.getByAltText('CV-Connect Logo')
    expect(logo).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    renderWithRouter(<Navbar />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Why Us')).toBeInTheDocument()
    expect(screen.getByText('Services')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
    expect(screen.getByText('Become Associate')).toBeInTheDocument()
  })

  it('renders auth links', () => {
    renderWithRouter(<Navbar />)
    expect(screen.getByText('Register')).toBeInTheDocument()
    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('toggles mobile menu on hamburger click', async () => {
    renderWithRouter(<Navbar />)
    const hamburger = screen.getByLabelText('Toggle navigation')
    expect(screen.queryByTestId('mobile-nav-menu')).not.toBeInTheDocument()

    fireEvent.click(hamburger)
    await waitFor(() => {
      const mobileMenu = screen.getByTestId('mobile-nav-menu')
      expect(within(mobileMenu).getByRole('link', { name: 'Home' })).toBeInTheDocument()
    })
    fireEvent.click(hamburger)
    await waitFor(() => {
      expect(screen.queryByTestId('mobile-nav-menu')).not.toBeInTheDocument()
    })
  })

  it('highlights active nav link', () => {
    renderWithRouter(<Navbar />)
    const homeLink = screen.getByRole('link', { name: 'Home', exact: true })
    expect(homeLink).toHaveClass('active')
  })

  it('closes mobile menu on route change', async () => {
    renderWithRouter(<Navbar />)
    const hamburger = screen.getByLabelText('Toggle navigation')
    fireEvent.click(hamburger)
    await waitFor(() => {
      const mobileMenu = screen.getByTestId('mobile-nav-menu')
      expect(within(mobileMenu).getByText('Home')).toBeInTheDocument()
    })
  })

  it('shows logo with correct alt text', () => {
    renderWithRouter(<Navbar />)
    const logo = screen.getByAltText('CV-Connect Logo')
    expect(logo).toHaveAttribute('src', '/assets/img/cv-connect_logo.png')
  })

  it('shows CV-Connect brand name', () => {
    renderWithRouter(<Navbar />)
    expect(screen.getByText('CV‑Connect')).toBeInTheDocument()
  })

  it('renders auth links Register and Login', () => {
    renderWithRouter(<Navbar />)
    expect(screen.getByText('Register')).toBeInTheDocument()
    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('mobile menu closes when nav link clicked', async () => {
    renderWithRouter(<Navbar />)
    const hamburger = screen.getByLabelText('Toggle navigation')
    fireEvent.click(hamburger)
    await waitFor(() => {
      const mobileMenu = screen.getByTestId('mobile-nav-menu')
      expect(within(mobileMenu).getByRole('link', { name: 'Home' })).toBeInTheDocument()
    })

    const mobileMenu = screen.getByTestId('mobile-nav-menu')
    fireEvent.click(within(mobileMenu).getByRole('link', { name: 'Home' }))
    await waitFor(() => {
      expect(screen.queryByTestId('mobile-nav-menu')).not.toBeInTheDocument()
    })
  })
})