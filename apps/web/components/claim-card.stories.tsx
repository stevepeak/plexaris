import { type Meta, type StoryObj } from '@storybook/react'

import { ClaimCard, type ClaimCardState } from './claim-card'

const meta: Meta<typeof ClaimCard> = {
  title: 'Organization / Switcher / ClaimCard',
  component: ClaimCard,
  decorators: [
    (story) => (
      <div className="flex min-h-[600px] items-center justify-center p-4">
        {story()}
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof ClaimCard>

const sampleOrg = {
  id: '1',
  name: 'Bakkerij de Gouden Korst',
  type: 'supplier',
  claimed: false,
  description:
    'Artisan bakery specializing in sourdough breads and traditional Dutch pastries. Supplying fresh baked goods to hotels and restaurants since 1987.',
  logoUrl: null,
  phone: '+31 20 555 1234',
  email: 'info@goudenkorst.nl',
  address: 'Prinsengracht 42, 1015 DK Amsterdam',
}

const previewState: ClaimCardState = {
  status: 'preview',
  data: { organization: sampleOrg, claimEmail: 'info@goudenkorst.nl' },
}

const noop = () => undefined

export const Loading: Story = {
  args: {
    state: { status: 'loading' },
    isAuthenticated: false,
    onClaim: noop,
    onSignUp: noop,
    onGoHome: noop,
    onGoToDashboard: noop,
    signUpHref: '/signup',
    loginHref: '/login',
  },
}

export const PreviewUnauthenticated: Story = {
  args: {
    state: previewState,
    isAuthenticated: false,
    onClaim: noop,
    onSignUp: noop,
    onGoHome: noop,
    onGoToDashboard: noop,
    signUpHref: '/signup?redirect=/claim/abc',
    loginHref: '/login?redirect=/claim/abc',
  },
}

export const PreviewAuthenticated: Story = {
  args: {
    state: previewState,
    isAuthenticated: true,
    onClaim: noop,
    onSignUp: noop,
    onGoHome: noop,
    onGoToDashboard: noop,
    signUpHref: '/signup',
    loginHref: '/login',
  },
}

export const Claiming: Story = {
  args: {
    state: {
      status: 'claiming',
      data: { organization: sampleOrg, claimEmail: 'info@goudenkorst.nl' },
    },
    isAuthenticated: true,
    onClaim: noop,
    onSignUp: noop,
    onGoHome: noop,
    onGoToDashboard: noop,
    signUpHref: '/signup',
    loginHref: '/login',
  },
}

export const Claimed: Story = {
  args: {
    state: { status: 'claimed', orgName: 'Bakkerij de Gouden Korst' },
    isAuthenticated: true,
    onClaim: noop,
    onSignUp: noop,
    onGoHome: noop,
    onGoToDashboard: noop,
    signUpHref: '/signup',
    loginHref: '/login',
  },
}

export const ErrorNotFound: Story = {
  args: {
    state: {
      status: 'error',
      code: 404,
      message: 'Claim token not found or already used',
    },
    isAuthenticated: false,
    onClaim: noop,
    onSignUp: noop,
    onGoHome: noop,
    onGoToDashboard: noop,
    signUpHref: '/signup',
    loginHref: '/login',
  },
}

export const ErrorExpired: Story = {
  args: {
    state: {
      status: 'error',
      code: 410,
      message: 'Claim token has expired',
    },
    isAuthenticated: false,
    onClaim: noop,
    onSignUp: noop,
    onGoHome: noop,
    onGoToDashboard: noop,
    signUpHref: '/signup',
    loginHref: '/login',
  },
}

export const ErrorAlreadyClaimed: Story = {
  args: {
    state: {
      status: 'error',
      code: 409,
      message: 'Organization has already been claimed',
    },
    isAuthenticated: false,
    onClaim: noop,
    onSignUp: noop,
    onGoHome: noop,
    onGoToDashboard: noop,
    signUpHref: '/signup',
    loginHref: '/login',
  },
}

export const MinimalDetails: Story = {
  args: {
    state: {
      status: 'preview',
      data: {
        organization: {
          id: '2',
          name: 'Simple Supplies B.V.',
          type: 'supplier',
          claimed: false,
          description: null,
          logoUrl: null,
          phone: null,
          email: null,
          address: null,
        },
        claimEmail: 'owner@simplesupplies.nl',
      },
    },
    isAuthenticated: true,
    onClaim: noop,
    onSignUp: noop,
    onGoHome: noop,
    onGoToDashboard: noop,
    signUpHref: '/signup',
    loginHref: '/login',
  },
}
