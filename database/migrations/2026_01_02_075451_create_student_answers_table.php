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
        Schema::create('student_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_attempt_id')->constrained('exam_attempts')->cascadeOnDelete();
            $table->foreignId('exam_question_id')->constrained('exam_questions')->cascadeOnDelete();
            $table->text('answer')->nullable();
            $table->json('answer_data')->nullable();
            $table->boolean('is_correct')->nullable();
            $table->decimal('points_earned', 8, 2)->default(0);
            $table->decimal('max_points', 8, 2)->default(1);
            $table->text('feedback')->nullable();
            $table->boolean('is_manually_graded')->default(false);
            $table->foreignId('graded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('graded_at')->nullable();
            $table->integer('time_spent_seconds')->default(0);
            $table->timestamps();

            $table->unique(['exam_attempt_id', 'exam_question_id']);
            $table->index('is_correct');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_answers');
    }
};
