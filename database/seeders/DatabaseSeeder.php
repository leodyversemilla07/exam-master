<?php

namespace Database\Seeders;

use App\Models\Exam;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\ExamItem;
use App\Models\ExamQuestion;
use App\Models\LearningObjective;
use App\Models\Module;
use App\Models\Topic;
use App\Models\TosGenerate;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            PlanSeeder::class,
        ]);

        // Create Super Admin user
        $superAdminUser = User::firstOrCreate(
            ['email' => 'super-admin@example.com'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('password'),
            ]
        );
        $superAdminUser->syncRoles('super-admin');

        // Create Admin user
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'),
            ]
        );
        $adminUser->syncRoles('admin');

        // Create Educator user
        $educatorUser = User::firstOrCreate(
            ['email' => 'educator@example.com'],
            [
                'name' => 'Educator User',
                'password' => bcrypt('password'),
            ]
        );
        $educatorUser->syncRoles('educator');

        // Create realistic modules for educator
        $mathModule = Module::create([
            'code' => 'WEB-DEV-101',
            'name' => 'Web Development Fundamentals',
            'description' => 'This module covers essential web development topics including HTML, CSS, JavaScript, and responsive design principles.',
            'subject_area' => 'Information Technology',
            'grade_level' => 'Grade 11',
            'curriculum_year' => 2024,
            'is_active' => true,
            'created_by' => $educatorUser->id,
        ]);

        $scienceModule = Module::create([
            'code' => 'DB-MGT-201',
            'name' => 'Database Management Systems',
            'description' => 'Introduction to database concepts, SQL, relational database design, normalization, and database administration.',
            'subject_area' => 'Information Technology',
            'grade_level' => 'Grade 12',
            'curriculum_year' => 2024,
            'is_active' => true,
            'created_by' => $educatorUser->id,
        ]);

        $englishModule = Module::create([
            'code' => 'NET-FND-101',
            'name' => 'Networking Fundamentals',
            'description' => 'Introduction to computer networks, TCP/IP, network protocols, network security, and network troubleshooting.',
            'subject_area' => 'Information Technology',
            'grade_level' => 'Grade 11',
            'curriculum_year' => 2024,
            'is_active' => true,
            'created_by' => $educatorUser->id,
        ]);

        // Create realistic TOS for Web Development Module
        TosGenerate::create([
            'module_id' => $mathModule->id,
            'created_by' => $educatorUser->id,
            'grade_level' => 'Grade 11',
            'subject' => 'Information Technology',
            'quarter' => 'Q2',
            'total_items' => 40,
            'learning_objectives' => [
                ['code' => 'WEB-DEV-01', 'description' => 'Create semantic HTML5 markup for web pages'],
                ['code' => 'WEB-DEV-02', 'description' => 'Apply CSS styling and layout techniques'],
                ['code' => 'WEB-DEV-03', 'description' => 'Implement responsive design using media queries'],
                ['code' => 'WEB-DEV-04', 'description' => 'Write JavaScript code for interactive features'],
                ['code' => 'WEB-DEV-05', 'description' => 'Debug and troubleshoot web applications'],
            ],
            'cognitive_levels' => [
                'Remembering' => 8,
                'Understanding' => 8,
                'Applying' => 8,
                'Analyzing' => 8,
                'Evaluating' => 8,
            ],
            'item_distribution' => [
                'Multiple Choice' => 60,
                'Problem Solving' => 25,
                'Essay' => 15,
            ],
            'question_types' => [
                'multiple_choice' => 25,
                'true_false' => 10,
                'essay' => 5,
                'identification' => 0,
            ],
            'difficulty_level' => 'medium',
            'status' => 'draft',
        ]);

        // Create realistic TOS for Database Module
        TosGenerate::create([
            'module_id' => $scienceModule->id,
            'created_by' => $educatorUser->id,
            'grade_level' => 'Grade 12',
            'subject' => 'Information Technology',
            'quarter' => 'Q3',
            'total_items' => 50,
            'learning_objectives' => [
                ['code' => 'DB-MGT-01', 'description' => 'Design normalized database schemas'],
                ['code' => 'DB-MGT-02', 'description' => 'Write SQL queries to retrieve and manipulate data'],
                ['code' => 'DB-MGT-03', 'description' => 'Implement database relationships and constraints'],
                ['code' => 'DB-MGT-04', 'description' => 'Optimize database queries for performance'],
                ['code' => 'DB-MGT-05', 'description' => 'Apply database security and backup strategies'],
            ],
            'cognitive_levels' => [
                'Remembering' => 10,
                'Understanding' => 10,
                'Applying' => 10,
                'Analyzing' => 10,
                'Evaluating' => 10,
            ],
            'item_distribution' => [
                'Multiple Choice' => 50,
                'True/False' => 20,
                'Short Answer' => 20,
                'Essay' => 10,
            ],
            'question_types' => [
                'multiple_choice' => 30,
                'true_false' => 15,
                'essay' => 5,
                'identification' => 0,
            ],
            'difficulty_level' => 'easy',
            'status' => 'draft',
        ]);

        // Create realistic TOS for Networking Module
        TosGenerate::create([
            'module_id' => $englishModule->id,
            'created_by' => $educatorUser->id,
            'grade_level' => 'Grade 11',
            'subject' => 'Information Technology',
            'quarter' => 'Q1',
            'total_items' => 35,
            'learning_objectives' => [
                ['code' => 'NET-FND-01', 'description' => 'Explain OSI and TCP/IP network models'],
                ['code' => 'NET-FND-02', 'description' => 'Configure IP addressing and subnetting'],
                ['code' => 'NET-FND-03', 'description' => 'Identify network hardware and their functions'],
                ['code' => 'NET-FND-04', 'description' => 'Troubleshoot basic network connectivity issues'],
                ['code' => 'NET-FND-05', 'description' => 'Apply network security best practices'],
            ],
            'cognitive_levels' => [
                'Remembering' => 7,
                'Understanding' => 7,
                'Applying' => 7,
                'Analyzing' => 7,
                'Evaluating' => 7,
            ],
            'item_distribution' => [
                'Multiple Choice' => 45,
                'Short Answer' => 30,
                'Essay' => 25,
            ],
            'question_types' => [
                'multiple_choice' => 25,
                'true_false' => 10,
                'essay' => 5,
                'identification' => 0,
            ],
            'difficulty_level' => 'medium',
            'status' => 'draft',
        ]);

        // Create Topics for Web Development Module
        $mathTopic1 = Topic::create([
            'module_id' => $mathModule->id,
            'code' => 'WEB-DEV-T1',
            'title' => 'HTML5 and Semantic Markup',
            'description' => 'Introduction to HTML5 structure, semantic elements, and best practices',
            'order' => 1,
            'hours_allocated' => 8,
            'weight_percentage' => 30,
            'is_active' => true,
        ]);

        $mathTopic2 = Topic::create([
            'module_id' => $mathModule->id,
            'code' => 'WEB-DEV-T2',
            'title' => 'CSS Styling and Layouts',
            'description' => 'Cascading Style Sheets, flexbox, grid, and responsive design',
            'order' => 2,
            'hours_allocated' => 6,
            'weight_percentage' => 25,
            'is_active' => true,
        ]);

        $mathTopic3 = Topic::create([
            'module_id' => $mathModule->id,
            'code' => 'WEB-DEV-T3',
            'title' => 'JavaScript Fundamentals',
            'description' => 'JavaScript programming basics, DOM manipulation, and event handling',
            'order' => 3,
            'hours_allocated' => 6,
            'weight_percentage' => 25,
            'is_active' => true,
        ]);

        // Create Topics for Database Module
        $sciTopic1 = Topic::create([
            'module_id' => $scienceModule->id,
            'code' => 'DB-MGT-T1',
            'title' => 'Database Design and Normalization',
            'description' => 'Entity-relationship modeling, normalization forms, and schema design',
            'order' => 1,
            'hours_allocated' => 5,
            'weight_percentage' => 30,
            'is_active' => true,
        ]);

        $sciTopic2 = Topic::create([
            'module_id' => $scienceModule->id,
            'code' => 'DB-MGT-T2',
            'title' => 'SQL Queries and Transactions',
            'description' => 'Writing complex SQL queries, joins, subqueries, and transaction management',
            'order' => 2,
            'hours_allocated' => 7,
            'weight_percentage' => 40,
            'is_active' => true,
        ]);

        // Create Learning Objectives for Web Development Topics
        LearningObjective::create([
            'topic_id' => $mathTopic1->id,
            'code' => 'WEB-DEV-LO1',
            'objective' => 'Create well-structured HTML5 documents',
            'cognitive_level' => 'applying',
            'order' => 1,
            'assessment_criteria' => 'Student can create valid HTML5 pages with proper semantic elements',
            'is_active' => true,
        ]);

        LearningObjective::create([
            'topic_id' => $mathTopic1->id,
            'code' => 'WEB-DEV-LO2',
            'objective' => 'Implement accessible web forms',
            'cognitive_level' => 'applying',
            'order' => 2,
            'assessment_criteria' => 'Student can create forms with proper labels, validation, and accessibility features',
            'is_active' => true,
        ]);

        LearningObjective::create([
            'topic_id' => $mathTopic2->id,
            'code' => 'WEB-DEV-LO3',
            'objective' => 'Design responsive layouts using CSS',
            'cognitive_level' => 'analyzing',
            'order' => 1,
            'assessment_criteria' => 'Student can create layouts that work across different screen sizes',
            'is_active' => true,
        ]);

        // Create Learning Objectives for Database Topics
        LearningObjective::create([
            'topic_id' => $sciTopic1->id,
            'code' => 'DB-MGT-LO1',
            'objective' => 'Design entity-relationship diagrams',
            'cognitive_level' => 'remembering',
            'order' => 1,
            'assessment_criteria' => 'Student can correctly create ERDs with proper relationships and cardinality',
            'is_active' => true,
        ]);

        LearningObjective::create([
            'topic_id' => $sciTopic1->id,
            'code' => 'DB-MGT-LO2',
            'objective' => 'Normalize database tables to 3NF',
            'cognitive_level' => 'understanding',
            'order' => 2,
            'assessment_criteria' => 'Student can apply normalization rules to eliminate redundancy',
            'is_active' => true,
        ]);

        LearningObjective::create([
            'topic_id' => $sciTopic2->id,
            'code' => 'DB-MGT-LO3',
            'objective' => 'Write complex SQL queries with joins',
            'cognitive_level' => 'evaluating',
            'order' => 1,
            'assessment_criteria' => 'Student can write queries using multiple joins and subqueries',
            'is_active' => true,
        ]);

        // Create sample exam questions
        $question1 = ExamQuestion::create([
            'module_id' => $mathModule->id,
            'created_by' => $educatorUser->id,
            'question_type' => 'multiple_choice',
            'question' => 'Which HTML5 element is used to define a navigation section?',
            'options' => [
                ['key' => 'A', 'text' => '<nav>'],
                ['key' => 'B', 'text' => '<navigation>'],
                ['key' => 'C', 'text' => '<menu>'],
                ['key' => 'D', 'text' => '<navbar>'],
            ],
            'correct_answer' => 'A',
            'explanation' => 'The <nav> element is the semantic HTML5 element for navigation sections',
            'cognitive_level' => 'applying',
            'difficulty' => 'moderate',
            'learning_objective_code' => 'WEB-DEV-LO1',
            'points' => 2,
            'is_approved' => true,
            'is_ai_generated' => false,
        ]);

        $question2 = ExamQuestion::create([
            'module_id' => $mathModule->id,
            'created_by' => $educatorUser->id,
            'question_type' => 'multiple_choice',
            'question' => 'Which CSS property is used to create flexible layouts?',
            'options' => [
                ['key' => 'A', 'text' => 'display: flex'],
                ['key' => 'B', 'text' => 'position: flex'],
                ['key' => 'C', 'text' => 'layout: flex'],
                ['key' => 'D', 'text' => 'flex: true'],
            ],
            'correct_answer' => 'A',
            'explanation' => 'The display: flex property enables the flexbox layout model',
            'cognitive_level' => 'remembering',
            'difficulty' => 'easy',
            'learning_objective_code' => 'WEB-DEV-LO3',
            'points' => 1,
            'is_approved' => true,
            'is_ai_generated' => false,
        ]);

        $question3 = ExamQuestion::create([
            'module_id' => $scienceModule->id,
            'created_by' => $educatorUser->id,
            'question_type' => 'multiple_choice',
            'question' => 'Which SQL clause is used to filter rows in a query?',
            'options' => [
                ['key' => 'A', 'text' => 'HAVING'],
                ['key' => 'B', 'text' => 'FILTER'],
                ['key' => 'C', 'text' => 'WHERE'],
                ['key' => 'D', 'text' => 'SELECT'],
            ],
            'correct_answer' => 'C',
            'explanation' => 'The WHERE clause is used to filter rows based on specified conditions',
            'cognitive_level' => 'remembering',
            'difficulty' => 'easy',
            'learning_objective_code' => 'DB-MGT-LO3',
            'points' => 1,
            'is_approved' => true,
            'is_ai_generated' => false,
        ]);

        $question4 = ExamQuestion::create([
            'module_id' => $scienceModule->id,
            'created_by' => $educatorUser->id,
            'question_type' => 'true_false',
            'question' => 'Normalization is the process of organizing data to reduce redundancy.',
            'correct_answer' => 'true',
            'explanation' => 'Normalization eliminates redundant data and ensures data integrity',
            'cognitive_level' => 'understanding',
            'difficulty' => 'easy',
            'learning_objective_code' => 'DB-MGT-LO2',
            'points' => 1,
            'is_approved' => true,
            'is_ai_generated' => false,
        ]);

        // Create sample exams
        $mathExam = Exam::create([
            'module_id' => $mathModule->id,
            'created_by' => $educatorUser->id,
            'title' => 'Web Development Fundamentals Exam',
            'description' => 'Comprehensive test covering HTML5, CSS, and JavaScript basics',
            'exam_type' => 'summative',
            'time_limit' => 90,
            'passing_score' => 75.00,
            'instructions' => 'Read each question carefully. Choose the best answer for each question.',
            'total_points' => 0,
            'total_items' => 0,
            'status' => 'draft',
            'shuffle_questions' => false,
            'show_answers' => false,
        ]);

        $scienceExam = Exam::create([
            'module_id' => $scienceModule->id,
            'created_by' => $educatorUser->id,
            'title' => 'Database Concepts Quiz',
            'description' => 'Short quiz on database design and SQL fundamentals',
            'exam_type' => 'formative',
            'time_limit' => 45,
            'passing_score' => 70.00,
            'instructions' => 'Choose the best answer for each question.',
            'total_points' => 0,
            'total_items' => 0,
            'status' => 'draft',
            'shuffle_questions' => true,
            'show_answers' => true,
        ]);

        // Add questions to Math Exam
        ExamItem::create([
            'exam_id' => $mathExam->id,
            'exam_question_id' => $question1->id,
            'order' => 1,
            'points' => 2,
        ]);

        ExamItem::create([
            'exam_id' => $mathExam->id,
            'exam_question_id' => $question2->id,
            'order' => 2,
            'points' => 1,
        ]);

        // Add questions to Science Exam
        ExamItem::create([
            'exam_id' => $scienceExam->id,
            'exam_question_id' => $question3->id,
            'order' => 1,
            'points' => 1,
        ]);

        ExamItem::create([
            'exam_id' => $scienceExam->id,
            'exam_question_id' => $question4->id,
            'order' => 2,
            'points' => 1,
        ]);

        // Update exam totals
        $mathExam->update([
            'total_items' => 2,
            'total_points' => 3,
        ]);

        $scienceExam->update([
            'total_items' => 2,
            'total_points' => 2,
        ]);

        // Create additional users with random roles
        User::factory(5)->create()->each(function ($user) {
            $user->assignRole(['super-admin', 'admin', 'educator'][rand(0, 2)]);
        });
    }
}
