### Project Description
A frontend roulette web application showcasing modern React development, interactive data visualization, and possibly realtime LLM generated commentary.
The project serves as a portfolio piece to demonstrate skills in frontend engineering, data analysis, and applied AI concepts, hosted as a static site on GitHub Pages.

---

### Planned Features
- Standard roulette table (European and American styles)
- Spin logs and charts (result analysis, win/loss tracking, streaks)
- Probability calculator (show odds of different bets)
- Mass user‑rule betting (simulate strategies like Martingale, Fibonacci, etc.)
- Mobile‑friendly responsive design
- Dark/light mode toggle
- Custom/fun tables (customizable wheel, variants like 1/3 tiles as zero)
- Custom themes/skins for table and wheel
- Export data (CSV/JSON for deeper analysis)
- AI dealer commentary (realtime LLM commentary on playstyle, win/loss)

---

### Tech Stack
- **Frontend**: React + TypeScript, bundled with Vite, developed with Bun
- **Visualization**: Chart.js for spin logs and probability charts
- **LLM API call**: do external API calls for realtime llm generated commentary
- **Hosting**: GitHub Pages (static build from Vite)
- **Tooling**: ESLint + Prettier for linting/formatting, optional gh‑pages package for deployment

---

### Folder Structure

project-root/
  frontend/
    public/              # Static assets (favicon, manifest)
    src/
      components/        # Reusable UI pieces (roulette wheel, betting panel, charts)
      pages/             # Page-level components (home, dashboard)
      assets/            # Images, styles
      utils/             # Probability calculators, strategy simulators
    dist/                # Built static files (deployed to GitHub Pages)
  docs/                  # Documentation
  tests/                 # Unit tests (frontend only)
  vite.config.ts         # Vite config (with base path for GitHub Pages)
  eslint.config.js       # ESLint rules
  tsconfig.json          # TypeScript config
  package.json           # Dependencies and scripts
  bun.lockb              # Bun lockfile
