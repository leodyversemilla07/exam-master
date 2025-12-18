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
        Schema::create('exam_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tos_generate_id')->nullable()->constrained('tos_generates')->cascadeOnDelete();
            $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->string('question_type'); // multiple_choice, true_false, essay, short_answer
            $table->text('question');
            $table->json('options')->nullable(); // For multiple choice: [{"key": "A", "text": "..."}]
            $table->string('correct_answer')->nullable(); // For multiple choice/true-false
            $table->text('explanation')->nullable();
            $table->string('cognitive_level'); // remember, understand, apply, analyze, evaluate, create
            $table->string('difficulty'); // easy, medium, hard
            $table->string('learning_objective_code')->nullable();
            $table->integer('points')->default(1);
            $table->boolean('is_approved')->default(false);
            $table->boolean('is_ai_generated')->default(true);
            $table->text('ai_metadata')->nullable(); // Store model used, generation time, etc.
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_questions');
    }
};
