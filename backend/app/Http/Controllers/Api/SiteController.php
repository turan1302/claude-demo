<?php

namespace App\Http\Controllers\Api;

use App\Enums\SiteStatus;
use App\Enums\SiteType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Site\StoreSiteRequest;
use App\Http\Resources\SiteAnalysisResource;
use App\Http\Resources\SiteResource;
use App\Models\Site;
use App\Services\Analysis\AnalysisDispatcher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SiteController extends Controller
{
    public function __construct(private readonly AnalysisDispatcher $dispatcher)
    {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $sites = $request->user()->primarySites()->with('latestAnalysis.actionPlans.items')->latest()->get();

        return SiteResource::collection($sites);
    }

    public function store(StoreSiteRequest $request): JsonResponse
    {
        $site = $request->user()->sites()->create([
            'type' => SiteType::Primary,
            'url' => $request->validated('url'),
            'name' => $request->validated('name') ?? parse_url($request->validated('url'), PHP_URL_HOST),
            'status' => SiteStatus::Pending,
        ]);

        $analysis = $this->dispatcher->dispatch($site, version: 1);

        return response()->json([
            'site' => new SiteResource($site),
            'analysis' => new SiteAnalysisResource($analysis),
        ], 202);
    }

    public function show(Request $request, Site $site): SiteResource
    {
        $this->authorize('view', $site);

        $site->load('latestAnalysis.actionPlans.items');

        return new SiteResource($site);
    }

    public function destroy(Request $request, Site $site): JsonResponse
    {
        $this->authorize('delete', $site);

        $site->delete();

        return response()->json(status: 204);
    }

    public function analyze(Request $request, Site $site): JsonResponse
    {
        $this->authorize('update', $site);

        $nextVersion = (int) $site->analyses()->max('version') + 1;
        $analysis = $this->dispatcher->dispatch($site, $nextVersion);

        return response()->json(['analysis' => new SiteAnalysisResource($analysis)], 202);
    }
}
