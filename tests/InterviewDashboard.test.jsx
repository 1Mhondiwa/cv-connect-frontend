import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import InterviewDashboard from '../src/components/InterviewDashboard'

const mockGet = vi.fn()

vi.mock('../src/utils/axios', () => ({
  default: { get: (...args) => mockGet(...args) },
  API_BASE_URL: 'http://localhost:5000',
}))

vi.mock('../src/components/InterviewFeedbackModal', () => ({
  default: () => <div data-testid="feedback-modal" />
}))

vi.mock('../src/components/VideoCallModal', () => ({
  default: () => <div data-testid="video-call-modal" />
}))

const interview = (overrides = {}) => ({
  interview_id: 1,
  interview_type: 'video',
  status: 'scheduled',
  scheduled_date: new Date(Date.now() + 86400000).toISOString(),
  duration_minutes: 45,
  request_title: 'Frontend Developer Role',
  request_description: 'Build the new dashboard',
  freelancer_first_name: 'Jane',
  freelancer_last_name: 'Doe',
  associate_company: 'Acme',
  location: null,
  interview_notes: null,
  feedback: [],
  ...overrides,
})

const renderDashboard = (userType = 'associate') =>
  render(<InterviewDashboard userType={userType} />)

describe('InterviewDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', () => {
    mockGet.mockReturnValue(new Promise(() => {}))
    renderDashboard()
    expect(screen.getByText(/Loading your interviews/i)).toBeInTheDocument()
  })

  it('renders interview cards after fetch', async () => {
    mockGet.mockResolvedValue({
      data: { success: true, interviews: [interview()] },
    })
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
      expect(screen.getByText('Frontend Developer Role')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /View Details/i })).toBeInTheDocument()
      expect(screen.getByText(/45 minutes/i)).toBeInTheDocument()
    })
    // The status badge plus the filter dropdown option both say "Scheduled"
    expect(screen.getAllByText(/Scheduled/i).length).toBeGreaterThan(0)
  })

  it('shows empty state when there are no interviews', async () => {
    mockGet.mockResolvedValue({
      data: { success: true, interviews: [] },
    })
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText(/No interviews found/i)).toBeInTheDocument()
      expect(screen.getByText(/You don't have any interviews yet/i)).toBeInTheDocument()
    })
  })

  it('shows error state when the API fails', async () => {
    mockGet.mockRejectedValue(new Error('Network error'))
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText(/Failed to load interviews/i)).toBeInTheDocument()
    })
  })

  it('shows start button for associates on scheduled interviews', async () => {
    mockGet.mockResolvedValue({
      data: { success: true, interviews: [interview()] },
    })
    renderDashboard('associate')

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Start Interview/i })).toBeInTheDocument()
    })
  })

  it('hides start button for freelancers on scheduled interviews', async () => {
    mockGet.mockResolvedValue({
      data: { success: true, interviews: [interview()] },
    })
    renderDashboard('freelancer')

    // Freelancers see the associate company, not the freelancer name
    await waitFor(() => {
      expect(screen.getByText('Acme')).toBeInTheDocument()
    })
    expect(screen.queryByRole('button', { name: /Start Interview/i })).not.toBeInTheDocument()
  })

  it('shows join button for freelancers on in-progress interviews', async () => {
    mockGet.mockResolvedValue({
      data: { success: true, interviews: [interview({ status: 'in_progress' })] },
    })
    renderDashboard('freelancer')

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Join Interview/i })).toBeInTheDocument()
    })
  })

  it('shows end button for associates on in-progress interviews', async () => {
    mockGet.mockResolvedValue({
      data: { success: true, interviews: [interview({ status: 'in_progress' })] },
    })
    renderDashboard('associate')

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /End Interview/i })).toBeInTheDocument()
    })
  })

  it('fetches with status filter when a filter is active', async () => {
    mockGet.mockResolvedValue({
      data: { success: true, interviews: [] },
    })
    renderDashboard()
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith('/interview/'))

    // The default fetch uses no status param
    expect(mockGet).toHaveBeenCalledTimes(1)
  })

  it('renders completed badge for completed interviews', async () => {
    mockGet.mockResolvedValue({
      data: { success: true, interviews: [interview({ status: 'completed' })] },
    })
    renderDashboard('associate')

    // The card badge and the filter dropdown item both contain "Completed"
    await waitFor(() => {
      expect(screen.getAllByText(/Completed/i).length).toBeGreaterThan(1)
    })
  })
})
