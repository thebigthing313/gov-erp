//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  // The TanStack config you already have
  ...tanstackConfig,

  // Add the recommended config for react-hooks
  // This enables the two essential rules:
  // 1. 'react-hooks/rules-of-hooks': 'error' (The one you asked for)
  // 2. 'react-hooks/exhaustive-deps': 'warn' (Checks effect dependencies)
  reactHooks.configs.flat.recommended,
]
