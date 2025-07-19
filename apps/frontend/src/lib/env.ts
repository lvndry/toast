interface Environment {
  BACKEND_BASE_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

function getRequiredEnvVar(key: keyof Environment): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function getOptionalEnvVar(key: string): string | undefined {
  return process.env[key];
}

export const env: Environment = {
  BACKEND_BASE_URL: getRequiredEnvVar('BACKEND_BASE_URL'),
  NODE_ENV: (process.env.NODE_ENV as Environment['NODE_ENV']) || 'development',
};

// Helper function to check if we're in development
export function isDevelopment(): boolean {
  return env.NODE_ENV === 'development';
}

// Helper function to check if we're in production
export function isProduction(): boolean {
  return env.NODE_ENV === 'production';
}

// Helper function to get backend URL with optional path
export function getBackendUrl(path?: string): string {
  const baseUrl = env.BACKEND_BASE_URL.replace(/\/$/, ''); // Remove trailing slash
  return path ? `${baseUrl}/${path.replace(/^\//, '')}` : baseUrl; // Remove leading slash from path
}
