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
        Schema::table('exam_items', function (Blueprint $table) {
            // Index for ordering operations within an exam
            $table->index(['exam_id', 'order'], 'exam_items_exam_order_idx');

            // Index for question lookups
            $table->index('exam_question_id', 'exam_items_question_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exam_items', function (Blueprint $table) {
            $table->dropIndex('exam_items_exam_order_idx');
            $table->dropIndex('exam_items_question_idx');
        });
    }
};
