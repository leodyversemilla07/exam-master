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
        Schema::create('tos_generates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->string('grade_level');
            $table->string('subject');
            $table->string('quarter')->nullable();
            $table->integer('total_items');
            $table->json('learning_objectives'); // Array of objectives with codes
            $table->json('cognitive_levels'); // Distribution by Bloom's taxonomy
            $table->json('item_distribution'); // Number of items per objective/level
            $table->string('difficulty_level')->default('mixed'); // easy, medium, hard, mixed
            $table->string('question_type')->default('multiple_choice'); // multiple_choice, true_false, essay, etc.
            $table->text('additional_instructions')->nullable();
            $table->string('status')->default('draft'); // draft, generating, completed, failed
            $table->text('error_message')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tos_generates');
    }
};
