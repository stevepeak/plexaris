import { type Meta, type StoryObj } from '@storybook/react'

import { type ActivityEntry, ActivityLog } from './activity-log'

const SAMPLE_ENTRIES: ActivityEntry[] = [
  {
    id: '1',
    action: 'order_created',
    itemName: '',
    detail: '',
    timestamp: new Date('2025-01-15T10:00:00'),
    user: { name: 'Sarah Chen' },
  },
  {
    id: '2',
    action: 'item_added',
    itemName: 'Organic Oat Milk',
    detail: '5x Organic Oat Milk',
    timestamp: new Date('2025-01-15T10:30:00'),
    user: { name: 'Sarah Chen' },
  },
  {
    id: '3',
    action: 'item_added',
    itemName: 'Almond Butter',
    detail: '2x Almond Butter',
    timestamp: new Date('2025-01-15T11:15:00'),
    user: {
      name: 'Alex Rivera',
      avatarUrl: 'https://i.pravatar.cc/32?u=alex',
    },
  },
  {
    id: '4',
    action: 'item_quantity_changed',
    itemName: 'Organic Oat Milk',
    detail: '5 → 8',
    timestamp: new Date('2025-01-15T11:45:00'),
    user: { name: 'Sarah Chen' },
  },
  {
    id: '5',
    action: 'item_supplier_changed',
    itemName: 'Sourdough Bread',
    detail: 'Changed to Artisan Co',
    timestamp: new Date('2025-01-15T12:00:00'),
    user: { name: 'Jordan Kim' },
  },
  {
    id: '6',
    action: 'item_removed',
    itemName: 'Free Range Eggs',
    detail: 'Removed Free Range Eggs',
    timestamp: new Date('2025-01-15T12:30:00'),
    user: { name: 'Alex Rivera' },
  },
  {
    id: '7',
    action: 'note_updated',
    itemName: '',
    detail: 'Note updated',
    timestamp: new Date('2025-01-15T13:00:00'),
    user: { name: 'Sarah Chen' },
  },
  {
    id: '8',
    action: 'order_submitted',
    itemName: '',
    detail: '',
    timestamp: new Date('2025-01-15T14:00:00'),
    user: { name: 'Sarah Chen' },
  },
  {
    id: '9',
    action: 'order_confirmed',
    itemName: '',
    detail: '',
    timestamp: new Date('2025-01-15T15:00:00'),
    user: { name: 'Jordan Kim' },
  },
]

const meta: Meta<typeof ActivityLog> = {
  title: 'Order / Cart / ActivityLog',
  component: ActivityLog,
}
export default meta
type Story = StoryObj<typeof ActivityLog>

export const Default: Story = {
  render: () => (
    <div className="h-[400px] w-[700px] border">
      <ActivityLog entries={SAMPLE_ENTRIES} />
    </div>
  ),
}

export const Empty: Story = {
  render: () => (
    <div className="h-[400px] w-[700px] border">
      <ActivityLog entries={[]} />
    </div>
  ),
}
