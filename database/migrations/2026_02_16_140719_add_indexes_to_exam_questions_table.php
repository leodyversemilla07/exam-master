<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('exam_questions', function (Blueprint $table) {
            // Composite indexes for common filter combinations
            $table->index(['module_id', 'is_approved'], 'exam_questions_module_approved_idx');
            $table->index(['module_id', 'question_type'], 'exam_questions_module_type_idx');
            $table->index(['module_id', 'cognitive_level'], 'exam_questions_module_cognitive_idx');
            $table->index(['module_id', 'difficulty'], 'exam_questions_module_difficulty_idx');

            // Single column indexes for individual filtering
            $table->index('cognitive_level', 'exam_questions_cognitive_idx');
            $table->index('difficulty', 'exam_questions_difficulty_idx');
            $table->index('question_type', 'exam_questions_type_idx');
            $table->index('is_approved', 'exam_questions_approved_idx');

            // Index for TOS-related queries
            $table->index(['tos_generate_id', 'created_at'], 'exam_questions_tos_created_idx');

            // Index for sorting by creation date
            $table->index('created_at', 'exam_questions_created_at_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exam_questions', function (Blueprint $table) {
            $table->dropIndex('exam_questions_module_approved_idx');
            $table->dropIndex('exam_questions_module_type_idx');
            $table->dropIndex('exam_questions_module_cognitive_idx');
            $table->dropIndex('exam_questions_module_difficulty_idx');
            $table->dropIndex('exam_questions_cognitive_idx');
            $table->dropIndex('exam_questions_difficulty_idx');
            $table->dropIndex('exam_questions_type_idx');
            $table->dropIndex('exam_questions_approved_idx');
            $table->dropIndex('exam_questions_tos_created_idx');
            $table->dropIndex('exam_questions_created_at_idx');
        });
    }
};
