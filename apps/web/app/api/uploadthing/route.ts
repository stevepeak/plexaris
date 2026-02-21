import { getConfig } from '@app/config'
import { createRouteHandler } from '@app/uploadthing'
import { type NextRequest } from 'next/server'

import { uploadRouter } from './core'

function getHandlers() {
  const config = getConfig()
  return createRouteHandler({
    router: uploadRouter,
    config: { token: config.UPLOADTHING_TOKEN, logLevel: 'Debug' },
  })
}

export function GET(req: NextRequest) {
  return getHandlers().GET(req)
}

export function POST(req: NextRequest) {
  return getHandlers().POST(req)
}
