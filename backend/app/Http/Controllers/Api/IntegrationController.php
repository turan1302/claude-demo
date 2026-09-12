<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Integration\StoreIntegrationRequest;
use App\Http\Resources\IntegrationResource;
use App\Models\Integration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class IntegrationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return IntegrationResource::collection($request->user()->integrations);
    }

    public function store(StoreIntegrationRequest $request): IntegrationResource
    {
        $integration = $request->user()->integrations()->updateOrCreate(
            ['provider' => $request->validated('provider')],
            ['api_key' => $request->validated('api_key'), 'is_active' => true]
        );

        return new IntegrationResource($integration);
    }

    public function destroy(Request $request, Integration $integration): JsonResponse
    {
        $this->authorize('delete', $integration);

        $integration->delete();

        return response()->json(status: 204);
    }
}
