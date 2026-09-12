<?php

namespace App\Http\Controllers\Api;

use App\Enums\SiteStatus;
use App\Enums\SiteType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Competitor\StoreCompetitorRequest;
use App\Http\Resources\SiteAnalysisResource;
use App\Http\Resources\SiteResource;
use App\Models\Site;
use App\Services\Analysis\AnalysisDispatcher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CompetitorController extends Controller
{
    private const MAX_COMPETITORS = 3;

    public function __construct(private readonly AnalysisDispatcher $dispatcher)
    {
    }

    public function index(Request $request, Site $site): AnonymousResourceCollection
    {
        $this->authorize('view', $site);

        $competitors = $site->competitors()->with('latestAnalysis.actionPlans.items')->latest()->get();

        return SiteResource::collection($competitors);
    }

    public function store(StoreCompetitorRequest $request, Site $site): JsonResponse
    {
        $this->authorize('update', $site);

        abort_if(
            $site->competitors()->count() >= self::MAX_COMPETITORS,
            422,
            'Bir siteye en fazla '.self::MAX_COMPETITORS.' rakip eklenebilir.'
        );

        $competitor = $site->user->sites()->create([
            'type' => SiteType::Competitor,
            'parent_site_id' => $site->id,
            'url' => $request->validated('url'),
            'name' => $request->validated('name') ?? parse_url($request->validated('url'), PHP_URL_HOST),
            'status' => SiteStatus::Pending,
        ]);

        $analysis = $this->dispatcher->dispatch($competitor, version: 1);

        return response()->json([
            'site' => new SiteResource($competitor),
            'analysis' => new SiteAnalysisResource($analysis),
        ], 202);
    }

    /**
     * Ana site + rakiplerinin en son analiz skorlarını ve takip edilen
     * anahtar kelime sayılarını yan yana döner. Backlink sayısı v1'de
     * veri kaynağı bağlanmadığı için "coming soon" olarak null döner.
     */
    public function compare(Request $request, Site $site): JsonResponse
    {
        $this->authorize('view', $site);

        $site->load('latestAnalysis', 'keywords');
        $competitors = $site->competitors()->with('latestAnalysis', 'keywords')->get();

        $summarize = function (Site $s) {
            return [
                'site' => new SiteResource($s),
                'keyword_count' => $s->keywords->count(),
                'backlink_count' => null,
            ];
        };

        return response()->json([
            'primary' => $summarize($site),
            'competitors' => $competitors->map($summarize)->values(),
        ]);
    }

    public function destroy(Request $request, Site $competitor): JsonResponse
    {
        $this->authorize('delete', $competitor);

        abort_unless($competitor->type === SiteType::Competitor, 422, 'Bu site bir rakip değil.');

        $competitor->delete();

        return response()->json(status: 204);
    }
}
