import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import InterviewFeedbackModal from '../src/components/InterviewFeedbackModal'

const mockPost = vi.fn()

vi.mock('../src/utils/axios', () => ({
  default: { post: (...args) => mockPost(...args) },
  API_BASE_URL: 'http://localhost:5000',
}))

const interview = {
  interview_id: 1,
  interview_type: 'video',
  status: 'completed',
  scheduled_date: new Date('2026-08-15T10:00:00Z').toISOString(),
  duration_minutes: 45,
  request_title: 'Frontend Developer Role',
}

const renderModal = (props = {}) =>
  render(
    <InterviewFeedbackModal
      isOpen={true}
      onClose={vi.fn()}
      interview={interview}
      onSubmitSuccess={vi.fn()}
      {...props}
    />
  )

const fillRatings = () => {
  const sections = [
    'Technical Skills',
    'Communication',
    'Cultural Fit',
    'Overall Rating',
  ]
  sections.forEach((label) => {
    const section = screen.getByText(label).closest('div.mb-3')
    fireEvent.click(section.querySelectorAll('button')[4])
  })
}

describe('InterviewFeedbackModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when closed', () => {
    const { container } = renderModal({ isOpen: false })
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when interview is missing', () => {
    const { container } = renderModal({ interview: null })
    expect(container.firstChild).toBeNull()
  })

  it('renders interview details', () => {
    renderModal()
    expect(screen.getByText('Interview Feedback')).toBeInTheDocument()
    expect(screen.getByText('Frontend Developer Role')).toBeInTheDocument()
    expect(screen.getByText(/45 minutes/)).toBeInTheDocument()
    expect(screen.getByText(/video/)).toBeInTheDocument()
  })

  it('renders all four rating sections', () => {
    renderModal()
    expect(screen.getByText('Technical Skills')).toBeInTheDocument()
    expect(screen.getByText('Communication')).toBeInTheDocument()
    expect(screen.getByText('Cultural Fit')).toBeInTheDocument()
    expect(screen.getByText('Overall Rating')).toBeInTheDocument()
  })

  it('shows "Click to rate" hint before a rating is chosen', () => {
    renderModal()
    const hints = screen.getAllByText('Click to rate')
    expect(hints.length).toBe(4)
  })

  it('updates star display and hint when a rating is clicked', () => {
    renderModal()
    const overallSection = screen.getByText('Overall Rating').closest('div.mb-3')
    const stars = overallSection.querySelectorAll('button')

    fireEvent.click(stars[4]) // 5 stars
    expect(screen.getByText('5 stars')).toBeInTheDocument()

    fireEvent.click(stars[0]) // 1 star
    expect(screen.getByText('1 star')).toBeInTheDocument()
  })

  it('selects a recommendation', () => {
    renderModal()
    const select = screen.getByLabelText('Recommendation *')
    expect(select.value).toBe('')

    fireEvent.change(select, { target: { name: 'recommendation', value: 'hire' } })
    expect(select.value).toBe('hire')
  })

  it('submits feedback with the form values and interview id', async () => {
    mockPost.mockResolvedValue({ data: { success: true } })
    renderModal()

    fillRatings()
    fireEvent.change(screen.getByLabelText('Recommendation *'), {
      target: { name: 'recommendation', value: 'hire' },
    })
    fireEvent.change(screen.getByLabelText('Strengths'), {
      target: { name: 'strengths', value: 'Strong React knowledge' },
    })

    fireEvent.click(screen.getByRole('button', { name: /submit feedback/i }))

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/interview/feedback', {
        interview_id: 1,
        technical_skills_rating: 5,
        communication_rating: 5,
        cultural_fit_rating: 5,
        overall_rating: 5,
        strengths: 'Strong React knowledge',
        areas_for_improvement: '',
        recommendation: 'hire',
        detailed_feedback: '',
      })
    })
  })

  it('shows success message and calls onSubmitSuccess after submit', async () => {
    const onSubmitSuccess = vi.fn()
    mockPost.mockResolvedValue({ data: { success: true } })
    renderModal({ onSubmitSuccess })

    fillRatings()
    fireEvent.change(screen.getByLabelText('Recommendation *'), {
      target: { name: 'recommendation', value: 'hire' },
    })
    fireEvent.click(screen.getByRole('button', { name: /submit feedback/i }))

    await waitFor(() => {
      expect(screen.getByText(/Feedback submitted successfully/i)).toBeInTheDocument()
      expect(onSubmitSuccess).toHaveBeenCalledTimes(1)
    })
  })

  it('shows error message when submission fails', async () => {
    mockPost.mockRejectedValue({
      response: { data: { message: 'Interview not completed' } },
    })
    renderModal()

    fillRatings()
    fireEvent.change(screen.getByLabelText('Recommendation *'), {
      target: { name: 'recommendation', value: 'no_hire' },
    })
    fireEvent.click(screen.getByRole('button', { name: /submit feedback/i }))

    await waitFor(() => {
      expect(screen.getByText('Interview not completed')).toBeInTheDocument()
    })
  })
})
