import type { ContributionCalendar, GitHubEvent } from './types.js';

const GRAPHQL_URL = 'https://api.github.com/graphql';
const REST_URL = 'https://api.github.com';

export async function fetchContributionCalendar(token: string, username?: string): Promise<ContributionCalendar> {
  const query = username
    ? `query { user(login: "${username}") { contributionsCollection { contributionCalendar { totalContributions weeks { contributionDays { contributionCount date color weekday } } } } } }`
    : `query { viewer { contributionsCollection { contributionCalendar { totalContributions weeks { contributionDays { contributionCount date color weekday } } } } } }`;

  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    throw new Error(`GitHub GraphQL API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json() as { data?: { viewer?: { contributionsCollection: { contributionCalendar: ContributionCalendar } }; user?: { contributionsCollection: { contributionCalendar: ContributionCalendar } } }; errors?: { message: string }[] };

  if (json.errors) {
    throw new Error(`GraphQL error: ${json.errors[0].message}`);
  }

  const root = username ? json.data?.user : json.data?.viewer;
  if (!root) {
    throw new Error(username ? `User "${username}" not found` : 'Could not fetch authenticated user data');
  }

  return root.contributionsCollection.contributionCalendar;
}

export async function fetchRecentEvents(token: string, username?: string): Promise<GitHubEvent[]> {
  let login = username;

  if (!login) {
    const res = await fetch(`${REST_URL}/user`, {
      headers: { Authorization: `bearer ${token}` },
    });
    if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    const user = await res.json() as { login: string };
    login = user.login;
  }

  const res = await fetch(`${REST_URL}/users/${login}/events?per_page=100`, {
    headers: { Authorization: `bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`GitHub Events API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<GitHubEvent[]>;
}
