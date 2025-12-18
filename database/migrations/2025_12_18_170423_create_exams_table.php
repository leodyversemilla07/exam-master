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
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tos_generate_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();

            $table->string('title');
            $table->text('description')->nullable();
            $table->string('exam_type')->default('summative'); // formative, summative, diagnostic
            $table->integer('time_limit')->nullable()->comment('minutes');
            $table->decimal('passing_score', 5, 2)->default(75.00);
            $table->text('instructions')->nullable();
            $table->integer('total_points')->default(0);
            $table->integer('total_items')->default(0);

            $table->string('status')->default('draft'); // draft, published, archived
            $table->boolean('shuffle_questions')->default(false);
            $table->boolean('show_answers')->default(false);
            $table->json('metadata')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exams');
    }
};
