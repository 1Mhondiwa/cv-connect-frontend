import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import InterviewSchedulingModal from '../src/components/InterviewSchedulingModal'

const mockPost = vi.fn()

vi.mock('../src/utils/axios', () => ({
  default: { post: (...args) => mockPost(...args) },
  API_BASE_URL: 'http://localhost:5000',
}))

const freelancer = {
  freelancer_id: 5,
  first_name: 'Jane',
  last_name: 'Doe',
  headline: 'React Developer',
  profile_picture_url: null,
}

const request = {
  request_id: 12,
  title: 'Build Company Website',
  description: 'A marketing site with a blog',
}

const renderModal = (props = {}) =>
  render(
    <InterviewSchedulingModal
      isOpen={true}
      onClose={vi.fn()}
      freelancer={freelancer}
      request={request}
      onScheduleSuccess={vi.fn()}
      {...props}
    />
  )

const fillAndSubmit = () => {
  fireEvent.change(screen.getByLabelText('Date & Time'), {
    target: { name: 'scheduled_date', value: '2026-10-01T14:00' },
  })
  fireEvent.click(screen.getByRole('button', { name: /schedule interview/i }))
}

describe('InterviewSchedulingModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when closed', () => {
    const { container } = renderModal({ isOpen: false })
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when freelancer is missing', () => {
    const { container } = renderModal({ freelancer: null })
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when request is missing', () => {
    const { container } = renderModal({ request: null })
    expect(container.firstChild).toBeNull()
  })

  it('shows freelancer and project details', () => {
    renderModal()
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('React Developer')).toBeInTheDocument()
    expect(screen.getByText('Build Company Website')).toBeInTheDocument()
  })

  it('defaults to a video interview of 60 minutes', () => {
    renderModal()
    expect(screen.getByLabelText('Interview Type').value).toBe('video')
    expect(screen.getByLabelText('Duration (minutes)').value).toBe('60')
  })

  it('hides the location field for video interviews', () => {
    renderModal()
    expect(screen.queryByLabelText('Meeting Location')).not.toBeInTheDocument()
  })

  it('shows a required location field for in-person interviews', () => {
    renderModal()
    fireEvent.change(screen.getByLabelText('Interview Type'), {
      target: { name: 'interview_type', value: 'in_person' },
    })
    const location = screen.getByLabelText('Meeting Location')
    expect(location).toBeRequired()
  })

  it('enforces a minimum datetime 30 minutes in the future', () => {
    renderModal()
    const min = screen.getByLabelText('Date & Time').min
    // datetime-local strings parse as local time; compare in the same frame
    const minDate = new Date(min)
    const now = new Date()
    const diffMinutes = (minDate - now) / (60 * 1000)
    // The minimum is >= 30 minutes ahead and within a minute of exactly 30
    expect(diffMinutes).toBeGreaterThan(29)
    expect(diffMinutes).toBeLessThan(32)
  })

  it('submits with the request, freelancer and form data', async () => {
    mockPost.mockResolvedValue({ data: { success: true, data: { interview_id: 9 } } })
    renderModal()

    fireEvent.change(screen.getByLabelText('Duration (minutes)'), {
      target: { name: 'duration_minutes', value: '45' },
    })
    fillAndSubmit()

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/interview/schedule', {
        request_id: 12,
        freelancer_id: 5,
        interview_type: 'video',
        scheduled_date: '2026-10-01T14:00',
        duration_minutes: '45',
        location: '',
        interview_notes: '',
        invitation_message: '',
      })
    })
  })

  it('includes the location for in-person interviews', async () => {
    mockPost.mockResolvedValue({ data: { success: true, data: { interview_id: 9 } } })
    renderModal()

    fireEvent.change(screen.getByLabelText('Interview Type'), {
      target: { name: 'interview_type', value: 'in_person' },
    })
    fireEvent.change(screen.getByLabelText('Meeting Location'), {
      target: { name: 'location', value: 'Cape Town Office' },
    })
    fillAndSubmit()

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        '/interview/schedule',
        expect.objectContaining({ interview_type: 'in_person', location: 'Cape Town Office' })
      )
    })
  })

  it('shows success and calls onScheduleSuccess', async () => {
    const onScheduleSuccess = vi.fn()
    mockPost.mockResolvedValue({ data: { success: true, data: { interview_id: 9 } } })
    renderModal({ onScheduleSuccess })

    fillAndSubmit()

    await waitFor(() => {
      expect(screen.getByText(/Interview scheduled successfully/i)).toBeInTheDocument()
      expect(onScheduleSuccess).toHaveBeenCalledTimes(1)
    })
  })

  it('shows the backend error message on failure', async () => {
    mockPost.mockRejectedValue({
      response: { data: { message: 'You can only schedule one interview per request' } },
    })
    renderModal()

    fillAndSubmit()

    await waitFor(() => {
      expect(
        screen.getByText('You can only schedule one interview per request')
      ).toBeInTheDocument()
    })
  })
})
