import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from '../src/components/Footer'

describe('Footer', () => {
  it('renders CV-Connect branding', () => {
    render(<Footer />)
    expect(screen.getByText('CV‑Connect')).toBeInTheDocument()
  })

  it('renders tagline', () => {
    render(<Footer />)
    expect(screen.getByText(/Empowering freelancers/)).toBeInTheDocument()
    expect(screen.getByText(/Connecting talent with opportunity/)).toBeInTheDocument()
  })

  it('renders current year in copyright', () => {
    render(<Footer />)
    const year = new Date().getFullYear().toString()
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument()
    expect(screen.getByText(/All rights reserved/)).toBeInTheDocument()
  })

  it('renders three social links', () => {
    render(<Footer />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(3)
    expect(screen.getByTitle('LinkedIn')).toBeInTheDocument()
    expect(screen.getByTitle('Twitter')).toBeInTheDocument()
    expect(screen.getByTitle('Email')).toBeInTheDocument()
  })
})