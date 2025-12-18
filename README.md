# ExamMaster

## AI-Powered Exam Question Generator with Table of Specifications (TOS) Creator

**Status:** Backend 98% Complete ✅ | Frontend Fully Implemented ✅  
**Last Updated:** December 19, 2025

---

An Application Development and Emerging Technologies, Web System and Technologies 2, and Event-Driven Programming Project

In Partial Fulfillment of the Requirements for the Degree  
**Bachelor of Science in Information Technology**

---

**November 11, 2024**

---

## Table of Contents

-   [Introduction](#introduction)
    -   [Project Context](#project-context)
    -   [Objectives](#objectives)
    -   [Definition of Terms](#definition-of-terms)
    -   [Scope and Limitation](#scope-and-limitation)
-   [Requirements Specification](#requirements-specification)
    -   [Hardware Requirements](#hardware-requirements)
    -   [Software Requirements](#software-requirements)
    -   [Functional Requirements](#functional-requirements)
    -   [Non-Functional Requirements](#non-functional-requirements)
-   [Design and Development Methodologies](#design-and-development-methodologies)
    -   [Database Design](#database-design)
    -   [Architectural Diagram](#architectural-diagram)
    -   [DFD Level 0](#dfd-level-0)
    -   [UML Use-case Diagram](#uml-use-case-diagram)
    -   [Sample Mock-Up](#sample-mock-up)
    -   [Methodology](#methodology)
    -   [Testing Activities](#testing-activities)
-   [Tech Stack](#tech-stack)
-   [Getting Started](#getting-started)
-   [References](#references)
-   [License](#license)

---

## Introduction

### Project Context

In the evolving landscape of education, educators face the challenge of developing assessments that accurately measure student knowledge while aligning with curriculum standards and learning objectives. Traditional methods of exam creation can be time-consuming and may lack consistency, particularly in distributing questions across various cognitive levels.

**ExamMaster** is an AI-powered tool designed to address these issues by automating the exam creation process while incorporating a Table of Specifications (TOS). Using advanced AI models (GPT-4o-mini, Gemini 3 Flash, Claude 3.5) through PrismPHP, this tool provides educators with an efficient way to generate high-quality exams that are balanced, culturally appropriate for Filipino students, and aligned with educational standards and specific curriculum goals. By leveraging AI, ExamMaster supports educators in producing reliable and fair assessments with questions distributed across Bloom's taxonomy cognitive levels, helping to meet the increasing demands of modern education.

This study builds on the principles of educational assessment and instructional design. The primary goal of ExamMaster is to assist educators in creating valid and reliable exams by automating much of the manual effort typically involved. Grounded in research highlighting the limitations of conventional assessment methods and the potential of automation, this project offers an innovative solution to modern educational challenges.

For example, Shi and Aryadoust (2022) have shown how automation can improve both the accuracy and efficiency of assessments, while Ramesh and Sanampudi (2021) have emphasized the role of automated scoring systems in providing consistent feedback to students. These studies illustrate the urgent need for tools that modernize assessment practices to meet contemporary educational demands.

### Objectives

Generally, the objective of this project is to develop and evaluate **ExamMaster**, an AI-powered system that facilitates the creation of exams aligned with educational standards and balanced across cognitive levels using a Table of Specifications (TOS).

**Specifically, this aims to:**

1. Design and develop an AI-based system that automates exam creation and integrates a Table of Specifications to ensure cognitive balance and curriculum alignment.
2. Streamline the distribution of exam questions so that they align with learning objectives and standards.
3. Reduce the administrative workload on educators by automating the exam creation process.
4. Assess the system's effectiveness in improving assessment quality and usability within educational settings.

### Definition of Terms

| Term                              | Definition                                                                                                                                                                                                                         |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AI-Powered Exam Creator**       | An automated system that uses artificial intelligence algorithms to generate examination questions tailored to specific educational standards and learning objectives.                                                             |
| **Table of Specifications (TOS)** | A matrix used in educational assessment that outlines the cognitive skills required for a test and ensures a balanced distribution of questions across different learning objectives.                                              |
| **Cognitive Balance**             | The distribution of exam questions according to cognitive levels such as knowledge, comprehension, application, analysis, synthesis, and evaluation, often based on Bloom's Taxonomy.                                              |
| **Curriculum Alignment**          | Ensuring that exam questions reflect the specific goals, content, and cognitive demands of the educational curriculum.                                                                                                             |
| **Bloom's Taxonomy**              | A hierarchical classification of cognitive skills, ranging from lower-order skills (like remembering and understanding) to higher-order skills (like analyzing and creating), used to structure educational goals and assessments. |

### Scope and Limitation

ExamMaster: AI-Powered Exam Creator with Table of Specifications Generator focuses on the development and evaluation of an AI-driven system designed to streamline the exam creation process while ensuring alignment with the Table of Specifications (TOS).

**The system will:**

-   Automatically generate exams across core subjects such as mathematics, science, and language arts
-   Allow educators to customize assessments based on curriculum standards and cognitive levels using Bloom's Taxonomy
-   Categorize questions into cognitive levels such as knowledge, comprehension, and application
-   Offer flexibility across different academic disciplines
-   Allow educators to build custom question banks or use pre-set templates
-   Generate reports summarizing how well the test items align with the TOS
-   Ensure exam validity, balance, and alignment with learning objectives

The study will also gather feedback from educators to evaluate the system's ease of use and its effectiveness in supporting the creation of fair, well-structured exams.

---

## Requirements Specification

### Hardware Requirements

#### Laptop Requirements

| Component   | Specification                                                  | Description                                                                                                               |
| ----------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **CPU**     | Intel® Core™ i5-1135G7 (or higher) or AMD Ryzen 5 5000 series | To handle multitasking efficiently and run development tools without lag                                                  |
| **RAM**     | 8GB DDR4 (16GB preferred for dev)                              | For optimal performance, especially when running multiple applications or large datasets for exam creation                |
| **Storage** | 256GB SSD minimum (512GB recommended)                          | For faster boot times and system performance, enabling quick data access and smooth operation of development environments |
| **Display** | Full HD (1920x1080) or higher                                  | For efficient workspace with multiple windows open during development                                                     |
| **Network** | Stable Wi-Fi or Ethernet (minimum 25 Mbps)                     | To allow cloud synchronization, real-time updates, and API calls                                                          |

#### Mobile Phone Requirements (Optional)

| Component        | Specification         | Description                                                  |
| ---------------- | --------------------- | ------------------------------------------------------------ |
| **RAM**          | 4GB minimum           | For running essential apps and multitasking                  |
| **Storage**      | 128GB or more         | For storing app data, files, exam reports, and media         |
| **OS**           | Android 10 or iOS 14+ | For compatibility with the mobile version of the application |
| **Connectivity** | 4G/5G or Wi-Fi        | For seamless data transfer and accessing exam data remotely  |

### Software Requirements

| Category               | Software                              | Description                                                                                          |
| ---------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Operating System**   | Windows 11 (64-bit) or macOS (latest) | For compatibility with development tools, frameworks, and libraries                                  |
| **IDE**                | Visual Studio Code                    | Lightweight but powerful code editor for backend APIs, frontend interfaces, and AI model integration |
| **AI Development**     | Google Colab                          | Essential for handling AI model development, NLP tasks, and data analysis                            |
| **Database**           | SQLite (Dev) / MySQL (Production)     | To store and manage user data, exam configurations, templates, and reports                           |
| **Backend**            | PHP 8.3, Laravel 12                   | PHP for server-side logic; Laravel for MVC framework and API development                             |
| **Frontend Framework** | React.js 19 with TypeScript           | To build dynamic and responsive user interfaces with type safety                                     |
| **Styling**            | Tailwind CSS v4, shadcn/ui            | For utility-first styling and pre-built accessible UI components                                     |
| **AI/ML Frameworks**   | TensorFlow/PyTorch                    | For creating and deploying AI models for exam question generation                                    |
| **NLP**                | Hugging Face Transformers             | For pre-trained NLP models to assist with question creation and classification                       |

### Functional Requirements

-   User account creation, login, and profile management for educators and admins
-   Subject and topic definition with curriculum association
-   Question bank management (add, edit, delete questions)
-   Questions associated with topics and cognitive levels (Bloom's Taxonomy)
-   Automatic Table of Specifications generation based on input topics and cognitive levels
-   Exam generation by selecting topics and cognitive levels
-   Report generation summarizing TOS alignment, cognitive level distribution, and question count
-   Exam layout modification (adjust question numbers per topic/cognitive level)
-   Export functionality for exams and reports as PDFs
-   Role-based access control (admins manage accounts/settings; educators manage exams)

### Non-Functional Requirements

#### Operational Requirements

-   Automatic daily backups to prevent data loss
-   Easy data restoration capability

#### Security Requirements

-   Encryption for sensitive information (login details, exam data)
-   Role-based authorization for feature access

#### Cultural and Political Requirements

-   Support for both English and Filipino languages

---

## Design and Development Methodologies

### Database Design

The database consists of several interconnected tables:

| Table               | Purpose                                                                  |
| ------------------- | ------------------------------------------------------------------------ |
| **Subjects**        | Categorizes subjects                                                     |
| **Users**           | Stores user details (educators, admins)                                  |
| **Topics**          | Links specific topics to subjects                                        |
| **CognitiveLevels** | Classifies questions based on Bloom's Taxonomy                           |
| **Questions**       | Stores individual questions with topic and cognitive level associations  |
| **Exams**           | Tracks exams created by educators                                        |
| **ExamQuestions**   | Connects questions to specific exams                                     |
| **TOS**             | Records question distribution by topic and cognitive level for each exam |

### Architectural Diagram

The ExamMaster architecture consists of:

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                           │
│              (Teachers & Administrators)                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                        API Gateway                              │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                         Backend                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │    Exam      │  │     TOS      │  │       Data           │  │
│  │  Generator   │  │  Generator   │  │    Processing        │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                    AI Processing Unit                           │
│              (Machine Learning Models)                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                        Database                                  │
│        (Question Banks, User Info, Exam Data)                   │
└─────────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                    External Services                            │
│              (Third-party APIs & Tools)                         │
└─────────────────────────────────────────────────────────────────┘
```

### DFD Level 0

The Data Flow Diagram illustrates how the system assists instructors in creating exams:

1. **Input**: Instructor provides exam specifications and curriculum alignment
2. **Validation**: System validates against curriculum standards database
3. **Question Retrieval**: System retrieves and filters questions from question bank
4. **TOS Organization**: Questions organized according to Table of Specifications
5. **Generation**: System generates structured exam and TOS report
6. **Review**: Educator reviews and approves or requests modifications
7. **Storage**: Finalized exam and TOS report saved to database

### UML Use-case Diagram

**Teacher Actions in ExamMaster:**

1. Enter topics, learning goals, and cognitive levels
2. System automatically generates balanced exam
3. Review and modify generated exam
4. Generate Table of Specifications (TOS) report
5. Export exam and TOS report as PDF

### Sample Mock-Up

The ExamMaster interface features:

-   **Login Form**: Clean, minimalist design with username/password fields
-   **Dashboard**: User-friendly interface with quick navigation to:
    -   Create Exam
    -   Generate TOS
    -   Built-in analytics for question distribution
    -   Cognitive skills monitoring

### Methodology

The **Scrum methodology** (Agile approach) is used for developing ExamMaster because it is:

-   **Flexible and Adaptive**: Allows continuous improvement through feedback at each stage
-   **Focus on Educator Needs**: Involves educators and curriculum experts in each stage
-   **Clear Prioritization**: Each sprint focuses on high-priority features

#### Scrum Phases for ExamMaster

| Phase                         | Description                                                           |
| ----------------------------- | --------------------------------------------------------------------- |
| **1. Planning**               | List features needed; create user stories with educators              |
| **2. Sprint Cycles**          | 2-4 week sprints with specific goals (exam creation, TOS integration) |
| **3. Review & Feedback**      | Test features and gather educator feedback                            |
| **4. Improvement Reflection** | Discuss what worked and adjust for next sprint                        |
| **5. Final Release**          | Launch ExamMaster after all features tested                           |

### Testing Activities

| Test Type                         | Description                                                |
| --------------------------------- | ---------------------------------------------------------- |
| **Unit Testing**                  | Testing individual features (e.g., TOS integration)        |
| **Integration Testing**           | Checking if new features work with existing parts          |
| **User Acceptance Testing (UAT)** | Educators test for usability and expected behavior         |
| **System Testing**                | Final tests on complete system                             |
| **Regression Testing**            | Ensuring new features don't disrupt existing functionality |

---

## Tech Stack

| Layer            | Technology                                            |
| ---------------- | ----------------------------------------------------- |
| **Frontend**     | React 19.2.3, TypeScript 5.9.3, Tailwind CSS 4.1.18   |
| **UI Library**   | shadcn/ui 3.5.1, Radix UI, Lucide React               |
| **Backend**      | Laravel 12.43.1, PHP 8.3.28                           |
| **Database**     | SQLite (dev), MySQL/PostgreSQL (production)           |
| **Routing**      | Laravel Wayfinder 0.1.12, Inertia.js 2.3.3            |
| **Auth**         | Laravel Fortify 1.33.0, Laravel Sanctum 4.2.1         |
| **AI Integration** | PrismPHP 0.99.2 (OpenAI, Gemini, Anthropic)         |
| **AI Models**    | GPT-4o-mini, Gemini 3 Flash Preview, Claude 3.5       |
| **Testing**      | Pest PHP 4.2.0                                        |
| **Dev Tools**    | Vite 7.3.0, Laravel Pint 1.26.0, Laravel Boost 1.8+   |

---

## Getting Started

### Prerequisites

-   PHP 8.2+
-   Composer
-   Node.js 18+
-   MySQL

### Installation

```bash
# Clone the repository
git clone https://github.com/hisangge/exam-master.git
cd exam-master

# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Create SQLite database
touch database/database.sqlite

# Run migrations
php artisan migrate

# Configure AI API Keys (Required for AI question generation)
# Get free Gemini API key: https://aistudio.google.com/apikey
# Add to .env file:
# PRISM_PROVIDER=gemini
# GEMINI_API_KEY=your_gemini_api_key_here
# OPENAI_API_KEY=your_openai_api_key_here  # Optional for production

# Generate Wayfinder routes (optional, auto-generated on build)
php artisan wayfinder:generate

# Seed database with roles and permissions
php artisan db:seed

# Start development servers (Laravel + Vite + Queue Worker)
composer run dev

# Or start individually in separate terminals:
# Terminal 1: Laravel server
php artisan serve

# Terminal 2: Queue worker (REQUIRED for AI question generation)
php artisan queue:work

# Terminal 3: Vite dev server
npm run dev
```

> **⚠️ IMPORTANT**: The queue worker MUST be running for AI question generation to work. Without it, you'll get timeout errors. See [Queue Setup Guide](docs/QUEUE_SETUP.md) for details.

### Running Tests

```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/ExamBuilderTest.php

# Run with filter
php artisan test --filter=TopicTest
```

**Test Results (Dec 19, 2025):**
- ✅ 32+ tests passing
- ✅ 9/9 Exam Builder tests passing
- ✅ 6/6 Topic backend tests passing
- ✅ All authentication tests passing
- ✅ Module, TOS, Question tests passing
- ✅ No regressions detected
- ✅ 85% code coverage

---

## Current Implementation Status

### ✅ Backend Complete (98%)

**Fully Implemented:**
- Authentication system (Laravel Fortify with 2FA)
- Role-Based Access Control (3 roles, 21 permissions)
- User Management (full CRUD with search)
- Module Management (full CRUD with soft deletes)
- Topic Management (hierarchical with parent-child relationships)
- Learning Objectives (Bloom's taxonomy integration, 5 routes)
- TOS Generator with TosCalculator service (matrix generation, balance analysis)
- Question Bank with QuestionDuplicateDetector service (Levenshtein algorithm)
- Exam Builder (complete assembly system, 13 routes)
- Duplicate Detection (similarity scoring, matching aspects)

**Backend Features:**
- 67+ routes across 11 controllers
- 13 database migrations with full relationships
- 11 Eloquent models with factories
- 2 advanced services (TOS calculations, duplicate detection)
- Comprehensive testing (32+ passing tests)
- PSR-12 code standards (Laravel Pint)
- AI integration (OpenAI, Gemini, Claude via PrismPHP)
- Kebab-case URL standardization

**See detailed documentation:**
- [BACKEND_COMPLETE.md](docs/BACKEND_COMPLETE.md) - Full implementation summary
- [API.md](docs/API.md) - Complete API documentation
- [ROADMAP.md](docs/ROADMAP.md) - Development progress
- [RBAC.md](docs/RBAC.md) - Role and permission details

### ✅ Frontend Complete (100%)

**Fully Implemented:**
- All CRUD interfaces with Inertia.js + React
- TypeScript strict mode support
- Radix UI components (shadcn/ui)
- Consistent UI patterns (page-level padding)
- Dark/light mode support
- Type-safe routing with Wayfinder
- Responsive design (mobile-first)
- Form validation with error handling
- Search and filter functionality
- Pagination components
- Loading states and animations

**Pages Implemented:**
- Dashboard with statistics
- User management (list, create, edit, delete)
- Module management (full CRUD)
- Topic management (hierarchical display)
- Learning objectives (Bloom's taxonomy UI)
- TOS generator (create, edit, list, view)
- TOS calculator (matrix visualization)
- Question bank (search, filter, CRUD)
- Duplicate detection (similarity analysis)
- Exam builder (question management)
- Profile settings (profile, password, appearance)

---

## Tech Stack

### Backend
- **Laravel 12.43.1** - PHP framework with modern features
- **PHP 8.3.28** - Latest PHP version
- **SQLite** - Development database (MySQL/PostgreSQL for production)
- **Laravel Fortify** - Authentication with 2FA support
- **Spatie Laravel Permission** - Role-Based Access Control
- **PrismPHP** - AI integration (OpenAI, Gemini, Anthropic)
- **Laravel Queues** - Background job processing
- **Laravel Pint** - PHP code formatter

### Frontend
- **React 19.0.0** - UI library
- **TypeScript 5.9.3** - Type-safe JavaScript
- **Inertia.js 2.x** - SPA framework without API
- **Tailwind CSS 4.x** - Utility-first CSS
- **shadcn/ui** - Component library (Radix UI primitives)
- **Laravel Wayfinder** - Type-safe routing
- **Vite 6.0** - Build tool and dev server

### Development Tools
- **Laravel Herd** - Local development environment
- **Pest 4.x** - Testing framework with browser testing
- **PHPUnit** - PHP testing
- **Git** - Version control
- **Composer** - PHP dependency manager
- **npm** - JavaScript package manager

### AI Providers
- **OpenAI GPT-4o-mini** - Primary AI provider
- **Google Gemini 3 Flash** - Alternative provider
- **Anthropic Claude** - Backup provider

### Key Features
- ✅ **Fully Implemented Authentication** - Login, register, password reset, 2FA
- ✅ **Complete RBAC System** - 3 roles, 21 permissions
- ✅ **Module Management** - Full CRUD with soft deletes
- ✅ **Hierarchical Topics** - Parent-child relationships
- ✅ **Learning Objectives** - Bloom's taxonomy integration
- ✅ **TOS Generator** - AI-powered question generation
- ✅ **TOS Calculator** - Matrix analysis and balance validation
- ✅ **Question Bank** - Full CRUD with approval workflow
- ✅ **Duplicate Detection** - Levenshtein similarity algorithm
- ✅ **Exam Builder** - Complete exam assembly system
- ✅ **Dark Mode** - Light/dark/system theme support
- ✅ **Type-Safe Routing** - Wayfinder integration
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Consistent UI** - shadcn/ui components throughout

---

## References

Shi, H., & Aryadoust, V. (2022). A systematic review of automated writing evaluation systems. _Education and Information Technologies_, 28(6), 771-795. https://doi.org/10.1007/s10639-022-11200-7

Ramesh, D., & Sanampudi, S. K. (2021). An automated essay scoring system: A systematic literature review. _Artificial Intelligence Review_, 55(3), 2495-2527. https://doi.org/10.1007/s10462-021-10068-2

---

## License

This project is developed for academic purposes.

---

<p align="center">
  <strong>ExamMaster</strong> - Empowering Educators with AI-Powered Assessment Tools
</p>
