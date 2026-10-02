# Pace — Development Roadmap

Pace is a client project tracker for a digital agency. This roadmap lists the work in the order it should be done. Checked items are already in the repository.

See [ARCHITECTURE.md](ARCHITECTURE.md) for how the pieces fit together.

## Stack

| Layer | Choice |
| --- | --- |
| Backend | Laravel 13 (PHP 8.3) |
| Frontend | Vue 3, built by Vite inside the Laravel app |
| Styling | Tailwind CSS v4 plus the component classes exported from Figma |
| Database | MySQL |
| API | REST, JSON |
| Authentication | Optional, not planned for the MVP |
| Testing | PHPUnit for the API; Vue tests if time permits |

---

## Phase 0 — Project Planning

### 0.1 Define the MVP

Core functionality:

- [ ] List projects
- [ ] View project
- [ ] Create project
- [ ] Edit project
- [ ] Delete project
- [ ] Form validation
- [x] API validation and error responses

Project fields:

| Field | Notes |
| --- | --- |
| `id` | |
| `client_name` | Required |
| `project_name` | Required |
| `description` | Optional |
| `status` | Required, one of the status values below |
| `priority` | Required, one of the priority values below |
| `start_date` | Optional, `YYYY-MM-DD` |
| `due_date` | Optional, `YYYY-MM-DD`, not earlier than `start_date` |
| `created_at` | |
| `updated_at` | |

### 0.2 Define enums

The API sends and accepts the value; the UI shows the label.

| Status label | API value |
| --- | --- |
| Planning | `planning` |
| In Progress | `in_progress` |
| On Hold | `on_hold` |
| Completed | `completed` |

| Priority label | API value |
| --- | --- |
| Low | `low` |
| Medium | `medium` |
| High | `high` |

### 0.3 Architecture

Keep the architecture simple:

```
Vue 3
   │
   │ HTTP / JSON
   ▼
Laravel REST API
   │
   ▼
MySQL
```

**Deliverable:** README and project architecture notes.

- [x] [ARCHITECTURE.md](ARCHITECTURE.md)
- [ ] README (see Phase 16)

---

## Phase 1 — Project Setup

### Backend

- [x] Create Laravel project
- [x] Configure `.env`
- [x] Configure MySQL (database `pace`)
- [x] Configure API routing (`routes/api.php`, prefix `/api`)
- [x] Set up database connection
- CORS is not needed: Vue is served by Laravel, so the UI and the API share one origin.

### Frontend

- [x] Add Vue 3 and Vue Router to the Vite build
- [x] Configure API base URL (`VITE_API_BASE_URL`, default `/api`)
- [x] Set up Vue Router
- [x] Create application layout
- [x] Set up global styles and design tokens (`resources/css`)

### Structure

One Laravel application with the Vue code in `resources/js`:

```
pace/
├── app/              Laravel backend
├── routes/
│   ├── api.php       REST API
│   └── web.php       Serves the Vue app
├── resources/
│   ├── css/          Design tokens and component styles
│   ├── js/           Vue application
│   └── views/        Blade shell that mounts Vue
├── tests/
└── docs/
```

**Deliverable:** The application runs locally.

---

## Phase 2 — Database & Project Model

Create the `projects` table with the fields listed in Phase 0.1.

- [x] Create migration
- [x] Create `Project` model
- [x] Configure fillable attributes
- [x] Add status and priority enums
- [x] Run migrations
- [x] Create factory
- [x] Create seeder
- [x] Seed the realistic data in [test_data.json](test_data.json) (`php artisan db:seed`)

**Deliverable:** Database can be populated with realistic projects.

---

## Phase 3 — REST API

Implement the required endpoints.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/projects` | Return all projects |
| GET | `/api/projects/{id}` | Return one project |
| POST | `/api/projects` | Create a project |
| PUT | `/api/projects/{id}` | Update a project |
| DELETE | `/api/projects/{id}` | Delete a project |

- [x] All five endpoints implemented

---

## Phase 4 — API Validation

Validation is an important part of the assessment, so it is not an afterthought.

Create and update share the same rules, so one request class (`ProjectRequest`) covers both.

- [x] Client name is required
- [x] Project name is required
- [x] Status must be one of the status values
- [x] Priority must be one of the priority values
- [x] `due_date >= start_date`
- [x] Meaningful JSON errors

Example error response (HTTP 422):

```json
{
    "message": "The due date cannot be earlier than the start date.",
    "errors": {
        "due_date": [
            "The due date cannot be earlier than the start date."
        ]
    }
}
```

**Deliverable:** API properly handles both valid and invalid requests.

---

## Phase 5 — API Testing

Test the API independently before building the frontend on top of it.

Use PHPUnit feature tests (`php artisan test`), and Postman for manual checks.

- [x] Get all projects
- [x] Get existing project
- [x] Get nonexistent project
- [x] Create valid project
- [x] Create without client name
- [x] Create without project name
- [x] Invalid status
- [x] Invalid priority
- [x] Invalid date range
- [x] Update project
- [x] Delete project

---

## Phase 6 — Vue Application Shell

Build the visual foundation from the Figma design.

### Components

- [x] AppLayout
- [x] Sidebar (`AppSidebar`)
- [x] PageHeader
- [x] Button (`BaseButton`)
- [x] Input (`BaseInput`, also renders the textarea)
- [x] Select (`BaseSelect`)
- [x] Modal (`BaseModal`)
- [x] Toast (`AppToast` with the `useToast` composable)
- [x] StatusBadge
- [x] PriorityBadge

### Routes

| Route | Screen |
| --- | --- |
| `/projects` | Project list |
| `/projects/create` | Create project |
| `/projects/:id` | Project details |
| `/projects/:id/edit` | Edit project |

**Deliverable:** Navigation and application shell are working.

---

## Phase 7 — Project List

Build the primary screen.

- [ ] Fetch projects from API
- [ ] Display projects
- [ ] Display status
- [ ] Display priority
- [ ] Display dates
- [ ] Loading state
- [ ] Empty state
- [ ] Error state

Layout:

```
Projects
Manage and monitor all client projects.            + New Project

