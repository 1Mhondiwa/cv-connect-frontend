import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import WhyUs from '../src/components/WhyUs'

describe('WhyUs', () => {
  it('renders section title', () => {
    render(<WhyUs />)
    expect(screen.getByText('Why CV‑Connect?')).toBeInTheDocument()
  })

  it('renders subtitle', () => {
    render(<WhyUs />)
    expect(screen.getByText(/thousands of freelancers and companies/)).toBeInTheDocument()
  })

  it('renders three feature cards', () => {
    render(<WhyUs />)
    const cards = screen.getAllByText(/Start Working Fast|Trusted Network|Direct Connections/)
    expect(cards).toHaveLength(3)
  })

  it('renders Start Working Fast card', () => {
    render(<WhyUs />)
    expect(screen.getByText('Start Working Fast')).toBeInTheDocument()
    expect(screen.getByText(/Upload your CV and get matched/)).toBeInTheDocument()
  })

  it('renders Trusted Network card', () => {
    render(<WhyUs />)
    expect(screen.getByText('Trusted Network')).toBeInTheDocument()
    expect(screen.getByText(/Work with verified companies/)).toBeInTheDocument()
  })

  it('renders Direct Connections card', () => {
    render(<WhyUs />)
    expect(screen.getByText('Direct Connections')).toBeInTheDocument()
    expect(screen.getByText(/Connect directly with clients/)).toBeInTheDocument()
  })
})