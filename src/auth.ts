import { execSync } from 'node:child_process';

export function getToken(): string {
  // Prefer gh CLI token (more reliable), then fall back to env var
  try {
    const token = execSync('gh auth token', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'], env: { ...process.env, GITHUB_TOKEN: '' } }).trim();
    if (token) return token;
  } catch {
    // gh not installed or not authenticated
  }

  const envToken = process.env.GITHUB_TOKEN;
  if (envToken) return envToken;

  console.error('Error: No GitHub token found.');
  console.error('Set GITHUB_TOKEN env var or authenticate with: gh auth login');
  process.exit(1);
}
