<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Mengambil kredensial dari environment variable (secure, JANGAN HARDCODE).
     */
    public function run(): void
    {
        // 1. Create Admin User
        $adminUsername = env('ADMIN_USERNAME', 'admin');
        $adminPassword = env('ADMIN_PASSWORD', 'admin123'); // Default fallback for dev only
        $adminName = env('ADMIN_NAME', 'Administrator');

        User::firstOrCreate(
            ['username' => $adminUsername],
            [
                'name' => $adminName,
                'email' => 'admin@provillo.local',
                'password' => Hash::make($adminPassword),
                'role' => 'admin',
            ]
        );

        // 2. Create Owner User
        $ownerUsername = env('OWNER_USERNAME', 'owner');
        $ownerPassword = env('OWNER_PASSWORD', 'owner123'); // Default fallback for dev only
        $ownerName = env('OWNER_NAME', 'Owner Provillo');

        User::firstOrCreate(
            ['username' => $ownerUsername],
            [
                'name' => $ownerName,
                'email' => 'owner@provillo.local',
                'password' => Hash::make($ownerPassword),
                'role' => 'owner',
            ]
        );
    }
}
