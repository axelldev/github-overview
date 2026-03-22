#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { getToken } from './auth.js';
import { fetchContributionCalendar, fetchRecentEvents } from './api.js';
import { renderHeatmap } from './heatmap.js';
import { generateSummary } from './activity.js';
import { filterByPeriod, type Period, periodLabel } from './period.js';

const VALID_PERIODS: Period[] = ['week', 'month', '3m', '6m', 'year'];

const program = new Command();

program
  .name('ghov')
  .description('GitHub profile overview in your terminal')
  .version('0.1.0')
  .argument('[username]', 'GitHub username (defaults to authenticated user)')
  .option('-p, --period <period>', `time period: ${VALID_PERIODS.join(', ')}`, 'month')
  .action(async (username: string | undefined, opts: { period: string }) => {
    try {
      if (!VALID_PERIODS.includes(opts.period as Period)) {
        console.error(chalk.red(`Invalid period "${opts.period}". Use: ${VALID_PERIODS.join(', ')}`));
        process.exit(1);
      }

      const period = opts.period as Period;
      const token = getToken();

      const [calendar, events] = await Promise.all([
        fetchContributionCalendar(token, username),
        fetchRecentEvents(token, username),
      ]);

      const { calendar: filtered, events: filteredEvents } = filterByPeriod(calendar, events, period);

      console.log('');
      console.log(chalk.bold('  Contribution Activity'));
      console.log('');
      const label = periodLabel(period);
      console.log(renderHeatmap(filtered, label));
      console.log('');
      console.log(chalk.bold('  Recent Activity'));
      console.log('');
      console.log(generateSummary(filteredEvents, filtered, label));
      console.log('');
    } catch (err) {
      console.error(chalk.red(`Error: ${err instanceof Error ? err.message : err}`));
      process.exit(1);
    }
  });

program.parse();
