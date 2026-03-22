import type { ContributionCalendar, ContributionWeek, GitHubEvent } from './types.js';

export type Period = 'week' | 'month' | '3m' | '6m' | 'year';

function getCutoffDate(period: Period): Date {
  const now = new Date();
  switch (period) {
    case 'week':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    case 'month':
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case '3m':
      return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    case '6m':
      return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    case 'year':
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  }
}

function filterWeeks(weeks: ContributionWeek[], cutoff: Date): ContributionWeek[] {
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return weeks.filter(week => {
    const lastDay = week.contributionDays[week.contributionDays.length - 1];
    return lastDay && lastDay.date >= cutoffStr;
  });
}

function countContributions(weeks: ContributionWeek[], cutoff: Date): number {
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  let total = 0;
  for (const week of weeks) {
    for (const day of week.contributionDays) {
      if (day.date >= cutoffStr) {
        total += day.contributionCount;
      }
    }
  }
  return total;
}

function filterEvents(events: GitHubEvent[], cutoff: Date): GitHubEvent[] {
  return events.filter(e => new Date(e.created_at) >= cutoff);
}

export function periodLabel(period: Period): string {
  switch (period) {
    case 'week': return 'in the last week';
    case 'month': return 'in the last month';
    case '3m': return 'in the last 3 months';
    case '6m': return 'in the last 6 months';
    case 'year': return 'in the last year';
  }
}

export function filterByPeriod(
  calendar: ContributionCalendar,
  events: GitHubEvent[],
  period: Period,
): { calendar: ContributionCalendar; events: GitHubEvent[] } {
  const cutoff = getCutoffDate(period);
  const weeks = filterWeeks(calendar.weeks, cutoff);
  const totalContributions = countContributions(weeks, cutoff);

  return {
    calendar: { totalContributions, weeks },
    events: filterEvents(events, cutoff),
  };
}
