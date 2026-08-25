import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Services from '../src/components/Services'

describe('Services', () => {
  it('renders section title', () => {
    render(<Services />)
    expect(screen.getByText('What You Get')).toBeInTheDocument()
  })

  it('renders subtitle', () => {
    render(<Services />)
    expect(screen.getByText(/Everything you need to find work/)).toBeInTheDocument()
  })

  it('renders four service cards', () => {
    render(<Services />)
    const titles = screen.getAllByRole('heading', { level: 3 })
    expect(titles).toHaveLength(4)
    expect(screen.getByText('Quick Profile Setup')).toBeInTheDocument()
    expect(screen.getByText('Find the Right Match')).toBeInTheDocument()
    expect(screen.getByText('Verified Users')).toBeInTheDocument()
    expect(screen.getByText('Direct Communication')).toBeInTheDocument()
  })

  it('renders description for Quick Profile Setup', () => {
    render(<Services />)
    expect(screen.getByText(/Upload your CV and get a professional profile/)).toBeInTheDocument()
  })

  it('renders description for Find the Right Match', () => {
    render(<Services />)
    expect(screen.getByText(/Companies can search and find freelancers/)).toBeInTheDocument()
  })

  it('renders description for Verified Users', () => {
    render(<Services />)
    expect(screen.getByText(/All freelancers and companies are verified/)).toBeInTheDocument()
  })

  it('renders description for Direct Communication', () => {
    render(<Services />)
    expect(screen.getByText(/Talk directly with clients and freelancers/)).toBeInTheDocument()
  })
})