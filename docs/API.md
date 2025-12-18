# ExamMaster API Documentation

**Version:** 1.1  
**Last Updated:** December 19, 2025  
**Laravel Version:** 12.43.1  
**Database:** SQLite (development), MySQL/PostgreSQL (production)  
**Backend Status:** 94% Complete ✅

This document describes the API endpoints available in ExamMaster.

> **Note**: ExamMaster uses Inertia.js, so most endpoints return Inertia responses rather than JSON. However, this document covers the available routes and their expected inputs/outputs.

---

## Table of Contents

-   [Authentication](#authentication)
-   [Dashboard](#dashboard)
-   [User Management](#user-management)
-   [Module Management](#module-management)
-   [Topic Management](#topic-management)
-   [Learning Objectives](#learning-objectives)
-   [TOS Generator](#tos-generator)
-   [Question Bank](#question-bank)
-   [Exam Builder](#exam-builder)
-   [Profile](#profile)
-   [Settings](#settings)
-   [System Logs](#system-logs)
-   [Current Implementation Status](#current-implementation-status)

---

## Current Implementation Status

### ✅ Fully Implemented (Production Ready)
- **Authentication** - Laravel Fortify with 2FA support
- **Dashboard** - Main application dashboard
- **Profile Management** - Edit profile, password, appearance settings
- **Role-Based Access Control** - 3 roles, 21 permissions (Spatie Laravel Permission)
- **Module Management** - Full CRUD with status toggle
- **Topic Management** ✅ NEW - Hierarchical topics with CRUD (8 routes, 6 tests passing)
- **Learning Objectives** ✅ NEW - Full CRUD with Bloom's taxonomy (5 routes)
- **TOS Generator** - Full CRUD with AI integration + TOS Calculator service
  - Distribution calculations
  - Matrix generation (topics × cognitive levels)
  - Balance validation
  - Summary statistics
- **Question Bank** - Full CRUD with AI generation + Duplicate Detector service
  - Levenshtein similarity algorithm
  - Exact and fuzzy duplicate detection
  - Module-level statistics
- **Exam Builder** - Complete exam assembly system (13 routes, 9 tests passing)
  - Add/remove questions
  - Reorder and adjust points
  - Publish/duplicate exams

### 🔄 Minimal Implementation
The following endpoints exist but have minimal functionality:
- Settings (`/settingss`)
- System Logs (`/systemlogss`)

### 📊 Backend Completion: 94%
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

-   Success: Redirect to `/dashboard`
-   Failure: Redirect back with validation errors

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

-   Success: Redirect to `/dashboard`
-   Failure: Redirect back with validation errors

---

### Logout

```
POST /logout
```

**Response:**

-   Redirect to `/`

---

### Forgot Password

```
POST /forgot-password
```

**Request Body:**

| Field | Type   | Required | Description        |
| ----- | ------ | -------- | ------------------ |
| email | string | Yes      | User email address |

**Response:**

-   Success: Redirect back with status message
-   Failure: Redirect back with errors

---

### Reset Password

```
POST /reset-password
```

**Request Body:**

| Field                 | Type   | Required | Description            |
| --------------------- | ------ | -------- | ---------------------- |
| token                 | string | Yes      | Reset token from email |
| email                 | string | Yes      | User email             |
| password              | string | Yes      | New password           |
| password_confirmation | string | Yes      | Password confirmation  |

---

### Email Verification

```
POST /email/verification-notification
```

Resends verification email.

```
GET /verify-email/{id}/{hash}
```

Verifies email address.

---

### Two-Factor Authentication

ExamMaster supports Two-Factor Authentication via Laravel Fortify.

#### Enable 2FA

```
POST /user/two-factor-authentication
```

**Response:**
- Generates 2FA secret and recovery codes
- User must confirm via `/user/confirmed-two-factor-authentication`

#### Confirm 2FA

```
POST /user/confirmed-two-factor-authentication
```

**Request Body:**

| Field | Type   | Required | Description    |
| ----- | ------ | -------- | -------------- |
| code  | string | Yes      | 2FA token code |

#### Get QR Code

```
GET /user/two-factor-qr-code
```

Returns SVG QR code for authenticator app setup.

#### Get Recovery Codes

```
GET /user/two-factor-recovery-codes
```

Returns recovery codes array.

#### Regenerate Recovery Codes

```
POST /user/two-factor-recovery-codes
```

#### Disable 2FA

```
DELETE /user/two-factor-authentication
```

---

## Dashboard

### Get Dashboard

```
GET /dashboard
```

**Response Props:**

```typescript
interface DashboardProps {
    auth: {
        user: User;
    };
    // Dashboard statistics
}
```

---

## User Management

### List Users

```
GET /usermanagement
```

**Response Props:**

```typescript
interface UserManagementProps {
    users: User[];
    pagination: PaginationData;
}
```

---

### Create User

```
POST /usermanagement
```

**Request Body:**

| Field    | Type   | Required | Description                |
| -------- | ------ | -------- | -------------------------- |
| name     | string | Yes      | User name                  |
| email    | string | Yes      | Email address              |
| password | string | Yes      | Password                   |
| role     | string | Yes      | User role (admin/educator) |

---

### Update User

```
PUT /usermanagement/{id}
```

---

### Delete User

```
DELETE /usermanagement/{id}
```

---

## Exam Management

### List Exams

```
GET /exammanagement
```

**Response Props:**

```typescript
interface ExamManagementProps {
    exams: Exam[];
    pagination: PaginationData;
}
```

---

### Create Exam

```
POST /exammanagement
```

**Request Body:**

| Field            | Type     | Required | Description                     |
| ---------------- | -------- | -------- | ------------------------------- |
| title            | string   | Yes      | Exam title                      |
| subject_id       | number   | Yes      | Subject ID                      |
| topic_ids        | number[] | Yes      | Array of topic IDs              |
| question_count   | number   | Yes      | Number of questions             |
| cognitive_levels | object   | No       | Distribution by cognitive level |

---

### Show Exam

```
GET /exammanagement/{id}
```

---

### Update Exam

```
PUT /exammanagement/{id}
```

---

### Delete Exam

```
DELETE /exammanagement/{id}
```

---

## TOS Generate

The TOS (Table of Specifications) Generate module now includes **AI-powered question generation** using PrismPHP with multi-provider support.

### List TOS

```
GET /tosgenerates
```

**Response:**

Returns paginated list of TOS records with module relationships.

---

### Create TOS

```
GET /tosgenerates/create
```

Shows form to create new TOS.

---

### Store TOS

```
POST /tosgenerates
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| module_id | integer | Yes | Module/subject ID |
| grade_level | string | Yes | Grade level (e.g., "Grade 7") |
| subject | string | Yes | Subject name |
| quarter | string | No | Academic quarter |
| total_items | integer | Yes | Total questions (1-200) |
| learning_objectives | array | Yes | Learning objectives with codes |
| learning_objectives.*.code | string | Yes | Objective code |
| learning_objectives.*.description | string | Yes | Objective description |
| cognitive_levels | object | Yes | Bloom's taxonomy distribution |
| cognitive_levels.remember | integer | No | Remember level count |
| cognitive_levels.understand | integer | No | Understand level count |
| cognitive_levels.apply | integer | No | Apply level count |
| cognitive_levels.analyze | integer | No | Analyze level count |
| cognitive_levels.evaluate | integer | No | Evaluate level count |
| cognitive_levels.create | integer | No | Create level count |
| difficulty_level | string | Yes | "easy", "medium", "hard", or "mixed" |
| question_type | string | Yes | "multiple_choice", "true_false", "essay", "short_answer" |
| additional_instructions | string | No | Extra requirements (max 1000 chars) |

**Validation Rules:**
- `module_id` must exist in modules table
- `total_items` must be between 1 and 200
- At least one learning objective required
- Cognitive levels must be provided (can be 0)

**Response:**

- Success: Redirect to TOS detail page
- Failure: Redirect back with validation errors

**Example Request:**

```json
{
  "module_id": 1,
  "grade_level": "Grade 7",
  "subject": "Mathematics",
  "quarter": "First Quarter",
  "total_items": 5,
  "learning_objectives": [
    {"code": "LO1", "description": "Add and subtract integers"},
    {"code": "LO2", "description": "Multiply and divide integers"}
  ],
  "cognitive_levels": {
    "remember": 1,
    "understand": 2,
    "apply": 2,
    "analyze": 0,
    "evaluate": 0,
    "create": 0
  },
  "difficulty_level": "easy",
  "question_type": "multiple_choice",
  "additional_instructions": "Use simple numbers suitable for Grade 7 students"
}
```

---

### Generate AI Questions

```
POST /tosgenerates/{tosGenerate}/generate
```

**AI-Powered Question Generation**

This endpoint uses PrismPHP to call AI providers (OpenAI GPT-4o-mini for production, Gemini 3 Flash Preview for development) to automatically generate exam questions based on the TOS specifications.

**Features:**
- Multi-provider AI support (OpenAI, Gemini, Anthropic)
- Structured output following Bloom's taxonomy
- Cultural adaptation for Filipino students
- Automatic status management (draft → generating → completed/failed)

**Process:**
1. Validates TOS exists and has required data
2. Builds educational prompt with learning objectives and cognitive levels
3. Calls AI provider with structured output schema
4. Saves generated questions to database
5. Updates TOS status

**Response:**

Returns generated questions array with:
- Question text
- Multiple choice options (if applicable)
- Correct answer
- Explanation
- Cognitive level
- Difficulty
- Learning objective code

**Example Response:**

```json
{
  "questions": [
    {
      "question": "In the rules of adding integers, what is the sum of any integer and its additive inverse?",
      "options": [
        {"key": "A", "text": "1"},
        {"key": "B", "text": "0"},
        {"key": "C", "text": "The integer itself"},
        {"key": "D", "text": "Positive one"}
      ],
      "correct_answer": "B",
      "explanation": "The sum of an integer and its additive inverse is always zero (e.g., 5 + (-5) = 0).",
      "cognitive_level": "remember",
      "difficulty": "easy",
      "learning_objective_code": "LO1"
    }
  ]
}
```

**Environment Configuration:**

Required environment variables:
```env
# AI Provider Configuration
PRISM_PROVIDER=gemini  # Use gemini for dev, openai for prod
GEMINI_API_KEY=your_api_key_here
OPENAI_API_KEY=your_api_key_here  # Optional for production
```

Get free Gemini API key: https://aistudio.google.com/apikey

**AI Models Used:**
- **Development:** `gemini-3-flash-preview` (Free tier)
- **Production:** `gpt-4o-mini` ($0.80/$3.20 per 1M tokens)

---

### View TOS

```
GET /tosgenerates/{tosGenerate}
```

Shows TOS details with generated questions.

---

### Edit TOS

```
GET /tosgenerates/{tosGenerate}/edit
```

Shows form to edit existing TOS.

---

### Update TOS

```
PUT /tosgenerates/{tosGenerate}
PATCH /tosgenerates/{tosGenerate}
```

Updates TOS with same validation rules as store.

---

### Delete TOS

```
DELETE /tosgenerates/{tosGenerate}
```

Soft deletes the TOS record.

---

## Module Management

### List Modules

```
GET /modmanagement
```

---

### Create Module

```
POST /modmanagement
```

**Request Body:**

| Field       | Type   | Required | Description        |
| ----------- | ------ | -------- | ------------------ |
| name        | string | Yes      | Module name        |
| subject_id  | number | Yes      | Subject ID         |
| description | string | No       | Module description |

---

### Update Module

```
PUT /modmanagement/{id}
```

---

### Delete Module

```
DELETE /modmanagement/{id}
```

---

## Topic Management

### List Topics

```
GET /modules/{module}/topics
```

Lists all topics for a specific module, including hierarchical parent-child relationships.

**Response Props:**

```typescript
interface TopicIndexProps {
    module: Module;
    topics: Topic[];
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
    deleted_at: string | null;
    parent?: Topic;
    children?: Topic[];
    learning_objectives?: LearningObjective[];
}
```

---

### Create Topic

```
GET /modules/{module}/topics/create
```

Shows form to create a new topic.

---

### Store Topic

```
POST /modules/{module}/topics
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| code | string | Yes | Topic code (max 50 chars) |
| title | string | Yes | Topic title (max 255 chars) |
| description | string | No | Topic description |
| parent_id | integer | No | Parent topic ID for hierarchy |
| hours_allocated | numeric | No | Hours allocated (min 0) |
| weight_percentage | numeric | No | Weight percentage (0-100) |
| is_active | boolean | No | Active status (default: true) |

**Validation Rules:**
- `code` must be unique within the module
- `parent_id` must exist in topics table and belong to same module
- `hours_allocated` must be >= 0
- `weight_percentage` must be between 0 and 100

**Response:**

- Success: Redirect to topics list with success message
- Failure: Redirect back with validation errors

---

### View Topic

```
GET /modules/{module}/topics/{topic}
```

Shows topic details with learning objectives and child topics.

---

### Edit Topic

```
GET /modules/{module}/topics/{topic}/edit
```

Shows form to edit existing topic.

---

### Update Topic

```
PUT /modules/{module}/topics/{topic}
PATCH /modules/{module}/topics/{topic}
```

Updates topic with same validation rules as store.

---

### Delete Topic

```
DELETE /modules/{module}/topics/{topic}
```

Soft deletes the topic. Child topics remain but become root topics.

---

### Reorder Topics

```
POST /modules/{module}/topics/reorder
```

Updates the order of multiple topics at once.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| topics | array | Yes | Array of topic IDs in desired order |

**Example Request:**

```json
{
  "topics": [3, 1, 2]
}
```

**Response:**

- Success: Returns 200 OK
- Failure: Returns validation errors

---

## Learning Objectives

### List Learning Objectives

```
GET /modules/{module}/topics/{topic}/objectives
```

Lists all learning objectives for a specific topic.

**Response:**

```json
{
  "objectives": [
    {
      "id": 1,
      "topic_id": 1,
      "code": "LO1",
      "description": "Add and subtract integers",
      "cognitive_level": "apply",
      "order": 1,
      "is_active": true
    }
  ]
}
```

---

### Store Learning Objective

```
POST /modules/{module}/topics/{topic}/objectives
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| code | string | Yes | Objective code (max 50 chars) |
| description | string | Yes | Objective description (max 500 chars) |
| cognitive_level | string | Yes | Bloom's taxonomy level |
| is_active | boolean | No | Active status (default: true) |

**Cognitive Levels (Bloom's Taxonomy):**
- `remembering` - Recall facts and basic concepts
- `understanding` - Explain ideas or concepts
- `applying` - Use information in new situations
- `analyzing` - Draw connections among ideas
- `evaluating` - Justify decisions or course of action
- `creating` - Produce new or original work

**Validation Rules:**
- `code` must be unique within the topic
- `cognitive_level` must be one of the 6 levels above

**Response:**

- Success: Returns 200 OK with created objective
- Failure: Returns validation errors

---

### Update Learning Objective

```
PUT /modules/{module}/topics/{topic}/objectives/{objective}
PATCH /modules/{module}/topics/{topic}/objectives/{objective}
```

Updates learning objective with same validation rules as store.

---

### Delete Learning Objective

```
DELETE /modules/{module}/topics/{topic}/objectives/{objective}
```

Soft deletes the learning objective.

---

### Reorder Learning Objectives

```
POST /modules/{module}/topics/{topic}/objectives/reorder
```

Updates the order of multiple learning objectives at once.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| objectives | array | Yes | Array of objective IDs in desired order |

**Example Request:**

```json
{
  "objectives": [2, 1, 3]
}
```

---

## TOS Generator (Enhanced)

The TOS Generator now includes advanced calculation services.

### TOS Matrix

```
GET /tos/{tosGenerate}/matrix
```

Generates a 2D matrix showing distribution of questions across topics and cognitive levels.

**Response:**

```json
{
  "matrix": {
    "topics": [
      {
        "id": 1,
        "title": "Integers",
        "cognitive_levels": {
          "remembering": 2,
          "understanding": 3,
          "applying": 5,
          "analyzing": 0,
          "evaluating": 0,
          "creating": 0
        }
      }
    ],
    "totals": {
      "by_topic": {"Integers": 10},
      "by_cognitive_level": {
        "remembering": 2,
        "understanding": 3,
        "applying": 5
      }
    }
  }
}
```

---

### Validate TOS

```
POST /tos/{tosGenerate}/validate
```

Validates TOS balance and distribution.

**Response:**

```json
{
  "valid": true,
  "issues": [],
  "warnings": ["Topic 'Integers' is over-represented (60% of items)"],
  "total_items_match": true,
  "cognitive_balance": {
    "lower_order": 50,
    "higher_order": 50
  }
}
```

**Validation Checks:**
- Total items match specification
- No over-represented topics (>40%)
- No under-represented topics (<5% when should be included)
- Missing cognitive levels flagged
- Difficulty distribution appropriate

---

### Get Distribution

```
GET /tos/{tosGenerate}/distribution
```

Returns distribution statistics by cognitive level and difficulty.

**Response:**

```json
{
  "cognitive_distribution": {
    "remembering": {"count": 2, "percentage": 20},
    "understanding": {"count": 3, "percentage": 30},
    "applying": {"count": 5, "percentage": 50}
  },
  "difficulty_distribution": {
    "easy": {"count": 4, "percentage": 40},
    "medium": {"count": 4, "percentage": 40},
    "hard": {"count": 2, "percentage": 20}
  },
  "topic_distribution": {
    "Integers": {"count": 10, "percentage": 100}
  }
}
```

---

### Get Summary

```
GET /tos/{tosGenerate}/summary
```

Returns comprehensive TOS summary with all statistics.

**Response:**

```json
{
  "total_items": 10,
  "total_topics": 1,
  "total_objectives": 2,
  "cognitive_distribution": {...},
  "difficulty_distribution": {...},
  "topic_distribution": {...},
  "balance_score": 85,
  "recommendations": [
    "Consider adding higher-order thinking questions",
    "Increase difficulty variety"
  ]
}
```

---

## Question Bank (Enhanced)

The Question Bank now includes duplicate detection services.

### Check Question Duplicates

```
POST /questions/{question}/check-duplicates
```

Checks if a question is similar to existing questions using Levenshtein distance algorithm.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| threshold | float | 0.85 | Similarity threshold (0.0-1.0) |

**Response:**

```json
{
  "is_duplicate": true,
  "exact_match": false,
  "similar_questions": [
    {
      "id": 42,
      "question": "What is the sum of 5 and -5?",
      "similarity": 0.92,
      "match_type": "very_high",
      "module": "Mathematics Grade 7"
    }
  ]
}
```

**Match Types:**
- `exact` - 95%+ similarity (likely duplicate)
- `very_high` - 85-94% similarity (very similar)
- `high` - 70-84% similarity (similar)
- `moderate` - <70% similarity (somewhat similar)

---

### Get Module Duplicates

```
GET /modules/{module}/duplicates
```

Gets duplicate statistics for all questions in a module.

**Response:**

```json
{
  "total_questions": 150,
  "duplicate_count": 8,
  "duplicate_percentage": 5.3,
  "duplicates": [
    {
      "question_id": 42,
      "duplicates": [...]
    }
  ]
}
```

---

### Bulk Check Duplicates

```
POST /questions/bulk-check-duplicates
```

Checks multiple questions for duplicates at once.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| question_ids | array | Yes | Array of question IDs to check |
| threshold | float | No | Similarity threshold (default: 0.85) |

**Response:**

```json
{
  "results": [
    {
      "question_id": 42,
      "has_duplicates": true,
      "duplicate_count": 2,
      "duplicates": [...]
    }
  ]
}
```

---

## Settings

### Profile

#### Get Profile

```
GET /settings/profile
```

**Response Props:**

```typescript
interface ProfileProps {
    mustVerifyEmail: boolean;
    status?: string;
}
```

#### Update Profile

```
PATCH /settings/profile
```

**Request Body:**

| Field | Type   | Required | Description   |
| ----- | ------ | -------- | ------------- |
| name  | string | Yes      | User name     |
| email | string | Yes      | Email address |

---

### Password

#### Get Password Page

```
GET /settings/password
```

#### Update Password

```
PUT /password
```

**Request Body:**

| Field                 | Type   | Required | Description      |
| --------------------- | ------ | -------- | ---------------- |
| current_password      | string | Yes      | Current password |
| password              | string | Yes      | New password     |
| password_confirmation | string | Yes      | Confirmation     |

---

### Appearance

#### Get Appearance Page

```
GET /settings/appearance
```

---

### Delete Account

```
DELETE /settings/profile
```

**Request Body:**

| Field    | Type   | Required | Description                       |
| -------- | ------ | -------- | --------------------------------- |
| password | string | Yes      | Current password for confirmation |

---

## System Logs

### List Logs

```
GET /systemlogs
```

**Response Props:**

```typescript
interface SystemLogsProps {
    logs: SystemLog[];
    pagination: PaginationData;
}
```

---

## TypeScript Types

### User

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
}
```

### Exam

```typescript
interface Exam {
    id: number;
    user_id: number;
    title: string;
    subject_id: number;
    description?: string;
    created_at: string;
    updated_at: string;
    questions?: Question[];
    tos?: TOS[];
}
```

### Question

```typescript
interface Question {
    id: number;
    topic_id: number;
    cognitive_level_id: number;
    content: string;
    answer: string;
    options?: string[];
    created_at: string;
    updated_at: string;
}
```

### TOS (Table of Specifications)

```typescript
interface TOS {
    id: number;
    exam_id: number;
    topic_id: number;
    cognitive_level_id: number;
    question_count: number;
    percentage: number;
}
```

### PaginationData

```typescript
interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}
```

---

## Error Responses

### Validation Errors

```typescript
interface ValidationErrors {
    message: string;
    errors: {
        [field: string]: string[];
    };
}
```

### HTTP Status Codes

| Code | Description      |
| ---- | ---------------- |
| 200  | Success          |
| 201  | Created          |
| 302  | Redirect         |
| 400  | Bad Request      |
| 401  | Unauthorized     |
| 403  | Forbidden        |
| 404  | Not Found        |
| 422  | Validation Error |
| 500  | Server Error     |

---

## Using with Wayfinder

ExamMaster uses Laravel Wayfinder for type-safe routing. Import routes from:

```typescript
// Controller actions
import {
    index,
    store,
    show,
} from "@/actions/App/Http/Controllers/ExamManagementController";

// Named routes
import { dashboard } from "@/routes";

// Usage
<Link href={show.url(examId)}>View Exam</Link>;
```

### Available Controllers

The following controllers are available in the application:

- **ExamManagementController** - `/exammanagements` (index, store)
- **ModManagementController** - `/modmanagements` (index, store)
- **TosGenerateController** - `/tosgenerates` (index, store)
- **UserManagementController** - `/usermanagements` (index, store, update, destroy)
- **SystemLogsController** - `/systemlogss` (index, store)
- **SettingsController** - `/settingss` (index, store)
- **ProfileController** - `/profile` (edit, update, destroy)

---

## Rate Limiting

Authentication endpoints are rate-limited:

| Endpoint              | Limit                  |
| --------------------- | ---------------------- |
| POST /login           | 5 attempts per minute  |
| POST /forgot-password | 5 requests per minute  |
| POST /register        | 10 requests per minute |
