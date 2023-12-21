import type { Config } from 'jest';

const config: Config = {
  setupFiles: ['<rootDir>/.jest/setEnvVars.js'],
  verbose: true,
};

export default config;