# Contributing to ExamMaster

**Version:** 1.0  
**Last Updated:** December 18, 2025

Thank you for your interest in contributing to ExamMaster! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

-   [Code of Conduct](#code-of-conduct)
-   [Getting Started](#getting-started)
-   [Development Workflow](#development-workflow)
-   [Coding Standards](#coding-standards)
-   [Commit Guidelines](#commit-guidelines)
-   [Pull Request Process](#pull-request-process)
-   [Testing](#testing)

---

## Code of Conduct

-   Be respectful and inclusive
-   Provide constructive feedback
-   Focus on the project goals
-   Help maintain a positive environment

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

-   PHP 8.3+
-   Composer
-   Node.js 18+ (20 LTS recommended)
-   SQLite (or MySQL for production)
-   Git
-   Laravel Herd (recommended for local development)

### Setup Development Environment

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/exam-master.git
cd exam-master

# Install dependencies
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Run migrations
php artisan migrate

# Start development server
composer run dev
```

---

## Development Workflow

### Branch Naming Convention

| Type     | Format                 | Example                     |
| -------- | ---------------------- | --------------------------- |
| Feature  | `feature/description`  | `feature/add-question-bank` |
| Bug Fix  | `fix/description`      | `fix/login-validation`      |
| Hotfix   | `hotfix/description`   | `hotfix/security-patch`     |
| Refactor | `refactor/description` | `refactor/auth-system`      |

### Creating a New Branch

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
```

---

## Coding Standards

### PHP (Laravel)

-   Follow PSR-12 coding standards
-   Run Laravel Pint before committing:
    ```bash
    vendor/bin/pint
    ```
-   Use type hints and return types
-   Use constructor property promotion
-   Write PHPDoc blocks for complex methods

**Example:**

```php
public function __construct(
    private readonly ExamRepository $examRepository
) {}

public function generateExam(int $topicId, int $questionCount): Exam
{
    // Implementation
}
```

### TypeScript/React

-   Use TypeScript strict mode
-   Use functional components with hooks
-   Follow kebab-case for file names
-   Use shadcn/ui components when available

**Example:**

```tsx
// pages/exams/create.tsx
import { Button } from '@/components/ui/button';

interface CreateExamProps {
    topics: Topic[];
}

export default function CreateExam({ topics }: CreateExamProps) {
    return (
        // Implementation
    );
}
```

### CSS (Tailwind)

-   Use Tailwind CSS v4 utilities
-   Follow existing component patterns
-   Support dark mode with `dark:` prefix
-   Use oklch color values

---

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type       | Description                     |
| ---------- | ------------------------------- |
| `feat`     | New feature                     |
| `fix`      | Bug fix                         |
| `docs`     | Documentation changes           |
| `style`    | Code style changes (formatting) |
| `refactor` | Code refactoring                |
| `test`     | Adding or updating tests        |
| `chore`    | Maintenance tasks               |

### Examples

```bash
# Feature
git commit -m "feat(exam): add question bank management"

# Bug fix
git commit -m "fix(auth): resolve login redirect issue"

# Documentation
git commit -m "docs: update API documentation"
```

---

## Pull Request Process

### Before Submitting

1. **Update your branch**

    ```bash
    git fetch origin
    git rebase origin/main
    ```

2. **Run tests**

    ```bash
    php artisan test
    ```

3. **Run code formatters**

    ```bash
    vendor/bin/pint
    npm run build
    ```

4. **Check for errors**
    ```bash
    php artisan route:list
    ```

### PR Template

When creating a PR, include:

-   **Description**: What does this PR do?
-   **Type**: Feature / Bug Fix / Refactor / etc.
-   **Testing**: How was this tested?
-   **Screenshots**: If UI changes are involved
-   **Related Issues**: Link any related issues

### Review Process

1. At least one team member must review
2. All CI checks must pass
3. No merge conflicts
4. Documentation updated if needed

---

## Testing

### Running Tests

```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/ExamTest.php

# Run with coverage
php artisan test --coverage

# Filter by test name
php artisan test --filter=ExamCreation
```

### Writing Tests

Use Pest PHP for testing:

```php
// tests/Feature/ExamTest.php
use App\Models\User;
use App\Models\Exam;

it('allows educators to create exams', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->post('/exams', [
            'title' => 'Math Exam',
            'topic_id' => 1,
        ]);

    $response->assertSuccessful();
    expect(Exam::count())->toBe(1);
});
```

### Test Categories

| Type        | Location         | Purpose                           |
| ----------- | ---------------- | --------------------------------- |
| Unit        | `tests/Unit/`    | Test individual functions/methods |
| Feature     | `tests/Feature/` | Test full features/endpoints      |
| Integration | `tests/Feature/` | Test component interactions       |

---

## Questions?

If you have questions about contributing, please:

1. Check existing documentation
2. Search closed issues
3. Open a new issue with the `question` label

---

Thank you for contributing to ExamMaster! 🎓
