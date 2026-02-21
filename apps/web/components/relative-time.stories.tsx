import { type Meta, type StoryObj } from '@storybook/react'

import { RelativeTime } from './relative-time'

const meta: Meta<typeof RelativeTime> = {
  title: 'Components/RelativeTime',
  component: RelativeTime,
}

export default meta

type Story = StoryObj<typeof RelativeTime>

export const JustNow: Story = {
  args: {
    date: new Date(),
  },
}

export const MinutesAgo: Story = {
  args: {
    date: new Date(Date.now() - 5 * 60 * 1000),
  },
}

export const HoursAgo: Story = {
  args: {
    date: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
}

export const DaysAgo: Story = {
  args: {
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
}

export const WeeksAgo: Story = {
  args: {
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
}

export const MonthsAgo: Story = {
  args: {
    date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
  },
}

export const StringDate: Story = {
  args: {
    date: '2025-01-15T10:30:00Z',
  },
}
