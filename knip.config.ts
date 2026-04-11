import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    'components/auth/index.ts',
    'lib/auth/index.ts',
  ],
  project: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
  ],
};

export default config;
