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
        Schema::create('analysis_findings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_analysis_id')->constrained()->cascadeOnDelete();
            $table->enum('category', ['seo', 'geo', 'technical', 'content']);
            $table->string('type');
            $table->enum('source', ['rule', 'pagespeed', 'llm'])->default('rule');
            $table->enum('severity', ['critical', 'important', 'improvement']);
            $table->string('title');
            $table->text('description');
            $table->json('evidence')->nullable();
            $table->unsignedTinyInteger('score_impact')->default(0);
            $table->timestamps();

            $table->index(['site_analysis_id', 'category']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analysis_findings');
    }
};
