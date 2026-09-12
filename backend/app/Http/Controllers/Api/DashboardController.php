<?php

namespace App\Http\Controllers\Api;

use App\Enums\ActionItemStatus;
use App\Enums\Priority;
use App\Http\Controllers\Controller;
use App\Models\ActionItem;
use App\Models\Site;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $sites = Site::where('user_id', $userId)->with('latestAnalysis')->get();
        $completedAnalyses = $sites->pluck('latestAnalysis')->filter();

        $criticalPendingCount = ActionItem::query()
            ->whereHas('actionPlan.siteAnalysis.site', fn ($q) => $q->where('user_id', $userId))
            ->where('priority', Priority::Critical)
            ->where('status', ActionItemStatus::Pending)
            ->count();

        return response()->json([
            'total_sites' => $sites->count(),
            'average_seo_score' => $completedAnalyses->isNotEmpty() ? (int) round($completedAnalyses->avg('overall_seo_score')) : null,
            'average_geo_score' => $completedAnalyses->isNotEmpty() ? (int) round($completedAnalyses->avg('overall_geo_score')) : null,
            'critical_pending_action_items' => $criticalPendingCount,
            'sites_by_status' => $sites->groupBy(fn (Site $site) => $site->status->value)->map->count(),
        ]);
    }
}
