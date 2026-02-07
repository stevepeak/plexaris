import { type Meta, type StoryObj } from '@storybook/react'

import { SuggestionCard, type SuggestionCardData } from './suggestion-card'

const meta: Meta<typeof SuggestionCard> = {
  title: 'Components / SuggestionCard',
  component: SuggestionCard,
}
export default meta
type Story = StoryObj<typeof SuggestionCard>

const baseSuggestion: SuggestionCardData = {
  id: 'sug-1',
  targetType: 'product',
  targetId: null,
  action: 'create',
  field: null,
  label: 'New product: Acme Hot Sauce 500ml',
  currentValue: null,
  proposedValue: {
    name: 'Acme Hot Sauce 500ml',
    description: 'Premium hot sauce made with habanero peppers',
    price: '4.99',
    unit: 'piece',
    category: 'Sauces',
    data: { articleNumber: 'ACM-001', brand: 'Acme' },
  },
  confidence: 'high',
  source: 'https://acme-foods.com/products/hot-sauce',
  reasoning: 'Extracted from product detail page with clear pricing and specs.',
  triggerRunId: 'run-abc123',
  status: 'pending',
  createdAt: new Date().toISOString(),
}

export const CreateProduct: Story = {
  args: {
    suggestion: baseSuggestion,
  },
}

export const UpdateField: Story = {
  args: {
    suggestion: {
      ...baseSuggestion,
      action: 'update_field',
      targetId: 'prod-123',
      field: 'price',
      label: 'Update price: Acme Hot Sauce 500ml',
      currentValue: '3.99',
      proposedValue: '4.99',
      confidence: 'medium',
      reasoning: 'New price found on updated product listing page.',
    },
  },
}

export const OrganizationUpdate: Story = {
  args: {
    suggestion: {
      ...baseSuggestion,
      targetType: 'organization',
      targetId: 'org-456',
      action: 'update_field',
      field: 'phone',
      label: 'Update phone: +31 6 12345678',
      currentValue: null,
      proposedValue: '+31 6 12345678',
      confidence: 'high',
      reasoning: 'Phone number found on contact page.',
    },
  },
}

export const Accepted: Story = {
  args: {
    suggestion: {
      ...baseSuggestion,
      status: 'accepted',
    },
  },
}

export const Dismissed: Story = {
  args: {
    suggestion: {
      ...baseSuggestion,
      status: 'dismissed',
    },
  },
}

export const LowConfidence: Story = {
  args: {
    suggestion: {
      ...baseSuggestion,
      confidence: 'low',
      reasoning:
        'Price was partially obscured on the page. Value may be inaccurate.',
    },
  },
}
