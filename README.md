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
# Your own profile
ghov

# Another user's profile
ghov octocat
```

### Output

- **Contribution heatmap** — colored grid showing your activity over the past year, auto-sized to fit your terminal width.
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
