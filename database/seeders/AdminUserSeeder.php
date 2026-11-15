<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Support Admin',
                'role' => 'admin',
                'password' => 'Password123', // hashed by the User model cast
                'email_verified_at' => now(),
            ],
        );
    }
}
