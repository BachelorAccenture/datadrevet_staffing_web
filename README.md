# DataDrivenStaffing — Frontend

A consultant management and staffing tool built for Accenture. Search, filter, and manage consultants by skills, availability, project history, and more.

Built with **React 19**, **TypeScript**, and **Vite 7**, connecting to a **Spring Boot + Neo4j** backend.

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20.19.0
- **Backend** running at `http://localhost:8080` (Spring Boot + Neo4j)

### Install & Run

```bash
npm install
npm run dev
```

The app starts at `http://localhost:5173` by default.

### Available Scripts

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start Vite dev server              |
| `npm run build`   | Type-check with `tsc` & build      |
| `npm run preview` | Preview the production build       |
| `npm run lint`    | Run ESLint across the project      |

---

## Project Structure

```
src/
├── assets/              # Images & fonts (Graphik typeface, icons)
├── components/
│   ├── addConsultant/   # Create new consultant form
│   ├── consultantPage/  # Consultant list with search
│   ├── editConsultant/  # Edit/delete consultant, manage skills & projects
│   ├── multiSelectDropdown/  # Reusable multi-select with search
│   ├── resultList/      # Search result cards with expand/collapse
│   ├── searchPage/      # Main staffing search with filters
│   └── sidebar/         # Navigation sidebar
├── data/
│   ├── api.ts           # All API calls & TypeScript interfaces
│   └── mockData.ts      # Legacy mock data (unused, kept for reference)
├── types/
│   └── consultant.ts    # Legacy type definitions (superseded by api.ts)
├── App.tsx              # Root component with routing
├── main.tsx             # Entry point
└── global.css           # Global styles & Graphik font-face declarations
```

---

## Features

**Consultant Search** — Filter by skills, roles, companies, availability, remote preference, and start date. Results are ranked by a weighted relevance scoring system on the backend (Neo4j Cypher).

**Consultant Management** — Full CRUD for consultants including skill and project assignment with an optimistic local-state workflow (changes are queued locally, then committed on save).

**Project Assignments** — Assign existing or new projects to consultants with role, allocation %, active/inactive status, and date ranges. Supports deactivation (preserves history) and full removal.

**Skill Management** — Add existing skills or create new ones (with synonyms) directly from the consultant edit/add forms.

---

## API Integration

All API calls live in `src/data/api.ts` and target `http://localhost:8080/api/v1`. Key endpoints:

| Method   | Endpoint                                             | Purpose                          |
| -------- | ---------------------------------------------------- | -------------------------------- |
| `GET`    | `/consultants`                                       | List all consultants             |
| `GET`    | `/consultants/search?...`                            | Search with filters & scoring    |
| `POST`   | `/consultants`                                       | Create consultant                |
| `PUT`    | `/consultants/:id`                                   | Update consultant                |
| `DELETE` | `/consultants/:id`                                   | Delete consultant                |
| `POST`   | `/consultants/:id/skills`                            | Add skill to consultant          |
| `POST`   | `/consultants/:id/projects`                          | Assign project to consultant     |
| `PATCH`  | `/consultants/:id/projects/:pid/deactivate`          | Deactivate assignment            |
| `DELETE` | `/consultants/:id/projects/:pid`                     | Remove assignment                |
| `GET`    | `/skills`                                            | List all skills                  |
| `POST`   | `/skills`                                            | Create skill                     |
| `GET`    | `/companies`                                         | List all companies               |
| `GET`    | `/projects`                                          | List all projects                |
| `POST`   | `/projects`                                          | Create project                   |

---

## Code Quality

The project uses **Qodana** for continuous code quality monitoring. Configuration files:

- `qodana.yaml` — Local Qodana profile
- `qodana-global-configurations.yaml` — Cloud configuration
- `.github/workflows/qodana_code_quality.yml` — CI scan on push/PR

---

## Tech Stack

- **React 19** with React Compiler (`babel-plugin-react-compiler`)
- **TypeScript 5.9**
- **Vite 7** (dev server & bundler)
- **React Router 7** (client-side routing)
- **ESLint 9** with `typescript-eslint` & React Hooks plugin