[ Search ] [Status] [Priority] [Sort]

------------------------------------------------------
Project       Client       Status     Priority   Due
------------------------------------------------------
Website       Acme         Progress   High       Oct 30
Mobile App    Bright       Planning   Medium     Nov 20
```

Get this screen working before adding bonus features.

---

## Phase 8 — Create Project

Build `/projects/create`.

- [ ] Create reusable `ProjectForm`
- [ ] Client name
- [ ] Project name
- [ ] Description
- [ ] Status
- [ ] Priority
- [ ] Start date
- [ ] Due date
- [ ] Client-side validation
- [ ] Submit to API
- [ ] Handle API validation errors
- [ ] Success notification
- [ ] Redirect to project list

---

## Phase 9 — Edit Project

Build `/projects/:id/edit`.

- [ ] Fetch project
- [ ] Populate form
- [ ] Reuse `ProjectForm`
- [ ] Update project
- [ ] Handle validation
- [ ] Success notification
- [ ] Redirect to project details or list

One form component serves both screens. Avoid creating two nearly identical forms.

```
ProjectForm.vue
       │
       ├── Create
       │
       └── Edit
```

---

## Phase 10 — Project Details

Build `/projects/:id`.

- [ ] Show all project fields
- [ ] Edit Project action
- [ ] Delete action

Layout:

```
Website Redesign
Acme Corporation

Status          Priority
● In Progress   ● High

Start Date      Due Date
Oct 02, 2026    Oct 30, 2026

Description
...
```

---

## Phase 11 — Delete

- [ ] Confirmation modal
- [ ] Call `DELETE /api/projects/{id}`
- [ ] Success toast
- [ ] Refresh the list or redirect

```
Delete
   ↓
Confirmation Modal
   ↓
DELETE /api/projects/{id}
   ↓
Success Toast
   ↓
Refresh / redirect
```

Do not delete immediately when the user clicks Delete.

---

## Phase 12 — Bonus Features

Only start this phase when the core CRUD workflow is stable. Implement in this order:

- [ ] **12.1 Search** — client name, project name, description
- [ ] **12.2 Status filter** — All, Planning, In Progress, On Hold, Completed
- [ ] **12.3 Priority filter** — All, Low, Medium, High
- [ ] **12.4 Sorting** — due date, start date, project name, priority

These features fit into the project list and do not require an architectural change.

---

## Phase 13 — Quality & UX

Before considering the project finished, go through every UI state.

| State | What the user sees |
| --- | --- |
| Loading | Skeleton rows, or "Loading projects..." |
| Empty | "No projects yet" with a New Project action |
| Load error | "Unable to load projects." with a Try Again action |
| Form error | "Client name is required." next to the field |
| Create success | "Project created successfully." |
| Update success | "Project updated successfully." |
| Delete success | "Project deleted successfully." |
| Network failure | A visible error; the application never fails silently |

---

## Phase 14 — Testing

### Backend

- [x] index
- [x] show
- [x] store
- [x] update
- [x] destroy
- [x] Required client name
- [x] Required project name
- [x] Valid status
- [x] Valid priority
- [x] Valid date range

### Frontend

If time permits:

- [ ] Project list rendering
- [ ] Form validation
- [ ] Create submission
- [ ] Edit submission
- [ ] Delete confirmation

---

## Phase 15 — Security & Code Quality

Final review:

- [ ] Mass assignment protection
- [ ] Server-side validation
- [ ] Proper HTTP status codes
- [ ] Consistent API responses
- [ ] No sensitive information in Git
- [ ] `.env` excluded
- [ ] Proper error handling
- [ ] SQL injection protection through Eloquent / the query builder
- [ ] No unnecessary dependencies
- [ ] No duplicated form logic

The backend must not trust frontend validation. Vue validation improves the experience, but Laravel remains the source of truth.

---

## Phase 16 — Documentation

Replace the default Laravel README with:

- [ ] Short project description
- [ ] Tech stack — Laravel, Vue, MySQL
- [ ] Features — project CRUD, validation, search, filtering, sorting
- [ ] Requirements — PHP, Composer, Node.js, MySQL
- [ ] Installation — backend, frontend and database setup
- [ ] Environment — `.env` configuration
- [ ] Running the application
- [ ] API endpoints (the table in Phase 3)
- [ ] Testing — how to run the tests

---

## Phase 17 — Final Assessment Checklist

Before submitting, manually test each scenario.

- [ ] **Create** — Open Pace → Projects → New Project → fill the form → Create → the project appears in the list
- [ ] **Validation** — New Project → submit the empty form → validation errors appear. Also test: missing client, missing project name, invalid status, invalid priority, due date before start date
- [ ] **Edit** — open a project → Edit → change the status → Save → the updated value appears
- [ ] **Delete** — open a project → Delete → confirm → the project disappears
- [ ] **Search** — search "Acme" → only matching projects appear
- [ ] **Filter** — Status → In Progress → only In Progress projects appear
- [ ] **Sort** — sort by due date → projects appear in due-date order
