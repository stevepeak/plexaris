import { config } from '@plexaris/eslint-config/bun.js'

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    ignores: ['.next/**', '.storybook/**'],
  },
]
