#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { getToken } from './auth.js';
import { fetchContributionCalendar, fetchRecentEvents } from './api.js';
import { renderHeatmap } from './heatmap.js';
import { generateSummary } from './activity.js';

const program = new Command();

program
  .name('ghov')
  .description('GitHub profile overview in your terminal')
  .version('0.1.0')
  .argument('[username]', 'GitHub username (defaults to authenticated user)')
  .action(async (username?: string) => {
    try {
      const token = getToken();

      const [calendar, events] = await Promise.all([
        fetchContributionCalendar(token, username),
        fetchRecentEvents(token, username),
      ]);

      console.log('');
      console.log(chalk.bold('  Contribution Activity'));
      console.log('');
      console.log(renderHeatmap(calendar));
      console.log('');
      console.log(chalk.bold('  Recent Activity'));
      console.log('');
      console.log(generateSummary(events, calendar));
      console.log('');
    } catch (err) {
      console.error(chalk.red(`Error: ${err instanceof Error ? err.message : err}`));
      process.exit(1);
    }
  });

program.parse();
