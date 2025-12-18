# ExamMaster API Documentation

This document describes the API endpoints available in ExamMaster.

> **Note**: ExamMaster uses Inertia.js, so most endpoints return Inertia responses rather than JSON. However, this document covers the available routes and their expected inputs/outputs.

---

## Table of Contents

-   [Authentication](#authentication)
-   [Dashboard](#dashboard)
-   [User Management](#user-management)
-   [Exam Management](#exam-management)
-   [TOS Generate](#tos-generate)
-   [Module Management](#module-management)
-   [Settings](#settings)
-   [System Logs](#system-logs)

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

### List TOS

```
GET /tosgenerate
```

---

### Generate TOS

```
POST /tosgenerate
```

**Request Body:**

| Field            | Type   | Required | Description                       |
| ---------------- | ------ | -------- | --------------------------------- |
| exam_id          | number | Yes      | Exam ID                           |
| topics           | array  | Yes      | Topics with weights               |
| cognitive_levels | array  | Yes      | Cognitive levels with percentages |

---

### Export TOS

```
GET /tosgenerate/{id}/export
```

**Response:**

-   PDF file download

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

---

## Rate Limiting

Authentication endpoints are rate-limited:

| Endpoint              | Limit                  |
| --------------------- | ---------------------- |
| POST /login           | 5 attempts per minute  |
| POST /forgot-password | 5 requests per minute  |
| POST /register        | 10 requests per minute |
