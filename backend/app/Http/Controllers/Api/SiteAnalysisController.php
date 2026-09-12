<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActionPlanResource;
use App\Http\Resources\AnalysisFindingResource;
use App\Http\Resources\SiteAnalysisResource;
use App\Models\Site;
use App\Models\SiteAnalysis;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SiteAnalysisController extends Controller
{
    public function indexForSite(Request $request, Site $site): AnonymousResourceCollection
    {
        $this->authorize('view', $site);

        return SiteAnalysisResource::collection(
            $site->analyses()->orderByDesc('version')->get()
        );
    }

    public function show(Request $request, SiteAnalysis $analysis): SiteAnalysisResource
    {
        $this->authorizeAnalysis($request, $analysis);

        $analysis->load(['findings', 'actionPlans.items']);

        return new SiteAnalysisResource($analysis);
    }

    public function findings(Request $request, SiteAnalysis $analysis): AnonymousResourceCollection
    {
        $this->authorizeAnalysis($request, $analysis);

        $query = $analysis->findings();

        if ($request->filled('category')) {
            $query->where('category', $request->string('category'));
        }

        if ($request->filled('severity')) {
            $query->where('severity', $request->string('severity'));
        }

        return AnalysisFindingResource::collection($query->get());
    }

    public function actionPlan(Request $request, SiteAnalysis $analysis): ActionPlanResource
    {
        $this->authorizeAnalysis($request, $analysis);

        $plan = $analysis->actionPlans()->with('items')->latest()->first();

        abort_if($plan === null, 404, 'Bu analiz için henüz bir aksiyon planı oluşturulmadı.');

        return new ActionPlanResource($plan);
    }

    public function compare(Request $request, SiteAnalysis $analysis, SiteAnalysis $compareTo): JsonResponse
    {
        $this->authorizeAnalysis($request, $analysis);
        $this->authorizeAnalysis($request, $compareTo);

        abort_if($analysis->site_id !== $compareTo->site_id, 422, 'Karşılaştırılan analizler aynı siteye ait olmalı.');

        $analysis->load('findings');
        $compareTo->load('findings');

        $fromTypes = $analysis->findings->pluck('type')->all();
        $toTypes = $compareTo->findings->pluck('type')->all();

        return response()->json([
            'from' => new SiteAnalysisResource($analysis),
            'to' => new SiteAnalysisResource($compareTo),
            'seo_score_delta' => ($compareTo->overall_seo_score ?? 0) - ($analysis->overall_seo_score ?? 0),
            'geo_score_delta' => ($compareTo->overall_geo_score ?? 0) - ($analysis->overall_geo_score ?? 0),
            'resolved_finding_types' => array_values(array_diff($fromTypes, $toTypes)),
            'new_finding_types' => array_values(array_diff($toTypes, $fromTypes)),
        ]);
    }

    private function authorizeAnalysis(Request $request, SiteAnalysis $analysis): void
    {
        abort_unless($analysis->site->user_id === $request->user()->id, 403);
    }
}
