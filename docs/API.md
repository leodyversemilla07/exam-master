# ExamMaster API Documentation

**Version:** 1.3.0  
**Last Updated:** December 21, 2025  
**Laravel Version:** 12.43.1  
**Database:** SQLite (development), MySQL/PostgreSQL (production)  
**Backend Status:** 100% Complete (Production Ready) ✅  
**Frontend Status:** 100% Complete (Production Ready) ✅

This document describes the API endpoints available in ExamMaster.

> **Note**: ExamMaster uses Inertia.js, so most endpoints return Inertia responses rather than JSON. However, this document covers the available routes and their expected inputs/outputs.

---

## Table of Contents

- [Authentication](#authentication)
- [Dashboard](#dashboard)
- [User Management](#user-management)
- [Module Management](#module-management)
- [Topic Management](#topic-management)
- [Learning Objectives](#learning-objectives)
- [TOS Generator](#tos-generator)
- [TOS Calculator](#tos-calculator)
- [Question Bank](#question-bank)
- [Duplicate Detection](#duplicate-detection)
- [Exam Builder](#exam-builder)
- [PDF Export](#pdf-export)
- [Profile](#profile)
- [Current Implementation Status](#current-implementation-status)

---

## Current Implementation Status

### ✅ Fully Implemented (Production Ready)

#### Core Authentication & User Management
- **Authentication** - Laravel Fortify with 2FA and email verification
- **Dashboard** - Main application dashboard with comprehensive analytics
- **Profile Management** - Edit profile, password, appearance settings
- **User Management** - Full CRUD with search and pagination

#### RBAC System
- **Role-Based Access Control** - 3 roles, 21 permissions (Spatie Laravel Permission)
  - Super Admin: Full system access
  - Admin: Module and content management
  - User: Basic content creation

#### Module & Content Management
- **Module Management** - Full CRUD with status toggle, factories, and tests
  - Code: `MATH-101`, `SCI-201`
  - Subject areas, grade levels, curriculum years
  - Soft deletes, creator tracking

#### Topic & Learning Objectives
- **Topic Management** ✅ - Hierarchical topics with parent-child relationships
  - Full CRUD operations
  - Hours allocated, weight percentages
  - Ordered display
  - 8 routes, 6 tests passing
  
- **Learning Objectives** ✅ - Full CRUD with Bloom's taxonomy
  - 6 cognitive levels: Remembering, Understanding, Applying, Analyzing, Evaluating, Creating
  - Assessment criteria
  - Topic relationships
  - 5 routes

#### TOS System
- **TOS Generator** - Full CRUD with AI integration
  - Learning objectives management
  - Cognitive level distribution
  - Question type configuration
  - Difficulty settings
  - AI-powered question generation
  
- **TOS Calculator** ✅ - Advanced analytics service
  - Distribution calculations (topics × cognitive levels)
  - Matrix generation
  - Balance validation (10-25% per level)
  - Summary statistics
  - Visual representations

#### Question Bank & AI
- **Question Bank** - Full CRUD with AI generation
  - Multiple choice, True/False, Essay, Identification
  - Bloom's taxonomy levels
  - Difficulty ratings (Easy, Moderate, Difficult)
  - Approval workflow
  - Search and filter
  
- **Duplicate Detector** ✅ - AI-powered similarity detection
  - Levenshtein distance algorithm
  - Exact and fuzzy duplicate detection
  - Module-level statistics
  - Similarity scoring (0-100%)
  - Matching aspects analysis

#### Exam Builder
- **Exam Builder** - Complete exam assembly system
  - Add/remove questions
  - Reorder items
  - Adjust point values
  - Time limits and passing scores
  - Shuffle questions option
  - Publish/draft status
  - Duplicate exams
  - 13 routes, 9 tests passing

### ✅ URL Standardization (Kebab-Case)

All routes follow kebab-case convention:
- `/tos-generates` (not `/tosgenerates`)
- `/modules` (standardized)
- `/duplicate-detection` (standardized)
- `/tos-calculator` (standardized)

### 📊 Implementation Metrics

- **Backend Completion:** 100%
- **Frontend Completion:** 100%
- **Test Coverage:** 100% (66/66 tests passing)
- **Total Routes:** 125
- **Database Models:** 11
- **Migrations:** 13
- **Feature Tests:** 66
- **Permissions:** 22

See [BACKEND_COMPLETE.md](BACKEND_COMPLETE.md) for full implementation details.

---

## Authentication

### Login

```
POST /login
```

**Request Body:**

| Field    | Type    | Required | Description        |
| -------- | ------- | -------- | ------------------ |
| email    | string  | Yes      | User email address |
| password | string  | Yes      | User password      |
| remember | boolean | No       | Remember session   |

**Response:**

- Success: Redirect to `/dashboard`
- Failure: Redirect back with validation errors

**Features:**
- Rate limited to 5 attempts per minute
- CSRF protection required
- Session-based authentication via Laravel Fortify

---

### Register

```
POST /register
```

**Request Body:**

| Field                 | Type   | Required | Description            |
| --------------------- | ------ | -------- | ---------------------- |
| name                  | string | Yes      | Full name              |
| email                 | string | Yes      | Email address          |
| password              | string | Yes      | Password (min 8 chars) |
| password_confirmation | string | Yes      | Password confirmation  |

**Response:**

- Success: Redirect to `/dashboard`
- Failure: Redirect back with validation errors

---

## Dashboard

### View Dashboard

```
GET /dashboard
```

**Response Props:**

```typescript
interface DashboardProps {
    stats: {
        modules_count: number;
        tos_count: number;
        questions_count: number;
        exams_count: number;
    };
    recent_modules: Module[];
    recent_tos: TosGenerate[];
}
```

---

## User Management

### List Users

```
GET /users
```

**Query Parameters:**

| Parameter | Type   | Required | Description          |
| --------- | ------ | -------- | -------------------- |
| search    | string | No       | Search by name/email |
| page      | number | No       | Page number          |

**Response Props:**

```typescript
interface UsersIndexProps {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
}
```

---

### Create User

```
POST /users
```

**Request Body:**

| Field                 | Type   | Required | Description            |
| --------------------- | ------ | -------- | ---------------------- |
| name                  | string | Yes      | Full name              |
| email                 | string | Yes      | Email address (unique) |
| password              | string | Yes      | Password (min 8 chars) |
| password_confirmation | string | Yes      | Password confirmation  |

---

### Update User

```
PUT /users/{id}
```

**Request Body:**

| Field                 | Type   | Required | Description                        |
| --------------------- | ------ | -------- | ---------------------------------- |
| name                  | string | Yes      | Full name                          |
| email                 | string | Yes      | Email address (unique)             |
| password              | string | No       | New password (leave blank to keep) |
| password_confirmation | string | No       | Password confirmation              |

---

### Delete User

```
DELETE /users/{id}
```

---

### Toggle User Active Status (NEW v1.2.0)

```
POST /users/{user}/toggle
```

**Description:** Activates or deactivates a user account. Users cannot deactivate their own account.

**Permissions Required:** `edit users`

**Response:** Returns Inertia back to previous page with success message

**Validation:**
- Prevents self-deactivation

---

## Module Management

### List Modules

```
GET /modules
```

**Query Parameters:**

| Parameter | Type    | Required | Description          |
| --------- | ------- | -------- | -------------------- |
| is_active | boolean | No       | Filter by status     |
| page      | number  | No       | Page number          |

**Response Props:**

```typescript
interface ModulesIndexProps {
    modules: {
        data: (Module & {
            creator?: { name: string };
            tos_generates_count?: number;
            questions_count?: number;
        })[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}
```

---

### Show Module

```
GET /modules/{module}
```

---

### Create Module

```
GET /modules/create
POST /modules
```

**Request Body:**

| Field           | Type    | Required | Description                 |
| --------------- | ------- | -------- | --------------------------- |
| code            | string  | Yes      | Module code (e.g., MATH-101)|
| name            | string  | Yes      | Module name                 |
| description     | string  | No       | Module description          |
| subject_area    | string  | Yes      | Subject area                |
| grade_level     | string  | Yes      | Grade level                 |
| curriculum_year | string  | Yes      | Curriculum year             |
| is_active       | boolean | No       | Active status (default true)|

---

### Update Module

```
GET /modules/{module}/edit
PUT /modules/{module}
```

---

### Delete Module

```
DELETE /modules/{module}
```

---

### Toggle Module Status

```
POST /modules/{module}/toggle
```

---

## Topic Management

### List Topics

```
GET /modules/{module}/topics
```

**Response Props:**

```typescript
interface TopicsIndexProps {
    module: Module;
    topics: Topic[]; // Includes hierarchical relationships
}
```

---

### Create Topic

```
GET /modules/{module}/topics/create
POST /modules/{module}/topics
```

**Request Body:**

| Field             | Type    | Required | Description                     |
| ----------------- | ------- | -------- | ------------------------------- |
| code              | string  | Yes      | Topic code (e.g., T1, T2.1)     |
| title             | string  | Yes      | Topic title                     |
| description       | string  | No       | Topic description               |
| parent_id         | number  | No       | Parent topic ID (for subtopics) |
| hours_allocated   | number  | No       | Teaching hours                  |
| weight_percentage | number  | No       | Weight in assessment (0-100)    |
| is_active         | boolean | No       | Active status (default true)    |

---

### Show Topic

```
GET /modules/{module}/topics/{topic}
```

---

### Update Topic

```
GET /modules/{module}/topics/{topic}/edit
PUT /modules/{module}/topics/{topic}
```

---

### Delete Topic

```
DELETE /modules/{module}/topics/{topic}
```

---

### Reorder Topics

```
PATCH /modules/{module}/topics/reorder
```

**Request Body:**

```typescript
{
    topics: {
        id: number;
        order: number;
    }[]
}
```

---

## Learning Objectives

### List Learning Objectives

```
GET /modules/{module}/topics/{topic}/learning-objectives
```

**Response Props:**

```typescript
interface LearningObjectivesIndexProps {
    module: Module;
    topic: Topic;
    objectives: LearningObjective[];
}
```

---

### Create Learning Objective

```
POST /modules/{module}/topics/{topic}/learning-objectives
```

**Request Body:**

| Field               | Type           | Required | Description                        |
| ------------------- | -------------- | -------- | ---------------------------------- |
| code                | string         | Yes      | Objective code (e.g., LO1, LO2.1)  |
| objective           | string         | Yes      | Learning objective text            |
| cognitive_level     | CognitiveLevel | Yes      | Bloom's taxonomy level             |
| assessment_criteria | string         | No       | Assessment criteria                |
| is_active           | boolean        | No       | Active status (default true)       |

**Cognitive Levels:**
- `remembering` - Recall facts and basic concepts
- `understanding` - Explain ideas or concepts
- `applying` - Use information in new situations
- `analyzing` - Draw connections among ideas
- `evaluating` - Justify decisions or course of action
- `creating` - Produce new or original work

---

### Update Learning Objective

```
PUT /modules/{module}/topics/{topic}/learning-objectives/{objective}
```

---

### Delete Learning Objective

```
DELETE /modules/{module}/topics/{topic}/learning-objectives/{objective}
```

---

## TOS Generator

The TOS (Table of Specifications) Generator module includes **AI-powered question generation** using PrismPHP with multi-provider support.

### List TOS

```
GET /tos-generates
```

**Response:**

Returns paginated list of TOS records with module relationships.

---

### Create TOS

```
GET /tos-generates/create
```

Shows form to create new TOS.

---

### Store TOS

```
POST /tos-generates
```

**Request Body:**

| Field                          | Type    | Required | Description                              |
| ------------------------------ | ------- | -------- | ---------------------------------------- |
| module_id                      | integer | Yes      | Module/subject ID                        |
| grade_level                    | string  | Yes      | Grade level (e.g., "Grade 7")            |
| subject                        | string  | Yes      | Subject name                             |
| quarter                        | string  | No       | Academic quarter                         |
| total_items                    | integer | Yes      | Total questions (1-200)                  |
| learning_objectives            | array   | Yes      | Learning objectives with codes           |
| learning_objectives.*.code     | string  | Yes      | Objective code                           |
| learning_objectives.*.description | string  | Yes   | Objective description                    |
| cognitive_levels               | object  | Yes      | Bloom's taxonomy distribution            |
| cognitive_levels.remember      | integer | No       | Remember level count                     |
| cognitive_levels.understand    | integer | No       | Understand level count                   |
| cognitive_levels.apply         | integer | No       | Apply level count                        |
| cognitive_levels.analyze       | integer | No       | Analyze level count                      |
| cognitive_levels.evaluate      | integer | No       | Evaluate level count                     |
| cognitive_levels.create        | integer | No       | Create level count                       |
| difficulty_level               | string  | Yes      | "easy", "medium", "hard", or "mixed"     |
| question_type                  | string  | Yes      | "multiple_choice", "true_false", "essay", "short_answer" |
| additional_instructions        | string  | No       | Extra requirements (max 1000 chars)      |

**Validation Rules:**
- `module_id` must exist in modules table
- `total_items` must be between 1 and 200
- At least one learning objective required
- Sum of cognitive levels must equal total_items

---

### Generate AI Questions

```
POST /tos-generates/{tosGenerate}/generate
```

**AI-Powered Question Generation**

Uses PrismPHP to call AI providers (OpenAI GPT-4o-mini, Gemini 3 Flash, Claude) to automatically generate exam questions based on the TOS specifications.

**Features:**
- Multi-provider AI support
- Structured output following Bloom's taxonomy
- Cultural adaptation for Filipino students
- Automatic status management (draft → generating → completed/failed)
- Error handling and logging

---

### Show TOS

```
GET /tos-generates/{tosGenerate}
```

---

### Edit TOS

```
GET /tos-generates/{tosGenerate}/edit
```

---

### Update TOS

```
PUT /tos-generates/{tosGenerate}
```

---

### Delete TOS

```
DELETE /tos-generates/{tosGenerate}
```

---

## TOS Calculator

### View TOS Matrix

```
GET /modules/{module}/tos-calculator
```

**Response Props:**

```typescript
interface TosCalculatorProps {
    module: Module & {
        topics: (Topic & {
            learning_objectives: LearningObjective[];
        })[];
    };
    matrix: {
        topic_id: number;
        topic_code: string;
        topic_title: string;
        remembering: number;
        understanding: number;
        applying: number;
        analyzing: number;
        evaluating: number;
        creating: number;
        total: number;
        percentage: number;
    }[];
    distribution: {
        cognitive_level: CognitiveLevel;
        count: number;
        percentage: number;
    }[];
    statistics: {
        total_objectives: number;
        total_topics: number;
        average_per_topic: number;
        most_used_level: CognitiveLevel;
        least_used_level: CognitiveLevel;
    };
    balance: {
        level: CognitiveLevel;
        count: number;
        ideal_min: number;
        ideal_max: number;
        status: 'balanced' | 'over' | 'under';
    }[];
}
```

**Features:**
- Topics × Cognitive Levels matrix
- Distribution analysis
- Balance validation (10-25% per level)
- Visual representations
- Export capabilities

---

## Question Bank

### List Questions

```
GET /exams
```

**Query Parameters:**

| Parameter       | Type    | Required | Description                  |
| --------------- | ------- | -------- | ---------------------------- |
| search          | string  | No       | Search question text         |
| module_id       | number  | No       | Filter by module             |
| question_type   | string  | No       | Filter by type               |
| cognitive_level | string  | No       | Filter by cognitive level    |
| difficulty      | string  | No       | Filter by difficulty         |
| page            | number  | No       | Page number                  |

**Response Props:**

```typescript
interface ExamsIndexProps {
    questions: {
        data: Question[];
        current_page: number;
        last_page: number;
        total: number;
    };
    modules: Module[];
    filters: {
        module_id?: number;
        question_type?: string;
        cognitive_level?: string;
        difficulty?: string;
        search?: string;
    };
}
```

---

## Duplicate Detection

### View Duplicates

```
GET /modules/{module}/duplicate-detection
```

**Response Props:**

```typescript
interface DuplicateDetectionProps {
    module: Module;
    duplicates: {
        question: ExamQuestion;
        matches: {
            question: ExamQuestion;
            similarity_score: number;
            matching_aspects: string[];
        }[];
    }[];
    statistics: {
        total_questions: number;
        duplicate_groups: number;
        highest_similarity: number;
        questions_with_duplicates: number;
    };
}
```

**Features:**
- Levenshtein distance algorithm
- Similarity scoring (0-100%)
- Matching aspects analysis
- Side-by-side comparison
- Severity classification:
  - Very High (95%+): Near duplicates
  - High (90-94%): Very similar
  - Moderate (75-89%): Notable overlap
  - Low (60-74%): Minor similarities

---

## Exam Builder

### List Exams

```
GET /exam-builder
```

---

### Create Exam

```
GET /exam-builder/create
POST /exam-builder
```

**Request Body:**

| Field             | Type    | Required | Description                    |
| ----------------- | ------- | -------- | ------------------------------ |
| module_id         | number  | Yes      | Module ID                      |
| title             | string  | Yes      | Exam title                     |
| description       | string  | No       | Exam description               |
| exam_type         | string  | Yes      | formative/summative/diagnostic |
| time_limit        | number  | No       | Time limit in minutes          |
| passing_score     | number  | No       | Passing score percentage       |
| instructions      | string  | No       | Exam instructions              |
| shuffle_questions | boolean | No       | Shuffle questions (default false) |
| show_answers      | boolean | No       | Show answers (default false)   |

---

### Add Questions to Exam

```
POST /exam-builder/{exam}/add-questions
```

**Request Body:**

```typescript
{
    question_ids: number[];
}
```

---

### Remove Question from Exam

```
DELETE /exam-builder/{exam}/questions/{question}
```

---

### Update Question Points

```
PATCH /exam-builder/{exam}/questions/{question}/points
```

**Request Body:**

```typescript
{
    points: number;
}
```

---

### Publish Exam

```
POST /exam-builder/{exam}/publish
```

---

### Duplicate Exam

```
POST /exam-builder/{exam}/duplicate
```

---

## PDF Export

### Export Exam to PDF (Without Answers)

```
GET /exam-builder/{exam}/export-pdf
```

**Response:** PDF file download

**Headers:**
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="exam-title_exam.pdf"`

**Description:**
Generates a professional PDF of the exam suitable for student distribution. Includes:
- Exam header with title and module
- Student information section (name, date, score fields)
- Instructions section
- All questions with answer blanks (for MCQ, options A-D are shown)

**Permissions Required:** `view exams`

**Error Responses:**
- `400` - Cannot export an exam with no questions
- `403` - Unauthorized (missing permission)

---

### Export Exam to PDF (With Answer Key)

```
GET /exam-builder/{exam}/export-pdf-answers
```

**Response:** PDF file download

**Headers:**
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="exam-title_exam_answer_key.pdf"`

**Description:**
Generates a professional PDF of the exam with the answer key included. Suitable for instructor use. Includes:
- Exam header with title and module
- Student information section
- Instructions section
- All questions with answer blanks
- **Answer Key section** with correct answers highlighted

**Permissions Required:** `view exams`

**Error Responses:**
- `400` - Cannot export an exam with no questions
- `403` - Unauthorized (missing permission)

---

### Supported Question Types

The PDF export supports all question types:

| Type | Format |
|------|--------|
| Multiple Choice | Options A-D with checkboxes |
| True/False | True ○  False ○ |
| Short Answer | Blank line for answer |
| Identification | Blank line for answer |
| Essay | Multiple blank lines |

---

## Profile

### View Profile

```
GET /settings/profile
```

---

### Update Profile

```
PUT /settings/profile
```

**Request Body:**

| Field | Type   | Required | Description |
| ----- | ------ | -------- | ----------- |
| name  | string | Yes      | Full name   |
| email | string | Yes      | Email       |

---

### Update Password

```
PUT /settings/password
```

**Request Body:**

| Field                 | Type   | Required | Description       |
| --------------------- | ------ | -------- | ----------------- |
| current_password      | string | Yes      | Current password  |
| password              | string | Yes      | New password      |
| password_confirmation | string | Yes      | Password confirm  |

---

### Update Appearance

```
PUT /settings/appearance
```

**Request Body:**

| Field | Type   | Required | Description          |
| ----- | ------ | -------- | -------------------- |
| theme | string | Yes      | "light", "dark", "system" |

---

## Type Definitions

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

interface Module {
    id: number;
    user_id: number;
    code: string;
    name: string;
    description: string | null;
    subject_area: string;
    grade_level: string;
    curriculum_year: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface Topic {
    id: number;
    module_id: number;
    parent_id: number | null;
    code: string;
    title: string;
    description: string | null;
    order: number;
    hours_allocated: number | null;
    weight_percentage: number | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    parent?: Topic;
    children?: Topic[];
    learning_objectives?: LearningObjective[];
}

type CognitiveLevel =
    | 'remembering'
    | 'understanding'
    | 'applying'
    | 'analyzing'
    | 'evaluating'
    | 'creating';

interface LearningObjective {
    id: number;
    topic_id: number;
    code: string;
    objective: string;
    cognitive_level: CognitiveLevel;
    order: number;
    assessment_criteria: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface TosGenerate {
    id: number;
    module_id: number;
    created_by: number;
    grade_level: string;
    subject: string;
    quarter: string | null;
    total_items: number;
    learning_objectives: Array<{
        code: string;
        description: string;
    }>;
    cognitive_levels: Record<CognitiveLevel, number>;
    item_distribution: Record<string, unknown>;
    difficulty_level: 'easy' | 'medium' | 'hard' | 'mixed';
    question_type: 'multiple_choice' | 'true_false' | 'essay' | 'short_answer';
    additional_instructions: string | null;
    status: 'draft' | 'generating' | 'completed' | 'failed';
    error_message: string | null;
    created_at: string;
    updated_at: string;
}

interface ExamQuestion {
    id: number;
    module_id: number;
    tos_generate_id: number | null;
    question: string;
    question_type: 'multiple_choice' | 'true_false' | 'essay' | 'short_answer';
    options: Array<{
        key: string;
        text: string;
    }> | null;
    correct_answer: string | null;
    explanation: string | null;
    cognitive_level: CognitiveLevel;
    difficulty: 'easy' | 'medium' | 'hard';
    learning_objective_code: string | null;
    status: 'draft' | 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
}

interface Exam {
    id: number;
    module_id: number;
    created_by: number;
    title: string;
    description: string | null;
    exam_type: 'formative' | 'summative' | 'diagnostic';
    time_limit: number | null;
    passing_score: number | null;
    instructions: string | null;
    shuffle_questions: boolean;
    show_answers: boolean;
    status: 'draft' | 'published' | 'archived';
    total_items: number;
    total_points: number;
    created_at: string;
    updated_at: string;
}
```

---

## Error Responses

All endpoints return errors in the following format:

```typescript
{
    message: string;
    errors?: {
        [field: string]: string[];
    };
}
```

**Common HTTP Status Codes:**

- `200` - Success
- `201` - Created
- `302` - Redirect
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

---

## Rate Limiting

- **Login:** 5 attempts per minute
- **Register:** 3 attempts per minute
- **API requests:** 60 requests per minute per user
- **AI Generation:** 10 requests per hour per user

---

## Notes

- All authenticated routes require CSRF token
- All timestamps are in UTC
- Pagination defaults to 15 items per page
- Soft deletes are used for modules, topics, and learning objectives
- File uploads are not yet implemented
- WebSocket/real-time features are not yet implemented

---

For more information, see:
- [Backend Implementation Details](BACKEND_COMPLETE.md)
- [Architecture Documentation](ARCHITECTURE.md)
- [RBAC Documentation](RBAC.md)
- [Development Roadmap](ROADMAP.md)
