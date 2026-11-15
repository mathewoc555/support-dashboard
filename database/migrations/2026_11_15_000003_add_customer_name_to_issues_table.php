<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('issues', 'customer_name')) {
            return;
        }

        Schema::table('issues', function (Blueprint $table) {
            $table->string('customer_name')->default('Unknown customer')->after('id');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('issues', 'customer_name')) {
            return;
        }

        Schema::table('issues', function (Blueprint $table) {
            $table->dropColumn('customer_name');
        });
    }
};
