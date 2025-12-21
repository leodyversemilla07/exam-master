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
