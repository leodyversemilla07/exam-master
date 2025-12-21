# ExamMaster User Manual

**Version 1.0 | December 2025**

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [User Roles Overview](#user-roles-overview)
4. [Educator User Guide](#educator-user-guide)
5. [Administrator User Guide](#administrator-user-guide)
6. [Super Administrator User Guide](#super-administrator-user-guide)
7. [Common Features](#common-features)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)

---

## Introduction

### What is ExamMaster?

ExamMaster is an intelligent exam management system designed for Filipino educators. It helps you:

- Create curriculum structures (Modules, Topics, Learning Objectives)
- Generate Table of Specifications (TOS) automatically
- Use AI to generate exam questions aligned with Bloom's Taxonomy
- Build comprehensive exams from question banks
- Export exams and TOS to professional PDF formats
- Detect duplicate questions
- Track analytics and performance metrics

### System Requirements

- **Browser:** Modern web browser (Chrome, Firefox, Edge, Safari - latest versions)
- **Internet:** Stable internet connection
- **Screen Resolution:** Minimum 1366x768 recommended

---

## Getting Started

### Registration and Login

1. **Register an Account**
   - Navigate to the registration page
   - Enter your email address
   - Create a secure password (minimum 8 characters)
   - Confirm your password
   - Click "Register"
   - Check your email for verification link
   - Click the verification link to activate your account

2. **Login**
   - Visit the login page
   - Enter your registered email and password
   - Click "Login"
   - You'll be redirected to your dashboard

3. **Password Reset** (if forgotten)
   - Click "Forgot Password?" on login page
   - Enter your registered email
   - Check your email for reset link
   - Click the link and enter new password
   - Confirm new password and submit

### Dashboard Overview

After logging in, you'll see your dashboard with:

- **Statistics Cards:** Total modules, topics, questions, exams
- **Quick Actions:** Buttons to create modules, TOS, exams
- **Recent Activity:** Your latest actions in the system
- **Navigation Menu:** Access to all features based on your role

---

## User Roles Overview

ExamMaster has three user roles with different permissions:

| Feature | Educator | Admin | Super Admin |
|---------|----------|-------|-------------|
| Create & Edit Own Modules | ✅ | ✅ | ✅ |
| Delete Modules | ❌ | ✅ | ✅ |
| Create & Edit TOS | ✅ | ✅ | ✅ |
| Delete TOS | ❌ | ✅ | ✅ |
| Generate AI Questions | ✅ | ✅ | ✅ |
| Create & Edit Exams | ✅ | ✅ | ✅ |
| Delete Exams | ❌ | ✅ | ✅ |
| Approve Questions | ✅ | ✅ | ✅ |
| Bulk Delete Questions | ❌ | ✅ | ✅ |
| View Users | ❌ | ✅ | ✅ |
| Create/Edit Users | ❌ | ✅ | ✅ |
| Delete Users | ❌ | ❌ | ✅ |
| View Analytics | ❌ | ✅ | ✅ |
| System Settings | ❌ | ❌ | ✅ |

---

## Educator User Guide

### Role Description

**Educators** are the primary users who create curriculum content, generate questions, and build exams. You can create and manage your own educational materials but cannot delete resources or manage other users.

---

### 1. Module Management

Modules represent your subjects or courses (e.g., "Mathematics Grade 10", "Science Grade 8").

#### Creating a Module

1. Click **"Modules"** in the sidebar
2. Click **"Create Module"** button
3. Fill in the form:
   - **Module Code:** Unique identifier (e.g., "MATH10")
   - **Module Name:** Full name (e.g., "Mathematics Grade 10")
   - **Description:** Brief overview of the module
   - **Subject Area:** Select from dropdown (Math, Science, English, etc.)
   - **Grade Level:** Select appropriate grade
   - **Curriculum Year:** Academic year
4. Click **"Create Module"**

#### Viewing Modules

- See all your modules in a table with search and filters
- Sort by name, code, subject, or grade level
- View statistics: total topics, learning objectives, questions

#### Editing a Module

1. Find your module in the list
2. Click **"Edit"** button
3. Update any fields
4. Click **"Save Changes"**

---

### 2. Topic Management

Topics are hierarchical divisions within modules (e.g., "Algebra", "Geometry" under Mathematics).

#### Creating a Topic

1. Navigate to **"Topics"** page
2. Click **"Create Topic"** button
3. Fill in the form:
   - **Module:** Select parent module
   - **Topic Code:** Unique code (e.g., "MATH10-ALG")
   - **Topic Name:** Name (e.g., "Algebra")
   - **Description:** Overview of topic content
   - **Parent Topic:** (Optional) Select if this is a subtopic
   - **Hours Allocated:** Teaching hours for this topic
   - **Weight Percentage:** Importance in overall module (0-100%)
   - **Order:** Display order
4. Click **"Create Topic"**

#### Creating Hierarchical Topics

Topics can have parent-child relationships:

**Example Structure:**
```
Mathematics Grade 10 (Module)
├── Algebra (Parent Topic)
│   ├── Linear Equations (Child Topic)
│   ├── Quadratic Equations (Child Topic)
│   └── Polynomials (Child Topic)
├── Geometry (Parent Topic)
│   ├── Triangles (Child Topic)
│   └── Circles (Child Topic)
```

To create a subtopic, select the parent topic in the "Parent Topic" dropdown.

#### Editing Topics

1. Find topic in the list
2. Click **"Edit"**
3. Modify fields as needed
4. Click **"Update Topic"**

---

### 3. Learning Objectives

Learning objectives define what students should achieve and are tagged with Bloom's Taxonomy cognitive levels.

#### Understanding Bloom's Taxonomy

Learning objectives are categorized by cognitive complexity:

1. **Remembering (C1):** Recall facts, terms, concepts
   - Keywords: define, list, identify, name, state
   - Example: "List the parts of a cell"

2. **Understanding (C2):** Explain ideas or concepts
   - Keywords: explain, describe, summarize, classify
   - Example: "Explain the process of photosynthesis"

3. **Applying (C3):** Use information in new situations
   - Keywords: apply, solve, demonstrate, use
   - Example: "Solve quadratic equations using the formula"

4. **Analyzing (C4):** Draw connections, examine relationships
   - Keywords: analyze, compare, contrast, examine
   - Example: "Compare renewable and non-renewable energy"

5. **Evaluating (C5):** Justify decisions or courses of action
   - Keywords: evaluate, judge, critique, assess
   - Example: "Evaluate the effectiveness of different study methods"

6. **Creating (C6):** Produce new or original work
   - Keywords: create, design, construct, develop
   - Example: "Design an experiment to test water quality"

#### Creating Learning Objectives

1. Go to **"Learning Objectives"** page
2. Click **"Create Learning Objective"**
3. Fill in the form:
   - **Module:** Select module
   - **Topic:** Select specific topic
   - **Objective Code:** Unique code (e.g., "MATH10-ALG-LO1")
   - **Description:** Clear statement of what students will achieve
   - **Cognitive Level:** Select appropriate Bloom's level
   - **Assessment Criteria:** How achievement will be measured
4. Click **"Create Objective"**

#### Best Practices

- Write clear, measurable objectives
- Use action verbs aligned with cognitive level
- Ensure objectives cover all Bloom's levels
- Link each objective to specific assessment criteria

---

### 4. Table of Specifications (TOS)

TOS is a blueprint that defines the structure of your exam, ensuring balanced coverage across topics and cognitive levels.

#### Creating a TOS

1. Navigate to **"TOS Generate"** page
2. Click **"Create TOS"** button
3. Configure TOS settings:

**Basic Information:**
   - **Title:** Name of TOS (e.g., "Midterm Exam Blueprint")
   - **Description:** Purpose and details
   - **Module:** Select module

**Topics Selection:**
   - Check topics to include in exam
   - System shows hours and weight for each topic

**Exam Configuration:**
   - **Total Items:** Total number of questions (e.g., 50)
   - **Cognitive Level Distribution:**
     - Remembering: e.g., 15%
     - Understanding: e.g., 20%
     - Applying: e.g., 25%
     - Analyzing: e.g., 20%
     - Evaluating: e.g., 10%
     - Creating: e.g., 10%
     - **Note:** Total must equal 100%

**Question Types:**
   - Multiple Choice: e.g., 60%
   - True/False: e.g., 20%
   - Essay: e.g., 10%
   - Identification: e.g., 10%
   - **Note:** Total must equal 100%

**Difficulty Distribution:**
   - Easy: e.g., 30%
   - Moderate: e.g., 50%
   - Difficult: e.g., 20%
   - **Note:** Total must equal 100%

**AI Configuration:**
   - **AI Provider:** Select OpenAI GPT-4, Google Gemini, or Anthropic Claude
   - **Temperature:** 0.1-1.0 (lower = more focused, higher = more creative)

4. Click **"Generate Questions"**

#### What Happens Next?

- System creates TOS and queues AI question generation job
- Process typically takes 2-10 minutes depending on number of questions
- You can view job status in Queue Monitor
- You'll receive notification when complete (if enabled)

#### Viewing TOS

1. Navigate to **"TOS Generate"** list
2. Click on a TOS to view:
   - **Specification Matrix:** Topics vs. Cognitive Levels grid
   - **Distribution Charts:** Visual representation of balance
   - **Question Allocation:** Breakdown by type and difficulty
   - **Generated Questions:** All AI-created questions
   - **Statistics:** Coverage percentages and recommendations

#### TOS Actions

**Export to PDF:**
- Click **"Export to PDF"** button
- Professional PDF document downloads
- Shows complete specification matrix
- Includes all distribution data

**Clone TOS:**
- Click **"Clone"** button
- Creates duplicate with same settings
- Useful for creating variations (e.g., Set A, Set B)

**Edit TOS:**
- Click **"Edit"** button
- Modify distributions or settings
- Regenerate questions if needed

#### TOS Best Practices

- **Balanced Distribution:** Aim for 10-25% per cognitive level
- **Topic Weighting:** Allocate items based on teaching hours and importance
- **Question Types:** Match types to cognitive levels
  - Lower levels (C1-C2): Multiple Choice, True/False, Identification
  - Higher levels (C3-C6): Essay, Complex Multiple Choice
- **Difficulty:** Include variety to differentiate student abilities
  - Easy: 20-30% (basic recall and understanding)
  - Moderate: 50-60% (application and analysis)
  - Difficult: 10-20% (evaluation and creation)

---

### 5. Question Bank

The question bank stores all your generated and manually created questions.

#### Viewing Questions

1. Navigate to **"Question Bank"** page
2. Browse questions with filters:
   - **Module:** Filter by subject
   - **Question Type:** Multiple Choice, True/False, Essay, Identification
   - **Cognitive Level:** C1-C6
   - **Difficulty:** Easy, Moderate, Difficult
   - **Approval Status:** Pending, Approved, Rejected
3. Use search bar for keyword search

#### Question Details

Each question card shows:
- Question text
- Answer options (for objective questions)
- Correct answer
- Points value
- Cognitive level badge
- Difficulty badge
- Approval status
- Associated topic and module

#### Creating Manual Questions

1. Click **"Create Question"** button
2. Fill in the form:

**Basic Information:**
   - **Module:** Select module
   - **Topic:** Select topic
   - **Learning Objective:** Select objective
   - **Question Type:** Choose type
   - **Cognitive Level:** Select appropriate level
   - **Difficulty:** Easy, Moderate, or Difficult
   - **Points:** Point value for this question

**Question Content:**
   - **Question Text:** Write clear, grammatically correct question
   - **For Multiple Choice:**
     - Option A, B, C, D
     - Mark correct answer
   - **For True/False:**
     - Select correct answer (True or False)
   - **For Essay:**
     - Provide sample answer or grading rubric
   - **For Identification:**
     - Provide correct answer(s)

**Additional Fields:**
   - **Explanation:** Why the answer is correct (optional but recommended)
   - **Hints:** Clues for students (optional)

3. Click **"Create Question"**

#### Editing Questions

1. Find question in list
2. Click **"Edit"** button
3. Modify any fields
4. Click **"Update Question"**

#### Approving AI-Generated Questions

AI-generated questions start with "Pending" status. You should review them:

1. Read question carefully
2. Verify accuracy and appropriateness
3. Check alignment with learning objectives
4. Actions:
   - **Approve:** Question is good, ready for use
   - **Edit then Approve:** Make improvements first
   - **Reject:** Question is not suitable

**Approval Workflow:**
```
Pending → Review → Edit (if needed) → Approve/Reject
```

#### Best Practices for Questions

**Multiple Choice:**
- Use clear, unambiguous language
- Make all distractors plausible
- Avoid "All of the above" or "None of the above"
- Keep options similar in length and structure

**True/False:**
- Avoid absolute words (always, never)
- Make statements clearly true or false, not ambiguous
- Test significant concepts, not trivial facts

**Essay:**
- Provide clear rubric or criteria
- Include sample exemplar answer
- Define expected length

**Identification:**
- Be specific about what to identify
- Accept reasonable alternative answers

---

### 6. Duplicate Detection

AI can sometimes generate similar questions. Use duplicate detection to maintain quality.

#### Checking for Duplicates

1. Navigate to a module's duplicate detection page (from Modules → View Module → Duplicate Detection)
2. System shows duplicate detection interface
3. System analyzes question bank using AI similarity detection
4. View results:
   - **Similarity Score:** 0-100% (higher = more similar)
   - **Question Pairs:** Side-by-side comparison
   - **Recommendations:**
     - 95-100%: Nearly identical, should remove one
     - 85-94%: Very similar, review carefully
     - 70-84%: Moderately similar, probably okay
     - Below 70%: Different enough to keep both

#### Handling Duplicates

1. Review each pair shown
2. Compare questions side-by-side
3. Actions:
   - **Keep Both:** Questions are different enough
   - **Delete One:** Choose which to remove
   - **Merge:** Combine best parts of both
4. Click **"Remove Duplicate"** for selected question

#### When to Run Duplicate Detection

- After generating large batches of AI questions
- Before finalizing exam assembly
- Periodically (monthly) for maintenance

---

### 7. Exam Builder

Create complete exams by selecting questions from your question bank.

#### Creating an Exam

1. Navigate to **"Exam Builder"** page
2. Click **"Create Exam"** button
3. Fill in exam details:

**Basic Information:**
   - **Exam Title:** e.g., "Midterm Examination in Mathematics"
   - **Exam Code:** Unique identifier (e.g., "MATH10-MID-2025")
   - **Description:** Instructions, coverage, etc.
   - **Module:** Select module
   - **Exam Type:** Formative, Summative, or Diagnostic

**Settings:**
   - **Time Limit:** Duration in minutes (optional)
   - **Passing Score:** Percentage required to pass (e.g., 60%)
   - **Instructions:** Student guidelines
   - **Shuffle Questions:** Randomize question order (Yes/No)
   - **Show Answers:** Display answers after completion (Yes/No)

4. Click **"Create Exam"**

#### Adding Questions to Exam

After creating exam:

1. Click **"Add Questions"** button
2. Browse question bank with filters:
   - Module
   - Topic
   - Cognitive Level
   - Difficulty
   - Question Type
3. Click **"+Add"** on questions you want
4. Questions appear in exam builder

#### Organizing Questions

**Reorder Questions:**
- Use drag-and-drop handles to rearrange
- Group by topic or difficulty as desired

**Adjust Point Values:**
- Click point value to edit
- System auto-calculates total points
- Recommended: Higher points for difficult questions

**Remove Questions:**
- Click **"Remove"** button on unwanted questions

**Review Exam:**
- Preview shows student view
- Check question flow and coherence
- Verify instructions and settings

#### Finalizing Exam

1. Review all questions and settings
2. Check total points calculation
3. Click **"Publish Exam"**
4. Exam is now ready for use

#### Exam Actions

**Edit Exam:**
- Modify title, settings, questions
- Re-publish when ready

**Duplicate Exam:**
- Clone exam to create variations (Set A, Set B)
- Useful for multiple sections

**Export to PDF:**
- Click **"Export to PDF"**
- Choose options:
  - **Student Version:** Questions only
  - **Answer Key:** Questions with correct answers
  - **Both:** Separate PDFs
- Professional format ready for printing

**Archive Exam:**
- Mark exam as archived when no longer active
- Keeps historical record without cluttering active list

---

### 8. Analytics

View statistics and insights about your content. Note: Analytics access requires the 'view analytics' permission (typically Admin/Super Admin).

#### Available Analytics

**Dashboard Metrics:**
- Total modules created
- Total topics defined
- Total questions in bank
- Total exams built

**Question Distribution:**
- By cognitive level (pie chart)
- By difficulty (bar chart)
- By question type (donut chart)
- By approval status

**Module Activity:**
- Most used modules
- Questions per module
- Exams per module

**Time-based Trends:**
- Questions created per month
- Exams created per month
- TOS generated per month

#### Exporting Analytics

- Click **"Export to CSV"** for data analysis
- Use in spreadsheet software for custom reports

---

### 9. Queue Monitor

Track background jobs like AI question generation.

#### Viewing Queue Jobs

1. Navigate to **"Queue Monitor"** page
2. See all jobs with:
   - **Job Name:** Type of job
   - **Status:** Pending, Processing, Completed, Failed
   - **Created At:** When job was queued
   - **Completed At:** When job finished
   - **Progress:** Percentage complete (for some jobs)

#### Job Statuses

- **Pending:** Waiting to start
- **Processing:** Currently running
- **Completed:** Successfully finished
- **Failed:** Error occurred

#### Handling Failed Jobs

1. View error message
2. Click **"Retry"** to run again
3. If repeatedly fails, contact administrator

---

### 10. Profile & Settings

Manage your account information.

#### Updating Profile

1. Click your name/avatar in top-right
2. Select **"Profile"** or **"Settings"** → **"Profile"**
3. Edit:
   - Name
   - Email (requires verification if changed)
4. Click **"Save Changes"**

#### Changing Password

1. Click your name/avatar in top-right
2. Select **"Settings"** → **"Password"**
3. Enter current password
4. Enter new password
5. Confirm new password
6. Click **"Update Password"**

---

## Administrator User Guide

### Role Description

**Administrators** have extended permissions beyond educators. You can manage users, delete resources, and access advanced analytics.

### Additional Permissions

Everything an Educator can do, plus:

---

### 1. User Management

Administrators can view and manage user accounts.

#### Viewing Users

1. Navigate to **"Users"** page (requires 'view users' permission)
2. See all system users with:
   - Name
   - Email
   - Role (Educator, Admin, Super Admin)
   - Status (Active, Inactive)
   - Join date
   - Last login

#### Creating New Users

1. Click **"Create User"** button
2. Fill in form:
   - **Name:** Full name
   - **Email:** Valid email address
   - **Password:** Temporary password
   - **Role:** Assign Educator or Admin
   - **Send Welcome Email:** Notify user (recommended)
3. Click **"Create User"**

**Best Practice:** User will receive email with:
- Login credentials
- Link to set new password
- Getting started guide

#### Editing Users

1. Find user in list
2. Click **"Edit"** button
3. Modify:
   - Name
   - Email
   - Role (change between Educator/Admin)
   - Active status (activate/deactivate account)
4. Click **"Update User"**

**Note:** You cannot edit Super Admin users or delete users (only Super Admins can).

---

### 2. Content Deletion

Administrators can delete resources that educators cannot.

#### Deleting Modules

1. Navigate to Modules list
2. Click **"Delete"** on module
3. Confirm deletion
4. **Warning:** Deletes all associated topics, objectives, and questions

#### Deleting TOS

1. Go to TOS list
2. Click **"Delete"**
3. Confirm action
4. **Note:** Questions generated remain in question bank

#### Deleting Exams

1. Find exam in Exam Builder
2. Click **"Delete"**
3. Confirm deletion
4. **Warning:** Cannot undo this action

#### Bulk Delete Questions

1. Navigate to Question Bank
2. Select multiple questions (checkboxes)
3. Click **"Bulk Delete"** button
4. Confirm deletion
5. **Use Case:** Removing entire batches of low-quality AI questions

**Deletion Best Practices:**
- Always verify before deleting
- Consider archiving instead of deleting
- Communicate with content creators before deleting their work
- Backup important data periodically

---

### 3. Advanced Analytics

Administrators have access to organization-wide analytics.

#### User Analytics

- Total users by role
- Active vs. inactive users
- Login frequency
- User registration trends
- Most productive educators

#### Content Analytics

- Total modules, topics, objectives across all users
- Question bank growth over time
- Exam creation rates
- TOS generation statistics

#### System Health

- AI usage statistics (tokens used, API calls)
- Job queue performance
- Failed job rates
- System errors and warnings

#### Export Reports

- Generate CSV exports of all analytics
- Schedule automated weekly/monthly reports
- Share with leadership or stakeholders

---

### 4. Quality Assurance

Administrators should monitor content quality.

#### Review Workflows

**Weekly Tasks:**
- Review newly created questions
- Check duplicate detection results
- Monitor failed AI generation jobs
- Review user feedback

**Monthly Tasks:**
- Audit exam quality
- Review TOS distributions for best practices
- Update system guidelines based on patterns
- Provide feedback to educators

#### Best Practice Guidelines

Share with educators:
- Question writing standards
- TOS distribution recommendations
- Exam design principles
- AI usage guidelines

---

## Super Administrator User Guide

### Role Description

**Super Administrators** have full system access including user deletion, system settings, and all administrator capabilities.

### Additional Permissions

Everything an Administrator can do, plus:

---

### 1. Advanced User Management

#### Deleting Users

1. Navigate to Users list
2. Click **"Delete"** on user
3. Review warning:
   - All user's content will be reassigned or archived
   - Cannot be undone
4. Type "DELETE" to confirm
5. Click **"Delete User Permanently"**

**When to Delete Users:**
- Former employees who left organization
- Duplicate accounts
- Test accounts
- Security concerns

**Before Deleting:**
- Backup their important content
- Reassign ownership if needed
- Document reason for deletion

#### Managing Roles

- Assign or remove Super Admin role
- Promote Educators to Admins
- Demote Admins to Educators

**Security Note:** Be very selective with Super Admin role. Only trusted personnel should have this access.

---

### 2. System Configuration

Access system-wide settings.

#### General Settings

**Application Configuration:**
- System settings in configuration files
- Environment variables

**Email Configuration:**
- SMTP settings
- Email templates
- Sender information

#### AI Configuration

**API Keys:**
- OpenAI API key
- Google Gemini API key
- Anthropic Claude API key
- API rate limits

**AI Parameters:**
- Default temperature settings
- Token limits
- Timeout durations
- Fallback providers

**Cost Management:**
- Set monthly usage limits
- Monitor API costs
- Usage alerts

#### Queue Settings

**Worker Configuration:**
- Number of queue workers
- Timeout settings
- Retry policies
- Maximum attempts

**Queue Monitoring:**
- View real-time queue status
- Purge failed jobs
- Restart workers
- Priority settings

#### Security Settings

**Authentication:**
- Password requirements
- Session timeout
- Two-factor authentication (if enabled)
- Login attempt limits

**Permissions:**
- Default role for new users
- Custom permission creation
- Role hierarchy

---

### 3. Database Management

#### Backups

**Automated Backups:**
- Configure schedule (daily, weekly)
- Retention period
- Storage location
- Backup verification

**Manual Backups:**
- Create on-demand backup
- Download backup files
- Restore from backup

**Best Practice:** 
- Daily automated backups
- Weekly verification
- Monthly off-site storage
- Before major updates, create manual backup

#### Database Optimization

**Maintenance Tasks:**
- Optimize tables
- Clear old logs
- Archive old data
- Rebuild indexes

**Performance Monitoring:**
- Query performance
- Slow query log
- Table sizes
- Connection pools

---

### 4. System Maintenance

#### Updates

**Application Updates:**
- Check for updates
- Review changelog
- Schedule maintenance window
- Test in staging environment
- Deploy to production

**Dependency Updates:**
- PHP packages (Composer)
- JavaScript packages (NPM)
- Security patches
- Database migrations

#### Monitoring

**System Health:**
- Server resources (CPU, memory, disk)
- Application errors
- API response times
- User activity

**Alerts:**
- Configure email/SMS alerts
- Critical error notifications
- Capacity warnings
- Security alerts

#### Logs

**Access Logs:**
- User login history
- Failed login attempts
- Permission violations
- Unusual activity

**Application Logs:**
- Error logs
- Query logs
- Job logs
- API logs

**Log Management:**
- Retention period
- Log rotation
- Archive old logs
- Export for analysis

---

### 5. Advanced Features

#### API Management

**API Access:**
- Generate API tokens
- Set token permissions
- Monitor API usage
- Revoke compromised tokens

**Rate Limiting:**
- Configure request limits
- Set quotas per user/role
- Throttling rules

#### Integrations

**Third-party Services:**
- Learning Management Systems (LMS)
- Student Information Systems (SIS)
- Cloud storage (Google Drive, OneDrive)
- Analytics platforms

**Webhooks:**
- Configure webhook endpoints
- Event triggers
- Payload formats
- Security signatures

#### Custom Development

**Custom Fields:**
- Add metadata to modules, topics, questions
- Define validation rules
- Set visibility

**Custom Reports:**
- Query builder
- Schedule automated reports
- Custom visualizations

---

## Common Features

These features are available to all users regardless of role.

---

### Search Functionality

**Search and Filters:**
- Search available on most list pages (modules, topics, questions, exams)
- Filter by module, topic, cognitive level, difficulty, question type
- Real-time filtering as you type
- Sort by various columns

---

### Export Features

**PDF Exports:**
- TOS specifications
- Exam papers (student version)
- Exam answer keys
- Question bank reports

**CSV Exports:**
- Question lists
- Analytics data
- User lists (Admin/Super Admin)
- Module catalogs

**Print Formatting:**
- Optimized layouts
- Page breaks
- Headers and footers
- Professional appearance

---

### Appearance Settings

Customize your visual preferences:

1. Click your name/avatar in top-right
2. Select **"Settings"** → **"Appearance"**
3. Adjust theme and display preferences as available

---

## Troubleshooting

### Common Issues and Solutions

#### Login Problems

**Problem:** "Invalid credentials" error

**Solutions:**
- Verify email and password are correct
- Check Caps Lock is off
- Use "Forgot Password" to reset
- Contact administrator if account is locked

**Problem:** Email verification link not working

**Solutions:**
- Check spam/junk folder
- Request new verification email
- Ensure link hasn't expired (valid for 24 hours)
- Try copying full link to browser

---

#### Question Generation Issues

**Problem:** AI question generation taking too long

**Solutions:**
- Large TOS (50+ questions) can take 5-10 minutes
- Check Queue Monitor for job status
- Ensure queue worker is running (Admin)
- Refresh page to see if completed

**Problem:** Question generation failed

**Solutions:**
- View error in Queue Monitor
- Common causes:
  - API key expired or invalid (contact Admin)
  - Network timeout (retry job)
  - Invalid TOS configuration (check percentages add to 100%)
- Click "Retry" button
- If repeatedly fails, contact Super Admin

**Problem:** Generated questions are low quality

**Solutions:**
- Review and edit before approving
- Adjust AI temperature (lower = more focused)
- Ensure learning objectives are clear and specific
- Try different AI provider
- Provide more detailed topic descriptions

---

#### Exam Building Issues

**Problem:** Cannot find specific questions

**Solutions:**
- Use filters to narrow results
- Check question approval status
- Verify questions exist for selected module/topic
- Try broader search terms

**Problem:** Exam PDF not generating

**Solutions:**
- Check browser pop-up blocker
- Disable browser extensions temporarily
- Try different browser
- Clear browser cache
- Contact administrator if persists

---

#### Performance Issues

**Problem:** Pages loading slowly

**Solutions:**
- Check internet connection
- Clear browser cache: `Ctrl+Shift+Del`
- Disable unnecessary browser extensions
- Close other tabs/applications
- Try during off-peak hours

**Problem:** System feels unresponsive

**Solutions:**
- Refresh page
- Log out and log back in
- Clear cookies and cache
- Use supported browser (Chrome, Firefox recommended)

---

#### Data Not Saving

**Problem:** Changes not saving

**Solutions:**
- Check for validation errors (red text)
- Ensure all required fields filled
- Check internet connection
- Don't navigate away before save completes
- Look for success/error messages

**Problem:** Duplicate entries appearing

**Solutions:**
- Avoid clicking "Save" multiple times
- Wait for confirmation before resubmitting
- Use duplicate detection tool to clean up
- Report pattern to administrator

---

### Error Messages

#### "Permission Denied"

**Meaning:** You don't have rights for this action

**Action:** 
- Verify your role has appropriate permissions
- Contact administrator to request access
- Ensure you're on correct account

#### "Validation Failed"

**Meaning:** Form data doesn't meet requirements

**Action:**
- Read error messages carefully
- Check required fields marked with *
- Verify format (email, numbers, percentages)
- Ensure percentages total 100% where required

#### "Session Expired"

**Meaning:** You've been inactive too long

**Action:**
- Save work in progress (if possible)
- Log in again
- Re-submit form if needed
- Adjust auto-save settings

#### "Server Error 500"

**Meaning:** Unexpected system error

**Action:**
- Refresh page
- Try again in a few minutes
- Clear browser cache
- Report to administrator with:
  - What you were doing
  - Exact error message
  - Screenshot if possible
  - Time of occurrence

---

### Getting Help

**Self-Service Resources:**
- This user manual
- In-app tooltips (hover over ? icons)
- FAQ section below
- Video tutorials (if available)

**Contact Support:**
- Contact your system administrator
- Report bugs or issues through your institution's IT helpdesk
- Request training sessions as needed

**Reporting Bugs:**

Include in your report:
1. What you were trying to do
2. What you expected to happen
3. What actually happened
4. Steps to reproduce
5. Screenshots if applicable
6. Your browser and version
7. Your role (Educator, Admin, Super Admin)

---

## FAQ

### General Questions

**Q: Is my data secure?**

A: Yes. ExamMaster uses industry-standard security:
- Encrypted data transmission (HTTPS)
- Secure password hashing
- Regular security updates
- Role-based access control
- Regular backups

**Q: Can I access ExamMaster from home?**

A: Yes, from any device with internet and modern browser.

**Q: Is training available?**

A: Contact your administrator about:
- Onboarding sessions for new users
- Workshop trainings
- One-on-one sessions
- Video tutorials

**Q: Can I export my data?**

A: Yes:
- PDFs for TOS and exams
- CSV for analytics and question lists
- Contact Admin for full data export

---

### Modules & Topics

**Q: How many modules can I create?**

A: No limit. Create as many as needed.

**Q: Can I share modules with other educators?**

A: Currently, modules are user-specific. Contact Admin about collaboration features.

**Q: Can I reorganize topic hierarchy?**

A: Yes, edit topics and change parent topic assignment.

**Q: What if I accidentally delete content?**

A: Educators cannot delete (only Admins). If Admin deleted:
- Check with Admin about recovery
- May be in database backup
- Prevention: Always confirm before deleting

---

### Questions & TOS

**Q: How long does AI generation take?**

A: Typically:
- 10-20 questions: 2-5 minutes
- 20-50 questions: 5-10 minutes
- 50+ questions: 10-20 minutes
- Depends on AI provider load and question complexity

**Q: Which AI provider is best?**

A: All produce quality questions:
- **OpenAI GPT-4:** Very reliable, balanced
- **Google Gemini:** Fast, good for large batches
- **Anthropic Claude:** Excellent for complex topics

Try different providers and compare results.

**Q: Can I edit AI-generated questions?**

A: Absolutely! Always review and edit as needed. AI is a starting point.

**Q: What if all questions are pending?**

A: Review and approve them:
- You must approve before using in exams
- Edit any that need improvement
- Reject poor quality questions

**Q: Why do percentages need to total 100%?**

A: System needs exact distribution to allocate questions properly:
- Cognitive levels: 100%
- Question types: 100%
- Difficulty: 100%

**Q: Can I have custom question types?**

A: Currently limited to: Multiple Choice, True/False, Essay, Identification. Contact Super Admin about custom types.

---

### Exams

**Q: Can students take exams online in ExamMaster?**

A: Current version is for exam BUILDING. PDFs are exported for:
- Printing paper exams
- Uploading to your LMS
- Distribution to students

**Q: How do I prevent cheating?**

A: Use exam features:
- Shuffle questions
- Create multiple versions (clone and modify)
- Time limits
- Different sets for different sections

**Q: Can I reuse questions across exams?**

A: Yes! Questions stay in your question bank and can be used in multiple exams.

**Q: What's the difference between exam types?**

- **Formative:** For practice, low stakes, during learning
- **Summative:** For grading, end of unit/course
- **Diagnostic:** To assess prior knowledge, placement

---

### Analytics

**Q: Who can see my analytics?**

- **You:** Your own data
- **Admins:** Organization-wide aggregated data
- **Super Admins:** All system data

**Q: How often are analytics updated?**

A: Real-time. Refresh page for latest data.

**Q: Can I customize analytics reports?**

A: Export CSV and create custom reports in Excel/Google Sheets. Super Admins can configure custom reports.

---

### Technical

**Q: What browsers are supported?**

A: Modern browsers:
- Google Chrome (recommended)
- Mozilla Firefox
- Microsoft Edge
- Safari (Mac)

**Q: Do I need to install anything?**

A: No. ExamMaster is web-based. Just need:
- Internet connection
- Modern browser
- No plugins or downloads required

**Q: Can I use ExamMaster on mobile?**

A: Responsive design works on tablets and phones, but desktop recommended for:
- Complex forms
- Question creation
- Exam building

Mobile good for:
- Reviewing content
- Quick edits
- Monitoring queue

**Q: What if I lose internet connection?**

A: Unsaved work may be lost. Tips:
- Save frequently
- Use auto-save features
- Don't start large tasks on unstable connection
- Work offline in drafts, then paste when stable

---

## Appendix

### Bloom's Taxonomy Quick Reference

| Level | Keywords | Question Stems | Example Activities |
|-------|----------|----------------|-------------------|
| **C1: Remembering** | list, name, identify, define, state, describe | What is...? Who was...? When did...? | List the steps, Name the parts, Define the term |
| **C2: Understanding** | explain, summarize, paraphrase, classify, compare | Explain why... Summarize... What is meant by...? | Explain in own words, Classify examples, Compare concepts |
| **C3: Applying** | apply, solve, use, demonstrate, show | How would you use...? What would result if...? | Solve problems, Demonstrate procedure, Apply rule |
| **C4: Analyzing** | analyze, compare, contrast, examine, categorize | What is the relationship...? Compare and contrast... | Analyze data, Compare approaches, Examine evidence |
| **C5: Evaluating** | evaluate, judge, critique, assess, justify | What is your opinion of...? Evaluate... Judge... | Evaluate solution, Justify decision, Critique argument |
| **C6: Creating** | create, design, construct, develop, formulate | Design a... Develop a plan for... Create a new... | Design experiment, Create model, Develop strategy |

### Question Writing Tips by Type

**Multiple Choice:**
```
Good Example:
Q: What is the function of mitochondria in a cell?
A) Protein synthesis
B) Energy production ✓
C) Waste removal
D) DNA storage

Poor Example:
Q: Mitochondria?
A) Yes
B) Energy ✓
C) Cell
D) All of the above
```

**True/False:**
```
Good Example:
Q: Photosynthesis occurs in the chloroplasts of plant cells.
A: True ✓

Poor Example:
Q: Plants are always green.
A: False ✓ (too absolute, ambiguous)
```

**Essay:**
```
Good Example:
Q: Explain how climate change affects biodiversity. Include at least three specific effects and provide examples. (10 points)

Rubric:
- 3 effects identified (6 points)
- Examples provided (2 points)
- Clear explanation (2 points)

Poor Example:
Q: Write about climate change.
(no rubric, too broad)
```

**Identification:**
```
Good Example:
Q: Identify the process by which plants make their own food using sunlight.
A: Photosynthesis

Poor Example:
Q: Name it.
A: ??? (too vague)
```

### Support Contacts

**Technical Support:**
- Contact your system administrator
- Report issues via your institution's helpdesk
- Hours: As defined by your institution

**Training & Onboarding:**
- Request training sessions from your administrator
- Schedule: Coordinate with your IT department

**Feedback & Suggestions:**
- Contact your system administrator
- Report bugs or suggestions through proper channels

---

### Version History

**Version 1.0 - December 2025**
- Initial release
- Complete user guide for all roles
- Covers all core features

**Planned Updates:**
- Video tutorials
- Interactive walkthroughs
- Advanced tips and tricks
- Integration guides

---

### Glossary

**AI Provider:** Third-party artificial intelligence service (OpenAI, Google, Anthropic) used to generate questions

**Bloom's Taxonomy:** Educational framework classifying learning objectives by cognitive complexity (C1-C6)

**Cognitive Level:** Category of thinking skill required (Remembering, Understanding, Applying, Analyzing, Evaluating, Creating)

**Duplicate Detection:** AI-powered feature to identify similar or identical questions

**Exam Type:** Classification of assessment purpose (Formative, Summative, Diagnostic)

**Learning Objective:** Specific, measurable statement of what students should learn

**Module:** Top-level curriculum organization (subject/course)

**Queue Job:** Background task processed asynchronously (e.g., AI question generation)

**RBAC:** Role-Based Access Control - permission system based on user roles

**Table of Specifications (TOS):** Blueprint defining exam structure and question distribution

**Topic:** Subdivision of a module representing specific content area

**Weight Percentage:** Relative importance or emphasis of a topic in assessment

---

**End of User Manual**

*For the latest version of this manual, visit the ExamMaster documentation portal or contact your system administrator.*

*ExamMaster - Empowering Filipino Educators Through Intelligent Assessment*
