import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  workspaces: {
    '.': {
      entry: ['**/*.config.{js,ts}', 'turbo.json'],
      project: ['**/*.{js,ts,tsx}'],
      ignore: ['**/*.config.cjs', '**/*.config.js'],
      ignoreDependencies: [],
    },
    'apps/web': {
      entry: ['app/**/*.{ts,tsx}'],
    },
    'apps/trigger': {
      entry: ['trigger.config.ts'],
      project: ['src/**/*.ts'],
      ignoreDependencies: [
        '@babel/preset-typescript',
        'import-in-the-middle',
        'trigger.dev',
      ],
    },
    'packages/api': {
      project: ['src/**/*.ts'],
    },
    'packages/db': {
      project: ['src/**/*.ts'],
    },
    'packages/utils': {
      project: ['src/**/*.ts'],
    },
    'packages/agents': {
      project: ['src/**/*.ts'],
    },
    'packages/cloudinary': {
      project: ['src/**/*.ts'],
    },
    'packages/resend': {
      project: ['src/**/*.ts'],
    },
    'packages/email': {
      entry: ['emails/*.tsx'],
      ignoreDependencies: [
        'react-dom',
        '@react-email/preview-server',
        '@types/react-dom',
        'esbuild',
      ],
      project: ['src/**/*.{ts,tsx}', 'emails/**/*.tsx'],
    },
  },
  ignore: ['apps/web/components/ui/**', 'apps/web/hooks/**'],
  ignoreDependencies: [],
}

export default config
