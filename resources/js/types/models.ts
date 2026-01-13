export interface Module {
    id: number;
    user_id: number;
    code: string;
    name: string;
    description: string | null;
    pdf_file: string | null;
    subject_area: string;
    grade_level: string;
    curriculum_year: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Topic {
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
    module?: Module;
}

export type CognitiveLevel =
    | 'remembering'
    | 'understanding'
    | 'applying'
    | 'analyzing'
    | 'evaluating'
    | 'creating';

export interface LearningObjective {
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
    deleted_at: string | null;
    topic?: Topic;
}

export interface TosGenerate {
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
    question_types?: {
        multiple_choice: number;
        true_false: number;
        essay: number;
        identification: number;
    };
    item_distribution: Record<string, unknown>;
    difficulty_level: 'easy' | 'medium' | 'hard' | 'mixed';
    language: 'english' | 'filipino';
    additional_instructions: string | null;
    status: 'draft' | 'generating' | 'completed' | 'failed';
    error_message: string | null;
    created_at: string;
    updated_at: string;
    module?: Module;
}

export interface ExamQuestion {
    id: number;
    module_id: number;
    tos_generate_id: number | null;
    question: string;
    question_type:
        | 'multiple_choice'
        | 'true_false'
        | 'essay'
        | 'short_answer'
        | 'identification'
        | 'matching'
        | 'fill_in_the_blanks';
    options: Array<{
        key: string;
        text: string;
    }> | null;
    correct_answer: string | null;
    explanation: string | null;
    cognitive_level: CognitiveLevel;
    difficulty: 'easy' | 'medium' | 'hard';
    learning_objective_code: string | null;
    points: number;
    status: 'draft' | 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
    module?: Module;
}

export interface Exam {
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
    module?: Module;
    questions?: ExamQuestion[];
}

export interface ExamItem {
    id: number;
    exam_id: number;
    question_id: number;
    order: number;
    points: number;
    created_at: string;
    updated_at: string;
    question?: ExamQuestion;
}

export interface ExamSession {
    id: number;
    exam_id: number;
    created_by: number;
    title: string;
    description: string | null;
    access_code: string;
    start_time: string;
    end_time: string;
    time_limit_minutes: number | null;
    max_attempts: number;
    shuffle_questions: boolean;
    shuffle_options: boolean;
    show_results_immediately: boolean;
    show_correct_answers: boolean;
    allow_review: boolean;
    status: 'draft' | 'active' | 'ended';
    allowed_students: string[] | null;
    settings: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
    exam?: Exam;
    creator?: User;
    attempts_count?: number;
}

export interface ExamAttempt {
    id: number;
    exam_session_id: number;
    user_id: number;
    attempt_number: number;
    started_at: string;
    submitted_at: string | null;
    time_spent_seconds: number;
    score: number | null;
    percentage: number | null;
    correct_answers: number;
    total_questions: number;
    status: 'in_progress' | 'submitted' | 'graded';
    ip_address: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
    exam_session?: ExamSession;
    user?: User;
    answers?: StudentAnswer[];
}

export interface StudentAnswer {
    id: number;
    exam_attempt_id: number;
    exam_question_id: number;
    answer: string | null;
    answer_data: Record<string, unknown> | null;
    is_correct: boolean | null;
    points_earned: number;
    max_points: number;
    feedback: string | null;
    is_manually_graded: boolean;
    graded_by: number | null;
    graded_at: string | null;
    time_spent_seconds: number;
    created_at: string;
    updated_at: string;
    question?: ExamQuestion;
}

export interface User {
    id: number;
    name: string;
    email: string;
    organization: string | null;
    email_verified_at: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    roles?: { name: string }[];
}
