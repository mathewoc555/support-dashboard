<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Issue;

class IssueCommentController extends Controller
{
    public function store(StoreCommentRequest $request, Issue $issue)
    {
        $data = $request->validated();
        $data['author_name'] = $request->user()->name;
        $comment = $issue->comments()->create($data);

        return (new CommentResource($comment))->response()->setStatusCode(201);
    }
}
