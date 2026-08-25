import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import About from '../src/components/About'

describe('About', () => {
  it('renders section title', () => {
    render(<About />)
    expect(screen.getByText('About CV‑Connect')).toBeInTheDocument()
  })

  it('renders why people choose CV-Connect section', () => {
    render(<About />)
    expect(screen.getByText('Why People Choose CV‑Connect?')).toBeInTheDocument()
  })

  it('renders four feature list items', () => {
    render(<About />)
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(4)
    expect(screen.getByText(/Quick Profile Setup/)).toBeInTheDocument()
    expect(screen.getByText(/Verified Companies/)).toBeInTheDocument()
    expect(screen.getByText(/Smart Job Matching/)).toBeInTheDocument()
    expect(screen.getByText(/Direct Communication/)).toBeInTheDocument()
  })

  it('renders the closing paragraph', () => {
    render(<About />)
    expect(screen.getByText(/CV‑Connect is where professionals come to find work/)).toBeInTheDocument()
  })

  it('renders an image', () => {
    render(<About />)
    const img = screen.getByAltText('')
    expect(img).toBeInTheDocument()
  })
})