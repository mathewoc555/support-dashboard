<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Issue;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Dashboard/Index', [
            'issues' => Issue::latest()->take(10)->get(),
            'comments' => Comment::with('issue:id,customer_name,title')
                ->latest()->take(10)->get(),
        ]);
    }
}
