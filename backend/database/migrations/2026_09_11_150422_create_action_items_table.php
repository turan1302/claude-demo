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
        Schema::create('action_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('action_plan_id')->constrained()->cascadeOnDelete();
            $table->foreignId('analysis_finding_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('category', ['seo', 'geo', 'technical', 'content']);
            $table->enum('priority', ['critical', 'important', 'improvement']);
            $table->string('title');
            $table->text('description');
            $table->enum('estimated_impact', ['high', 'medium', 'low']);
            $table->enum('status', ['pending', 'in_progress', 'completed', 'dismissed'])->default('pending');
            $table->unsignedInteger('position')->default(0);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['action_plan_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('action_items');
    }
};
