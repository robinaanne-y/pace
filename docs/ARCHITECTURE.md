# Pace — Architecture

Pace is a client project tracker for a digital agency. Project managers use it to list client projects, see their status and priority, and create, edit and delete them.

This document describes how the application is put together. The order of work is in [ROADMAP.md](ROADMAP.md).

**Status:** the application is built: the database, model, REST API and API tests, and the Vue screens to list, search, filter, sort, view, create, edit and delete projects. Automated frontend tests are planned.

## Overview

```
┌──────────────────────────────┐
│ Browser                      │
│   Vue 3 single-page app      │
└──────────────┬───────────────┘
               │ HTTP / JSON  (/api/projects)
┌──────────────▼───────────────┐
│ Laravel                      │
│   routes → request → controller → resource
│   Eloquent model             │
└──────────────┬───────────────┘
               │ SQL
┌──────────────▼───────────────┐
│ MySQL                        │
└──────────────────────────────┘
```

Pace is one Laravel application. Laravel serves the REST API under `/api` and serves the Vue app for every other URL. Because the UI and the API share one origin, there is no CORS configuration and one command runs everything.

## Technology

| Layer | Technology | Notes |
| --- | --- | --- |
| Backend | Laravel 13, PHP 8.3 | REST API, validation, persistence |
| Frontend | Vue 3, Vue Router | Built by Vite from `resources/js` |
| Styling | Tailwind CSS v4 | Design tokens and component classes exported from Figma |
| Build | Vite 8 | Bundles CSS, JS and the Inter font |
| Database | MySQL 8 | Tests use in-memory SQLite |
| Tests | PHPUnit 12 | Feature tests for the API |

The code uses Eloquent and has no driver-specific SQL, so the same migrations and queries run on MySQL in development and SQLite in tests.

## Repository layout

```
pace/
├── app/
│   ├── Enums/                    ProjectStatus, ProjectPriority
│   ├── Http/
│   │   ├── Controllers/Api/      ProjectController
│   │   ├── Requests/             ProjectRequest (validation)
│   │   └── Resources/            ProjectResource (JSON shape)
│   └── Models/                   Project
├── database/
│   ├── migrations/               projects table
│   ├── factories/                ProjectFactory
│   └── seeders/                  ProjectSeeder
├── routes/
│   ├── api.php                   REST endpoints
│   └── web.php                   Serves the UI
├── resources/
│   ├── css/                      app.css (tokens, base), components.css
│   ├── js/                       Vue application
│   └── views/                    Blade shell
├── tests/Feature/                API tests
└── docs/                         ROADMAP.md, ARCHITECTURE.md, test_data.json
```

## Data model

One table, `projects`.

| Column | Type | Rules |
| --- | --- | --- |
| `id` | Auto-increment integer | Primary key |
| `client_name` | String (255) | Required |
| `project_name` | String (255) | Required |
| `description` | Text | Optional |
| `status` | String | Required; `planning`, `in_progress`, `on_hold` or `completed` |
| `priority` | String | Required; `low`, `medium` or `high` |
| `start_date` | Date | Optional |
| `due_date` | Date | Optional; not earlier than `start_date` |
| `created_at`, `updated_at` | Timestamp | Set by Laravel |

Status and priority are PHP enums (`App\Enums\ProjectStatus`, `App\Enums\ProjectPriority`). The model casts both columns to their enum, so application code never handles a raw string and an unknown value cannot be saved through the API. The database stores the enum value (`in_progress`); the UI turns it into a label (In Progress).

## REST API

All endpoints are under `/api` and exchange JSON.

| Method | Endpoint | Purpose | Success |
| --- | --- | --- | --- |
| GET | `/api/projects` | List all projects, newest first | 200 |
| GET | `/api/projects/{id}` | Get one project | 200 |
| POST | `/api/projects` | Create a project | 201 |
| PUT | `/api/projects/{id}` | Update a project | 200 |
| DELETE | `/api/projects/{id}` | Delete a project | 204, no body |

The requirements list these endpoints as `/projects`. They live under `/api/projects` so that `/projects` stays available for the UI screens.

### Project representation

A single project is returned inside a `data` object. The list endpoint returns a `data` array of the same objects.

```json
{
    "data": {
        "id": 1,
        "client_name": "Acme Corporation",
        "project_name": "Corporate Website Redesign",
        "description": "Redesign and modernize the company's corporate website.",
        "status": "in_progress",
        "priority": "high",
        "start_date": "2026-06-01",
        "due_date": "2026-07-15",
        "created_at": "2026-10-02T04:16:43.000000Z",
        "updated_at": "2026-10-02T04:16:43.000000Z"
    }
}
```

`POST` and `PUT` accept the same fields, except `id`, `created_at` and `updated_at`.

### Errors

| Situation | Status | Body |
| --- | --- | --- |
| Validation fails | 422 | `message` plus an `errors` object keyed by field |
| Project does not exist | 404 | `{ "message": "Project not found." }` |

```json
{
    "message": "The client name field is required. (and 1 more error)",
    "errors": {
        "client_name": ["The client name field is required."],
        "due_date": ["The due date cannot be earlier than the start date."]
    }
}
```

