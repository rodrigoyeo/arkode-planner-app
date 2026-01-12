# Arkode Planner

A project planning tool for Arkode's Odoo implementation projects. Generates structured project plans with task breakdowns for Clarity, Implementation, and Adoption phases, ready to export as CSV for Odoo import.

## Features

- **Template Selection**: Pre-built project templates (Standard, Quick, Custom)
- **Phase Configuration**: Clarity, Implementation, and Adoption phases with hour allocation
- **Module Selection**: CRM, Sales, Purchase, Inventory, Manufacturing, Projects, HR, Accounting
- **Role-Based Assignment**: Tasks auto-assigned based on team member roles
- **CSV Export**: Generates Odoo-compatible CSV files (Tasks, Milestones, Project)
- **Bilingual Support**: English and Spanish

## Quick Start

```bash
# Install dependencies
npm install

# Development server (http://localhost:8000)
npm run dev

# Production build
npm run build
```

## Project Structure

```
odoo-planner-app/
├── src/
│   ├── App.jsx                    # Main application
│   ├── main.jsx                   # React entry point
│   ├── index.css                  # Tailwind + custom styles
│   ├── components/
│   │   ├── welcome/               # Welcome screen
│   │   ├── questionnaire/         # Wizard components
│   │   └── plan/                  # Plan display & export
│   ├── data/
│   │   ├── questionnaire-structure.json
│   │   ├── project-templates.json
│   │   ├── deliverable-groups.json
│   │   └── task-library.json
│   ├── hooks/
│   │   ├── useQuestionnaire.js    # Questionnaire state
│   │   └── useProjectPlan.js      # Plan generation state
│   ├── services/
│   │   ├── planGenerator.js       # Plan generation logic
│   │   ├── csvExporter.js         # CSV export
│   │   └── taskConsolidator.js    # Task consolidation
│   └── utils/
│       └── dateHelpers.js         # Date utilities
├── railway.toml                   # Railway deployment config
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Deployment

### Railway

The app is configured for Railway deployment:

1. Push to GitHub
2. Connect repo to Railway
3. Railway auto-detects and deploys

### Manual Build

```bash
npm run build    # Creates dist/
npm run start    # Serves dist/ on $PORT
```

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Lucide React (icons)
- PapaParse (CSV generation)

## License

Internal tool for Arkode use only.

---

**Version**: 3.5.0
**Odoo Version**: 19.0
