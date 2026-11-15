<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('issues', function (Blueprint $table) {
            $table->id();
            $table->string('customer_name');
            $table->string('title');
            $table->text('description');
            $table->enum('priority', ['low', 'medium', 'high'])->index();
            $table->string('category')->index();
            $table->enum('status', ['open', 'in_progress', 'resolved'])->default('open')->index();
            $table->text('summary')->nullable();
            $table->text('suggested_next_action')->nullable();
            $table->enum('summary_status', ['pending', 'ready', 'failed'])->default('pending')->index();
            $table->boolean('needs_attention')->default(false)->index();
            $table->timestamps();
        });

        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('issue_id')->constrained()->cascadeOnDelete();
            $table->string('author_name');
            $table->text('body');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
        Schema::dropIfExists('issues');
    }
};
