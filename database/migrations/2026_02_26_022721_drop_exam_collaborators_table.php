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
        Schema::dropIfExists('exam_collaborators');
    }

    public function down(): void
    {
        Schema::create('exam_collaborators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role')->default('editor');
            $table->boolean('can_delete')->default(false);
            $table->timestamps();
            $table->unique(['exam_id', 'user_id']);
        });
    }
};