The `errors` object is keyed by field name so the form can show each message next to its field.

## Backend design

A request passes through four small pieces, each with one job:

1. **Route** (`routes/api.php`) — one `apiResource` line maps the five endpoints to the controller and turns a missing project into the JSON 404.
2. **Form request** (`ProjectRequest`) — validates the input before the controller runs. Create and update have identical rules, so they share one class.
3. **Controller** (`Api\ProjectController`) — reads or writes through the `Project` model using only the validated fields.
4. **Resource** (`ProjectResource`) — defines the JSON shape, so the response format is decided in one place and does not leak database columns by accident.

### Validation

| Field | Rule |
| --- | --- |
| `client_name` | Required, text, at most 255 characters |
| `project_name` | Required, text, at most 255 characters |
| `description` | Optional text |
| `status` | Required, must be a valid status value |
| `priority` | Required, must be a valid priority value |
| `start_date` | Optional, `YYYY-MM-DD` |
| `due_date` | Optional, `YYYY-MM-DD`; when a start date is given, must be on or after it |

The server is the source of truth for validation. The Vue form will repeat the simple checks to give faster feedback, but nothing is saved unless Laravel accepts it.

### Safety

- Only the seven editable fields are mass-assignable on the model, and the controller passes only validated input.
- All queries go through Eloquent, which uses bound parameters.
- `.env` and the local database file are excluded from Git.

## Frontend design

The frontend is a Vue 3 single-page app in `resources/js`, mounted in a Blade view. A catch-all route in `routes/web.php` returns that view, and Vue Router handles navigation in the browser.

### Screens

| Route | Screen | API calls |
| --- | --- | --- |
| `/projects` | Project list with summary cards, search, filters and sorting | `GET /api/projects` |
| `/projects/create` | Create form | `POST /api/projects` |
| `/projects/:id` | Project details, shown as a side panel over the list | `GET /api/projects/{id}` |
| `/projects/:id/edit` | Edit form | `GET` then `PUT /api/projects/{id}` |

Delete is a confirmation modal opened from a list row or from the details panel; it calls `DELETE /api/projects/{id}` and removes the row in place.

The details panel is a child route of the list. The list stays mounted underneath it, so opening and closing a project keeps the scroll position, search and filters, while the URL still identifies the project and the browser's Back button closes the panel.

### Structure

```
resources/js/
├── app.js             Creates the Vue app
├── App.vue            Root component
├── router.js          Route table
├── api/client.js      Shared request helper; converts HTTP errors into a common shape
├── api/projects.js    One function per endpoint
├── constants.js       Status and priority values with their labels
├── format.js          Date formatting
├── projectFilters.js  Search, filter and sort logic for the project list
├── composables/       useToast (show a notification from any page), useProject (load one project)
├── pages/             ProjectList, ProjectCreate, ProjectEdit, ProjectDetails, NotFound
└── components/        AppLayout, AppSidebar, AppToast, AppIcon, PageHeader,
                       BaseButton, BaseInput, BaseSelect, BaseModal, BaseDrawer,
                       StatusBadge, PriorityBadge, ProjectForm, ProjectSummary,
                       ProjectTable, ProjectListSkeleton, ProjectLoadError,
                       DeleteProjectModal, ProjectToolbar, FilterDropdown
```

Components prefixed `Base` are generic building blocks; those prefixed `App` exist once in the layout.

### Design decisions

- **One form component.** `ProjectForm` is used by both the create and edit screens, so field layout and validation exist once.
- **One API module.** Components never call `fetch` directly. `api/projects.js` is the only place that knows URLs and error formats.
- **No state library.** Each page loads what it needs. The application has one resource and four screens, so a shared store would add code without solving a problem.
- **Search, filtering and sorting in the browser.** The list endpoint returns every project, so the list screen filters and sorts that array. This keeps the API to the five required endpoints. If the number of projects grew large, these would move to query parameters on `GET /api/projects` with pagination.
- **Every state is visible.** Each screen has loading, empty and error states, and every create, update and delete shows a success or failure toast.

### Styling

Styles come from the Figma export, organised for Tailwind v4:

- `resources/css/app.css` — design tokens (colours, radii, shadow, spacing) and base element styles.
- `resources/css/components.css` — component classes such as `.button`, `.badge`, `.field`, `.toast`.

Component classes sit in Tailwind's `components` layer, so a utility class on an element can still override them. Badge and icon classes use hyphens (`in-progress`, `on-hold`) while API values use underscores, so the badge components convert between the two.

## Testing

| Layer | Tool | Coverage |
| --- | --- | --- |
| API | PHPUnit feature tests | Every endpoint's success case, 404s, and every validation rule |
| Frontend | Vitest (if time permits) | List rendering, form validation, create, edit, delete confirmation |
| Manual | Browser | The end-to-end checklist in ROADMAP Phase 17 |

API tests send real HTTP requests through the framework against an in-memory SQLite database, and assert the response, the status code and the stored data. Run them with:

```
php artisan test
```

## Out of scope

These are optional in the requirements and are not planned for the MVP: authentication, Docker setup and deployment. With no authentication, every endpoint is public; adding it later means protecting the `/api` routes and adding a sign-in screen, without changing the structure above.
