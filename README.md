# ghov

GitHub profile overview in your terminal. Displays a contribution heatmap and recent activity summary.

## Installation

Requires **Node.js 18+** and authentication with GitHub.

```bash
git clone https://github.com/axelldev/git-overview.git
cd git-overview
npm install
npm run build
npm link
```

## Authentication

`ghov` needs a GitHub token to fetch your data. It tries these in order:

1. **GitHub CLI** — if you have [gh](https://cli.github.com/) installed and authenticated (`gh auth login`), it works automatically.
2. **Environment variable** — set `GITHUB_TOKEN` with a personal access token that has the `read:user` scope.

## Usage

```bash
# Your own profile (shows last month by default)
ghov

# Another user's profile
ghov octocat

# Choose a time period
ghov -p week      # last week
ghov -p month     # last month (default)
ghov -p 3m        # last 3 months
ghov -p 6m        # last 6 months
ghov -p year      # last year
```

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `-p, --period <period>` | Time period: `week`, `month`, `3m`, `6m`, `year` | `month` |

### Output

- **Contribution heatmap** — colored grid of your activity, auto-sized to fit your terminal width.
- **Activity summary** — 3 paragraphs covering overall stats, most active repos, and latest actions.

## Development

```bash
npm run dev    # watch mode — recompiles on changes
npm start      # run without global link
```

## Uninstall

```bash
npm unlink -g ghov
```
