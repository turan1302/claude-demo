<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Keyword\StoreKeywordRequest;
use App\Http\Resources\KeywordRankingResource;
use App\Http\Resources\KeywordResource;
use App\Jobs\CheckKeywordRankingJob;
use App\Models\Keyword;
use App\Models\Site;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class KeywordController extends Controller
{
    public function index(Request $request, Site $site): AnonymousResourceCollection
    {
        $this->authorize('view', $site);

        $keywords = $site->keywords()->with('latestRanking')->latest()->get();

        return KeywordResource::collection($keywords);
    }

    public function store(StoreKeywordRequest $request, Site $site): JsonResponse
    {
        $this->authorize('update', $site);

        $keyword = $site->keywords()->create([
            'keyword' => $request->validated('keyword'),
            'location' => $request->validated('location'),
            'is_active' => true,
        ]);

        CheckKeywordRankingJob::dispatch($keyword->id);

        return response()->json(['data' => new KeywordResource($keyword)], 202);
    }

    public function rankings(Request $request, Keyword $keyword): AnonymousResourceCollection
    {
        $this->authorize('view', $keyword);

        $rankings = $keyword->rankings()->orderBy('checked_at')->get();

        return KeywordRankingResource::collection($rankings);
    }

    public function check(Request $request, Keyword $keyword): JsonResponse
    {
        $this->authorize('view', $keyword);

        CheckKeywordRankingJob::dispatch($keyword->id);

        return response()->json(status: 202);
    }

    public function destroy(Request $request, Keyword $keyword): JsonResponse
    {
        $this->authorize('delete', $keyword);

        $keyword->delete();

        return response()->json(status: 204);
    }
}
