<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReportSubscription\StoreReportSubscriptionRequest;
use App\Http\Requests\ReportSubscription\UpdateReportSubscriptionRequest;
use App\Http\Resources\ReportSubscriptionResource;
use App\Jobs\SendPeriodicReportJob;
use App\Models\ReportSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReportSubscriptionController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $subscriptions = $request->user()->reportSubscriptions()->with('site')->latest()->get();

        return ReportSubscriptionResource::collection($subscriptions);
    }

    public function store(StoreReportSubscriptionRequest $request): JsonResponse
    {
        $subscription = $request->user()->reportSubscriptions()->create([
            'site_id' => $request->validated('site_id'),
            'frequency' => $request->validated('frequency'),
            'format' => $request->validated('format'),
            'is_active' => true,
        ]);

        return response()->json(['data' => new ReportSubscriptionResource($subscription->load('site'))], 201);
    }

    public function update(UpdateReportSubscriptionRequest $request, ReportSubscription $reportSubscription): ReportSubscriptionResource
    {
        $this->authorize('update', $reportSubscription);

        $reportSubscription->update($request->validated());

        return new ReportSubscriptionResource($reportSubscription->load('site'));
    }

    public function destroy(Request $request, ReportSubscription $reportSubscription): JsonResponse
    {
        $this->authorize('delete', $reportSubscription);

        $reportSubscription->delete();

        return response()->json(status: 204);
    }

    public function sendNow(Request $request, ReportSubscription $reportSubscription): JsonResponse
    {
        $this->authorize('view', $reportSubscription);

        SendPeriodicReportJob::dispatch($reportSubscription->id);

        return response()->json(status: 202);
    }
}
