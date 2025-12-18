# ExamMaster Architecture

**Version:** 1.1  
**Last Updated:** December 19, 2025  
**Laravel Version:** 12.43.1  
**React Version:** 19.2.3  
**TypeScript Version:** 5.9.3  
**Inertia.js Version:** 2.x

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

### Current Implementation Status

**✅ Completed Features:**
- User authentication (login, register, password reset, email verification)
- Two-factor authentication support
- User profile management (with TypeScript strict mode support)
- Settings pages (profile, password, appearance)
- Dark/light mode theming
- Resource routes for all management modules (kebab-case URLs)
- Complete database structure with migrations
- Queue system
- Session management
- Type-safe routing with Wayfinder
- Modern UI with shadcn/ui components (Radix UI primitives)
- User management CRUD operations
- Module management system (full CRUD with factories and tests)
- Topic management (hierarchical with parent-child relationships)
- Learning objectives (Bloom's taxonomy support)
- TOS Generator (full CRUD with cognitive level distribution)
- TOS Calculator (matrix generation, balance analysis)
- Question Bank (CRUD with AI generation)
- Duplicate Detection (Levenshtein similarity algorithm)
- Exam Builder (CRUD with question management)
- RBAC system (3 roles: super-admin, admin, user; 21 permissions)
- Consistent UI patterns (page-level padding, no max-width constraints)

**🔄 In Progress:**
- Dashboard analytics and statistics
- Advanced reporting features
- Performance optimizations

**⏳ Planned:**
- Real-time notifications
- Export functionality (PDF, Excel)
- Exam export (PDF)
- Advanced analytics
- Role-based permissions

**✅ Recently Completed:**
- AI question generation with PrismPHP
- Multi-provider AI support (OpenAI, Gemini, Anthropic)
- Structured output for exam questions
- Database schema for questions and TOS

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                    (React + TypeScript)                     │
└─────────────────────────┬───────────────────────────────────┘
                          │ Inertia.js
┌─────────────────────────▼───────────────────────────────────┐
│                    Laravel Backend                          │
│              (Controllers, Services, Models)                │
│                                                             │
│    ┌─────────────────────────────────────┐                │
│    │   AI Service Layer (PrismPHP)       │                │
│    │   - QuestionGeneratorService        │                │
│    │   - OpenAI / Gemini / Anthropic     │                │
│    └─────────────────────────────────────┘                │
└─────────────────────────┬───────────────────────────────────┘
                          │ Eloquent ORM
┌─────────────────────────▼───────────────────────────────────┐
│                        SQLite/MySQL                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend

| Technology        | Version | Purpose           |
| ----------------- | ------- | ----------------- |
| React             | 19.2.3  | UI library        |
| TypeScript        | 5.9.3   | Type safety       |
| Inertia.js        | 2.3.3   | SPA adapter       |
| Tailwind CSS      | 4.1.18  | Styling           |
| shadcn/ui         | 3.5.1   | UI components     |
| Laravel Wayfinder | 0.1.12  | Type-safe routing |

### Backend

| Technology       | Version | Purpose           |
| ---------------- | ------- | ----------------- |
| Laravel          | 12.43.1 | PHP framework     |
| PHP              | 8.3.28  | Server language   |
| SQLite           | 3.x     | Database (dev)    |
| Laravel Sanctum  | 4.2.1   | Authentication    |
| Laravel Fortify  | 1.33.0  | Auth features     |
| PrismPHP         | 0.99.2  | AI integration    |

### Development Tools

| Tool           | Version | Purpose          |
| -------------- | ------- | ---------------- |
| Vite           | 7.3.0   | Asset bundling   |
| Pest           | 4.2.0   | Testing          |
| Laravel Pint   | 1.26.0  | Code formatting  |
| TypeScript     | 5.9.3   | Type checking    |
| Laravel Boost  | 1.8+    | MCP dev tools    |

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

### UI Components

ExamMaster uses shadcn/ui built on Radix UI primitives for accessible, customizable components:

**Installed Components:**
- Avatar
- Checkbox
- Dialog/Modal
- Dropdown Menu
- Label
- Separator
- Slot
- Switch (recently added)
- Tooltip

**Component Structure:**
```
resources/js/components/
├── ui/                  # shadcn/ui components
│   ├── avatar.tsx
│   ├── button.tsx
│   ├── checkbox.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── label.tsx
│   ├── separator.tsx
│   ├── switch.tsx
│   └── tooltip.tsx
├── app-sidebar.tsx      # Application sidebar
├── nav-main.tsx         # Main navigation
└── theme-provider.tsx   # Theme management
```

### Theme Management

ExamMaster supports light and dark mode:
- Persisted in localStorage
- Accessible via settings/appearance page
- Uses CSS variables for theming
- Compatible with Tailwind CSS v4

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

### Core Tables (Current Implementation)

The application currently uses SQLite for development with the following tables:

```
┌──────────────────────┐
│        users         │
├──────────────────────┤
│ id                   │ (Primary Key)
│ name                 │ (varchar)
│ email                │ (varchar, unique)
│ email_verified_at    │ (datetime, nullable)
│ password             │ (varchar)
│ remember_token       │ (varchar, nullable)
│ two_factor_secret    │ (text, nullable) *NEW*
│ two_factor_recovery  │ (text, nullable) *NEW*
│ two_factor_confirmed │ (datetime, nullable) *NEW*
│ created_at           │
│ updated_at           │
└──────────────────────┘
         │
         │ (Referenced by other tables)
         │
         ▼
┌──────────────────────┐     ┌──────────────────────┐
│  user_management     │     │  exam_management     │
├──────────────────────┤     ├──────────────────────┤
│ id                   │     │ id                   │
│ created_at           │     │ created_at           │
│ updated_at           │     │ updated_at           │
└──────────────────────┘     └──────────────────────┘

┌──────────────────────┐     ┌──────────────────────┐
│ module_management    │     │   mod_management     │
├──────────────────────┤     ├──────────────────────┤
│ id                   │     │ id                   │
│ created_at           │     │ created_at           │
│ updated_at           │     │ updated_at           │
└──────────────────────┘     └──────────────────────┘

┌──────────────────────┐     ┌──────────────────────┐
│   tos_generators     │     │    tos_generates     │
├──────────────────────┤     ├──────────────────────┤
│ id                   │     │ id                   │
│ created_at           │     │ created_at           │
│ updated_at           │     │ updated_at           │
└──────────────────────┘     └──────────────────────┘

┌──────────────────────┐     ┌──────────────────────┐
│    system_logs       │     │      settings        │
├──────────────────────┤     ├──────────────────────┤
│ id                   │     │ id                   │
│ created_at           │     │ created_at           │
│ updated_at           │     │ updated_at           │
└──────────────────────┘     └──────────────────────┘

┌──────────────────────┐
│       modules        │
├──────────────────────┤
│ id                   │
│ created_at           │
│ updated_at           │
└──────────────────────┘
```

### System Tables

```
┌──────────────────────┐     ┌──────────────────────┐
│    sessions          │     │  password_reset      │
├──────────────────────┤     ├──────────────────────┤
│ id (PK)              │     │ email (PK)           │
│ user_id              │     │ token                │
│ ip_address           │     │ created_at           │
│ user_agent           │     └──────────────────────┘
│ payload              │
│ last_activity        │     ┌──────────────────────┐
└──────────────────────┘     │     cache            │
                             ├──────────────────────┤
┌──────────────────────┐     │ key (PK)             │
│    jobs              │     │ value                │
├──────────────────────┤     │ expiration           │
│ id (PK)              │     └──────────────────────┘
│ queue                │
│ payload              │     ┌──────────────────────┐
│ attempts             │     │   cache_locks        │
│ reserved_at          │     ├──────────────────────┤
│ available_at         │     │ key (PK)             │
│ created_at           │     │ owner                │
└──────────────────────┘     │ expiration           │
                             └──────────────────────┘
┌──────────────────────┐
│   job_batches        │     ┌──────────────────────┐
├──────────────────────┤     │   failed_jobs        │
│ id (PK)              │     ├──────────────────────┤
│ name                 │     │ id (PK)              │
│ total_jobs           │     │ uuid (unique)        │
│ pending_jobs         │     │ connection           │
│ failed_jobs          │     │ queue                │
│ failed_job_ids       │     │ payload              │
│ options              │     │ exception            │
│ cancelled_at         │     │ failed_at            │
│ created_at           │     └──────────────────────┘
│ finished_at          │
└──────────────────────┘
```

### Key Relationships & Notes

**Current Implementation Status:**
- ✅ User authentication with Fortify (login, register, password reset, email verification)
- ✅ Two-factor authentication support (columns added to users table)
- ✅ Session management
- ✅ Cache system
- ✅ Job queue system
- ⚠️ Management tables (exam, user, module, mod, tos) exist but have minimal columns
- 🔄 Full exam and TOS functionality is under development

**Planned Relationships (To Be Implemented):**
| Relationship      | Type         | Description                  | Status |
| ----------------- | ------------ | ---------------------------- | ------ |
| User → Exams      | One-to-Many  | User creates many exams      | 🔄     |
| Subject → Topics  | One-to-Many  | Subject contains many topics | 🔄     |
| Topic → Questions | One-to-Many  | Topic has many questions     | 🔄     |
| Exam → Questions  | Many-to-Many | Via exam_questions pivot     | 🔄     |
| Exam → TOS        | One-to-Many  | Exam has TOS entries         | 🔄     |

**Database Engine:**
- Development: SQLite (current)
- Production: MySQL/PostgreSQL (recommended)

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
