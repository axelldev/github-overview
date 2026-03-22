import type { ContributionCalendar, GitHubEvent } from './types.js';

function describeEvent(event: GitHubEvent): string {
  const repo = event.repo.name;
  const payload = event.payload;

  switch (event.type) {
    case 'PushEvent': {
      const count = (payload.commits as unknown[])?.length ?? 0;
      return `Pushed ${count} commit${count !== 1 ? 's' : ''} to ${repo}`;
    }
    case 'PullRequestEvent': {
      const action = payload.action as string;
      const number = (payload.pull_request as { number: number })?.number;
      return `${capitalize(action)} PR #${number} in ${repo}`;
    }
    case 'IssuesEvent': {
      const action = payload.action as string;
      const number = (payload.issue as { number: number })?.number;
      return `${capitalize(action)} issue #${number} in ${repo}`;
    }
    case 'IssueCommentEvent':
      return `Commented on an issue in ${repo}`;
    case 'CreateEvent': {
      const refType = payload.ref_type as string;
      const ref = payload.ref as string | null;
      return ref ? `Created ${refType} "${ref}" in ${repo}` : `Created ${refType} in ${repo}`;
    }
    case 'DeleteEvent': {
      const refType = payload.ref_type as string;
      const ref = payload.ref as string;
      return `Deleted ${refType} "${ref}" in ${repo}`;
    }
    case 'WatchEvent':
      return `Starred ${repo}`;
    case 'ForkEvent':
      return `Forked ${repo}`;
    case 'ReleaseEvent': {
      const action = payload.action as string;
      const tag = (payload.release as { tag_name: string })?.tag_name;
      return `${capitalize(action)} release ${tag} in ${repo}`;
    }
    case 'PullRequestReviewEvent':
      return `Reviewed a PR in ${repo}`;
    default:
      return `${event.type.replace('Event', '')} in ${repo}`;
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function generateSummary(events: GitHubEvent[], calendar: ContributionCalendar): string {
  if (events.length === 0) {
    return `  This user made ${calendar.totalContributions.toLocaleString()} contributions in the last year.\n\n  No recent public activity found.`;
  }

  const repoCount = new Map<string, number>();
  const typeCount = new Map<string, number>();

  for (const event of events) {
    repoCount.set(event.repo.name, (repoCount.get(event.repo.name) || 0) + 1);
    typeCount.set(event.type, (typeCount.get(event.type) || 0) + 1);
  }

  // Paragraph 1: Overall stats
  const pushes = typeCount.get('PushEvent') || 0;
  const prs = typeCount.get('PullRequestEvent') || 0;
  const issues = typeCount.get('IssuesEvent') || 0;
  const reviews = typeCount.get('PullRequestReviewEvent') || 0;

  const statParts: string[] = [];
  if (pushes) statParts.push(`${pushes} push${pushes !== 1 ? 'es' : ''}`);
  if (prs) statParts.push(`${prs} pull request action${prs !== 1 ? 's' : ''}`);
  if (issues) statParts.push(`${issues} issue interaction${issues !== 1 ? 's' : ''}`);
  if (reviews) statParts.push(`${reviews} code review${reviews !== 1 ? 's' : ''}`);

  const p1 = `  ${calendar.totalContributions.toLocaleString()} contributions in the last year. Recent activity includes ${statParts.length > 0 ? statParts.join(', ') : `${events.length} events`} across ${repoCount.size} repositor${repoCount.size !== 1 ? 'ies' : 'y'}.`;

  // Paragraph 2: Top repos
  const topRepos = [...repoCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const repoList = topRepos.map(([repo, count]) => `${repo} (${count} events)`).join(', ');
  const p2 = `  Most active in ${repoList}.`;

  // Paragraph 3: Recent actions
  const recentActions = events.slice(0, 5).map(describeEvent);
  const p3 = `  Latest: ${recentActions.join('. ')}.`;

  return [p1, p2, p3].join('\n\n');
}
