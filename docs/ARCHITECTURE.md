# ExamMaster Architecture

This document describes the technical architecture of the ExamMaster application.

## Table of Contents

-   [Overview](#overview)
-   [Technology Stack](#technology-stack)
-   [Directory Structure](#directory-structure)
-   [Frontend Architecture](#frontend-architecture)
-   [Backend Architecture](#backend-architecture)
-   [Database Schema](#database-schema)
-   [Authentication Flow](#authentication-flow)
-   [Data Flow](#data-flow)

---

## Overview

ExamMaster is a full-stack web application built with Laravel 12 (backend) and React with TypeScript (frontend), using Inertia.js for seamless SPA-like navigation without building a separate API.

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                    (React + TypeScript)                     │
└─────────────────────────┬───────────────────────────────────┘
                          │ Inertia.js
┌─────────────────────────▼───────────────────────────────────┐
│                    Laravel Backend                          │
│              (Controllers, Services, Models)                │
└─────────────────────────┬───────────────────────────────────┘
                          │ Eloquent ORM
┌─────────────────────────▼───────────────────────────────────┐
│                        MySQL                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend

| Technology        | Version | Purpose           |
| ----------------- | ------- | ----------------- |
| React             | 18      | UI library        |
| TypeScript        | 5.x     | Type safety       |
| Inertia.js        | 2       | SPA adapter       |
| Tailwind CSS      | 4       | Styling           |
| shadcn/ui         | Latest  | UI components     |
| Laravel Wayfinder | 0.1     | Type-safe routing |

### Backend

| Technology      | Version | Purpose         |
| --------------- | ------- | --------------- |
| Laravel         | 12      | PHP framework   |
| PHP             | 8.2+    | Server language |
| MySQL           | 8.0+    | Database        |
| Laravel Sanctum | 4       | Authentication  |

### Development Tools

| Tool         | Purpose         |
| ------------ | --------------- |
| Vite         | Asset bundling  |
| Pest         | Testing         |
| Laravel Pint | Code formatting |
| TypeScript   | Type checking   |

---

## Directory Structure

```
exam-master/
├── app/
│   ├── Http/
│   │   ├── Controllers/       # HTTP controllers
│   │   ├── Middleware/        # Custom middleware
│   │   └── Requests/          # Form request validation
│   ├── Models/                # Eloquent models
│   ├── Providers/             # Service providers
│   └── Services/              # Business logic services
│
├── bootstrap/
│   ├── app.php               # Application bootstrap
│   └── providers.php         # Service provider registration
│
├── config/                   # Configuration files
│
├── database/
│   ├── factories/            # Model factories
│   ├── migrations/           # Database migrations
│   └── seeders/              # Database seeders
│
├── resources/
│   ├── css/
│   │   └── app.css          # Tailwind CSS entry
│   ├── js/
│   │   ├── actions/         # Wayfinder generated actions
│   │   ├── components/      # React components
│   │   │   └── ui/          # shadcn/ui components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── layouts/         # Page layouts
│   │   ├── lib/             # Utility functions
│   │   ├── pages/           # Inertia pages
│   │   ├── routes/          # Wayfinder generated routes
│   │   ├── types/           # TypeScript types
│   │   ├── app.tsx          # React entry point
│   │   └── bootstrap.ts     # JS bootstrap
│   └── views/
│       └── app.blade.php    # Root Blade template
│
├── routes/
│   ├── auth.php             # Authentication routes
│   ├── console.php          # Console commands
│   └── web.php              # Web routes
│
├── tests/
│   ├── Feature/             # Feature tests
│   └── Unit/                # Unit tests
│
├── components.json          # shadcn/ui config
├── tsconfig.json            # TypeScript config
├── tailwind.config.js       # Tailwind config
└── vite.config.js           # Vite config
```

---

## Frontend Architecture

### Component Hierarchy

```
App
├── Layouts
│   ├── AppLayout (authenticated)
│   │   ├── AppSidebar
│   │   ├── AppContent
│   │   └── Breadcrumbs
│   ├── AuthLayout (guest)
│   │   └── AuthSimpleLayout
│   └── SettingsLayout
│       └── Settings pages
│
├── Pages
│   ├── auth/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── ...
│   ├── dashboard.tsx
│   ├── settings/
│   │   ├── profile.tsx
│   │   ├── password.tsx
│   │   └── appearance.tsx
│   └── [feature]/
│       └── index.tsx
│
└── Components
    ├── ui/              # shadcn/ui primitives
    ├── app-sidebar.tsx  # Application sidebar
    ├── nav-main.tsx     # Main navigation
    └── ...
```

### State Management

-   **Server State**: Managed by Inertia.js props
-   **Form State**: Inertia `useForm` hook or `<Form>` component
-   **UI State**: React `useState` and `useContext`
-   **Theme State**: `useAppearance` hook with localStorage

### Routing

Routes are type-safe using Laravel Wayfinder:

```tsx
// Import generated route functions
import { show } from '@/actions/App/Http/Controllers/ExamController';

// Use in components
<Link href={show.url(exam.id)}>View Exam</Link>

// Or with Inertia Form
<Form {...store.form()}>
```

---

## Backend Architecture

### Request Lifecycle

```
HTTP Request
    │
    ▼
┌─────────────────┐
│   Middleware    │ (auth, cors, etc.)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Controller    │ (handle request)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Form Request    │ (validation)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Service      │ (business logic)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Model       │ (data access)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Inertia::render │ (response)
└─────────────────┘
```

### Controller Pattern

```php
class ExamController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('exams/index', [
            'exams' => Exam::query()
                ->where('user_id', auth()->id())
                ->paginate(10),
        ]);
    }

    public function store(StoreExamRequest $request): RedirectResponse
    {
        Exam::create($request->validated());

        return redirect()->route('exams.index');
    }
}
```

### Service Pattern (for complex logic)

```php
class ExamGeneratorService
{
    public function __construct(
        private readonly QuestionRepository $questions,
        private readonly TosGeneratorService $tosGenerator,
    ) {}

    public function generate(Topic $topic, int $count): Exam
    {
        // Complex exam generation logic
    }
}
```

---

## Database Schema

### Core Tables

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    users     │     │   subjects   │     │    topics    │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id           │     │ id           │     │ id           │
│ name         │     │ name         │     │ subject_id   │──┐
│ email        │     │ description  │     │ name         │  │
│ password     │     │ created_at   │     │ description  │  │
│ role         │     └──────────────┘     └──────────────┘  │
│ created_at   │            ▲                    ▲          │
└──────────────┘            │                    │          │
       │                    └────────────────────┘          │
       │                                                    │
       ▼                                                    │
┌──────────────┐     ┌──────────────┐     ┌──────────────┐ │
│    exams     │     │  questions   │     │cognitive_lvl │ │
├──────────────┤     ├──────────────┤     ├──────────────┤ │
│ id           │     │ id           │     │ id           │ │
│ user_id      │──┐  │ topic_id     │─────│ name         │ │
│ title        │  │  │ cognitive_id │─────│ level        │ │
│ description  │  │  │ content      │     │ description  │ │
│ created_at   │  │  │ answer       │     └──────────────┘ │
└──────────────┘  │  │ created_at   │                      │
       │          │  └──────────────┘                      │
       │          │         ▲                              │
       ▼          │         │                              │
┌──────────────┐  │  ┌──────────────┐                      │
│exam_questions│  │  │     tos      │                      │
├──────────────┤  │  ├──────────────┤                      │
│ exam_id      │──┘  │ id           │                      │
│ question_id  │─────│ exam_id      │                      │
│ order        │     │ topic_id     │──────────────────────┘
└──────────────┘     │ cognitive_id │
                     │ count        │
                     └──────────────┘
```

### Key Relationships

| Relationship      | Type         | Description                  |
| ----------------- | ------------ | ---------------------------- |
| User → Exams      | One-to-Many  | User creates many exams      |
| Subject → Topics  | One-to-Many  | Subject contains many topics |
| Topic → Questions | One-to-Many  | Topic has many questions     |
| Exam → Questions  | Many-to-Many | Via exam_questions pivot     |
| Exam → TOS        | One-to-Many  | Exam has TOS entries         |

---

## Authentication Flow

### Login Flow

```
1. User visits /login
         │
         ▼
2. AuthLayout renders login form
         │
         ▼
3. User submits credentials
         │
         ▼
4. POST /login → AuthenticatedSessionController
         │
         ▼
5. Validate credentials
         │
    ┌────┴────┐
    │         │
Success    Failure
    │         │
    ▼         ▼
6. Create   Return with
   session  errors
    │
    ▼
7. Redirect to /dashboard
```

### Protected Routes

```php
// routes/web.php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::resource('exams', ExamController::class);
    // ... other protected routes
});
```

---

## Data Flow

### Creating an Exam

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. Fill form, submit
       ▼
┌─────────────┐
│  Inertia    │ 2. POST /exams with form data
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Controller  │ 3. Validate request
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Service    │ 4. Generate exam, create TOS
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Model     │ 5. Save to database
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Response   │ 6. Redirect with success message
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Browser   │ 7. Show exam list with new exam
└─────────────┘
```

---

## Performance Considerations

### Database

-   Use eager loading to prevent N+1 queries
-   Add indexes on frequently queried columns
-   Use database pagination for large datasets

### Frontend

-   Code splitting via Vite
-   Lazy loading for heavy components
-   Optimistic UI updates where appropriate

### Caching

-   Cache frequently accessed data (subjects, cognitive levels)
-   Use Laravel's query caching for complex queries
-   Browser caching for static assets

---

## Security

### Authentication

-   Session-based authentication via Laravel Sanctum
-   CSRF protection on all forms
-   Rate limiting on auth endpoints

### Authorization

-   Role-based access control (Admin, Educator)
-   Policy-based authorization for resources
-   Middleware protection for routes

### Data Protection

-   Input validation on all requests
-   Prepared statements (Eloquent)
-   XSS protection via React's JSX escaping

---

## Related Documentation

-   [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
-   [API.md](./API.md) - API documentation
-   [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
