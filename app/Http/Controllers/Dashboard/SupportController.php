<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Issue;
use Inertia\Inertia;
use Inertia\Response;

class SupportController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard/Support', [
            'categories' => Issue::CATEGORIES,
            'priorities' => Issue::PRIORITIES,
            'statuses' => Issue::STATUSES,
        ]);
    }

    public function show(Issue $issue): Response
    {
        return Inertia::render('Dashboard/SupportIssue', [
            'issueId' => $issue->id,
            'categories' => Issue::CATEGORIES,
            'priorities' => Issue::PRIORITIES,
            'statuses' => Issue::STATUSES,
        ]);
    }
}
