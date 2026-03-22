import chalk from 'chalk';
import type { ContributionCalendar } from './types.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const BLOCK = '██';
const EMPTY_COLOR = '#161b22';

const LEVEL_COLORS = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];

function colorBlock(hexColor: string): string {
  if (hexColor === '#ebedf0' || hexColor === EMPTY_COLOR) {
    return chalk.hex('#161b22')(BLOCK);
  }
  return chalk.hex(hexColor)(BLOCK);
}

export function renderHeatmap(calendar: ContributionCalendar): string {
  const weeks = calendar.weeks;
  const termWidth = process.stdout.columns || 80;
  const cellWidth = 2; // "██" = 2 chars
  const gap = 1;       // space between cells
  const labelWidth = 5; // "Mon  " left labels
  const maxWeeks = Math.floor((termWidth - labelWidth) / (cellWidth + gap));
  const displayWeeks = weeks.slice(-Math.min(maxWeeks, weeks.length));

  const lines: string[] = [];

  // Month header
  let monthHeader = ' '.repeat(labelWidth);
  let lastMonth = -1;
  for (const week of displayWeeks) {
    const firstDay = week.contributionDays[0];
    const month = new Date(firstDay.date + 'T00:00:00').getMonth();
    if (month !== lastMonth) {
      const label = MONTHS[month];
      monthHeader += label;
      const remaining = (cellWidth + gap) - label.length;
      if (remaining > 0) monthHeader += ' '.repeat(remaining);
      lastMonth = month;
    } else {
      monthHeader += ' '.repeat(cellWidth + gap);
    }
  }
  lines.push(chalk.dim(monthHeader));

  // Day rows (0=Sun through 6=Sat)
  for (let day = 0; day < 7; day++) {
    const label = DAY_LABELS[day].padEnd(labelWidth);
    let row = chalk.dim(label);
    for (const week of displayWeeks) {
      const cell = week.contributionDays.find(d => d.weekday === day);
      if (cell) {
        row += colorBlock(cell.color) + ' ';
      } else {
        row += ' '.repeat(cellWidth + gap);
      }
    }
    lines.push(row);
  }

  // Legend
  lines.push('');
  const legend = LEVEL_COLORS.map(c => chalk.hex(c)(BLOCK)).join(' ');
  lines.push(
    chalk.dim(`  ${calendar.totalContributions.toLocaleString()} contributions in the last year`) +
    '    ' +
    chalk.dim('Less ') + legend + chalk.dim(' More')
  );

  return lines.join('\n');
}
