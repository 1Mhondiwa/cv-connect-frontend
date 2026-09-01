import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ActivityTable from '../src/components/ActivityTable'

const activities = [
  {
    activity_type: 'CV Uploaded',
    activity_date: '2026-08-20T10:00:00Z',
    status: 'Completed',
  },
  {
    activity_type: 'Profile Updated',
    activity_date: '2026-08-21T10:00:00Z',
    status: 'Pending',
  },
  {
    activity_type: 'Message Sent',
    activity_date: '2026-08-22T10:00:00Z',
    status: 'Failed',
  },
]

describe('ActivityTable', () => {
  it('renders table headers', () => {
    render(<ActivityTable activities={[]} />)
    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(screen.getByText('Activity')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('renders empty state when there are no activities', () => {
    render(<ActivityTable activities={[]} />)
    expect(screen.getByText(/No recent activity to display/i)).toBeInTheDocument()
    expect(screen.getByText(/Your activity will appear here/i)).toBeInTheDocument()
  })

  it('renders a row per activity', () => {
    render(<ActivityTable activities={activities} />)
    expect(screen.getByText('CV Uploaded')).toBeInTheDocument()
    expect(screen.getByText('Profile Updated')).toBeInTheDocument()
    expect(screen.getByText('Message Sent')).toBeInTheDocument()
  })

  it('renders the activity status badges', () => {
    render(<ActivityTable activities={activities} />)
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('Failed')).toBeInTheDocument()
  })

  it('applies the correct badge styling per status', () => {
    render(<ActivityTable activities={activities} />)

    const completed = screen.getByText('Completed')
    expect(completed).toHaveStyle({ backgroundColor: '#059652' })

    const pending = screen.getByText('Pending')
    expect(pending).toHaveStyle({ backgroundColor: '#ffc107' })

    const failed = screen.getByText('Failed')
    expect(failed).toHaveStyle({ backgroundColor: '#df1529' })
  })

  it('falls back to grey styling for unknown statuses', () => {
    render(
      <ActivityTable
        activities={[
          { activity_type: 'Unknown Event', activity_date: '2026-08-20T10:00:00Z', status: 'Cancelled' },
        ]}
      />
    )
    const badge = screen.getByText('Cancelled')
    expect(badge).toHaveStyle({ backgroundColor: '#9ca3af' })
  })

  it('renders formatted dates', () => {
    render(<ActivityTable activities={activities} />)
    // All three fixture dates render as "Aug 20, 2026" style strings
    expect(screen.getByText(/Aug 20, 2026/)).toBeInTheDocument()
    expect(screen.getByText(/Aug 21, 2026/)).toBeInTheDocument()
    expect(screen.getByText(/Aug 22, 2026/)).toBeInTheDocument()
  })
})
