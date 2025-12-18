# Software Requirements Specification (SRS)
## ExamMaster: AI-Powered Exam Question Generator with Table of Specifications (TOS) Creator

**Version:** 1.0  
**Date:** December 18, 2025

---

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to define the software requirements for **ExamMaster**, an AI-powered system designed to automate the creation of exams and Tables of Specifications (TOS). This document covers the functional and non-functional requirements, system features, and external interface requirements.

### 1.2 Scope
ExamMaster is a web-based application that assists educators in generating balanced and curriculum-aligned exams. The system leverages Artificial Intelligence (AI) to create questions based on specific topics and cognitive levels (Bloom's Taxonomy). It also automatically generates a Table of Specifications (TOS) to ensure the assessment is valid and reliable.

**Key Capabilities:**
*   Automated question generation using AI.
*   TOS generation and management.
*   Question bank management.
*   Exam customization and export (PDF).
*   User management for educators and administrators.

### 1.3 Definitions, Acronyms, and Abbreviations
*   **AI:** Artificial Intelligence
*   **TOS:** Table of Specifications
*   **SRS:** Software Requirements Specification
*   **Bloom's Taxonomy:** A framework for categorizing educational goals.
*   **NLP:** Natural Language Processing

### 1.4 References
*   Shi, H., & Aryadoust, V. (2022). A systematic review of automated writing evaluation systems.
*   Ramesh, D., & Sanampudi, S. K. (2021). An automated essay scoring system: A systematic literature review.

---

## 2. Overall Description

### 2.1 Product Perspective
ExamMaster is a standalone web application. It interacts with external AI services (e.g., OpenAI, Hugging Face) for question generation and uses a local or cloud-based database for storing user and exam data.

### 2.2 Product Functions
*   **User Authentication:** Secure login and registration for educators and admins.
*   **Curriculum Management:** Define subjects, topics, and learning objectives.
*   **Question Generation:** AI-driven creation of questions based on input parameters.
*   **TOS Creation:** Automated matrix generation for exam blueprints.
*   **Exam Assembly:** Compiling questions into a final exam format.
*   **Reporting:** Analytics on question distribution and cognitive levels.

### 2.3 User Classes and Characteristics
*   **Administrator:** Manages system settings, user accounts, and global configurations. Technical proficiency is moderate to high.
*   **Educator (Teacher/Instructor):** The primary user. Creates exams, manages question banks, and generates TOS. Technical proficiency varies.

### 2.4 Operating Environment
*   **Client:** Modern web browser (Chrome, Firefox, Edge, Safari).
*   **Server:** PHP 8.3.28 (Laravel 12.43.1), Node.js 20 LTS.
*   **Database:** SQLite (development), MySQL/PostgreSQL (production).
*   **OS:** Cross-platform (Windows, macOS, Linux).
*   **Development Tools:** Vite 7.3.0, Pest 4.2.0, Laravel Pint 1.26.0.

### 2.5 Assumptions and Dependencies
*   Stable internet connection is required for AI features.
*   Users have basic computer literacy.
*   The AI model provides accurate and relevant content.

---

## 3. System Features

### 3.1 User Management
*   **Description:** Allows users to register, login, and manage their profiles.
*   **Functional Requirements:**
    *   System shall allow users to register with email and password.
    *   System shall support role-based login (Admin, Educator).
    *   System shall allow password resets and profile updates.

### 3.2 Exam Management
*   **Description:** Core functionality for creating and managing exams.
*   **Functional Requirements:**
    *   System shall allow educators to create new exams.
    *   System shall allow selecting subjects and topics for the exam.
    *   System shall allow defining the number of items and difficulty levels.
    *   System shall allow exporting exams to PDF.

### 3.3 TOS Generation
*   **Description:** Automated creation of the Table of Specifications.
*   **Functional Requirements:**
    *   System shall generate a TOS matrix based on selected topics and cognitive levels.
    *   System shall allow manual adjustment of the TOS distribution.
    *   System shall validate that the total number of items matches the exam settings.

### 3.4 Question Bank Management
*   **Description:** Storage and retrieval of exam questions.
*   **Functional Requirements:**
    *   System shall allow adding, editing, and deleting questions.
    *   System shall categorize questions by subject, topic, and cognitive level.
    *   System shall support bulk import/export of questions.

### 3.5 AI Question Generation
*   **Description:** Using AI to generate new questions.
*   **Functional Requirements:**
    *   System shall accept prompts (topic, difficulty) to generate questions.
    *   System shall allow users to review and edit AI-generated questions before saving.

---

## 4. External Interface Requirements

### 4.1 User Interfaces
*   **Dashboard:** Overview of recent exams and statistics.
*   **Exam Creator:** Step-by-step wizard for setting up exams.
*   **TOS View:** Grid/Table view for managing the specification matrix.
*   **Settings Pages:** Profile, password, appearance (dark/light mode).
*   **Responsive Design:** Interface must adapt to desktop and tablet screens.
*   **UI Components:** Built with shadcn/ui and Radix UI for accessibility.

### 4.2 Software Interfaces
*   **Database:** SQLite (development), MySQL/PostgreSQL (production) for data persistence.
*   **AI API:** Interface with AI models (e.g., OpenAI API, Hugging Face) via REST/HTTP.
*   **PDF Engine:** Library for generating downloadable exam documents.
*   **Inertia.js:** For seamless SPA-like navigation without building separate API.
*   **Wayfinder:** Type-safe routing between frontend and backend.

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements
*   System should load the dashboard in under 2 seconds.
*   AI question generation should complete within reasonable time (e.g., < 30 seconds per batch).

### 5.2 Safety Requirements
*   System must implement regular data backups.
*   Fail-safe mechanisms for data integrity during power loss or crash.

### 5.3 Security Requirements
*   Passwords must be hashed using Laravel's built-in Bcrypt hashing.
*   All data transmission must be encrypted via HTTPS.
*   Role-based access control (RBAC) must be enforced on all routes.
*   Two-factor authentication (2FA) support via Laravel Fortify.
*   CSRF protection on all state-changing requests.
*   Session management with secure cookies.

### 5.4 Software Quality Attributes
*   **Usability:** Intuitive interface for non-technical users.
*   **Reliability:** High availability (99.9% uptime target).
*   **Maintainability:** Modular code structure (Laravel/React) for easy updates.
 & Versions
*   **Frontend:** React 19.2.3, TypeScript 5.9.3, Tailwind CSS 4.1.18, shadcn/ui 3.5.1
*   **Backend:** Laravel 12.43.1, PHP 8.3.28
*   **Database:** SQLite (dev), MySQL/PostgreSQL (production)
*   **Authentication:** Laravel Fortify 1.33.0, Laravel Sanctum 4.2.1
*   **Routing:** Laravel Wayfinder 0.1.12, Inertia.js 2.3.3
*   **Testing:** Pest PHP 4.2.0
*   **Dev Tools:** Vite 7.3.0, Laravel Pint 1.26.0, Laravel Boost 1.8+CSS v4, shadcn/ui
*   **Backend:** Laravel 12, PHP 8.3
*   **Database:** MySQL / SQLite
*   **Routing:** Laravel Wayfinder, Inertia.js v2
*   **Testing:** Pest PHP v4
