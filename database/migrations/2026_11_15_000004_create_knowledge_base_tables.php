<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('knowledge_base_category', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('knowledge_base', function (Blueprint $table) {
            $table->id();
            $table->foreignId('knowledge_base_category_id')->constrained('knowledge_base_category')->cascadeOnDelete();
            $table->string('title');
            $table->text('problem');
            $table->longText('agent_steps');
            $table->text('customer_response')->nullable();
            $table->json('keywords')->nullable();
            $table->boolean('active')->default(true)->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('knowledge_base');
        Schema::dropIfExists('knowledge_base_category');
    }
};
