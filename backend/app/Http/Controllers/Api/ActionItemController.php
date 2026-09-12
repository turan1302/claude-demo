<?php

namespace App\Http\Controllers\Api;

use App\Enums\ActionItemStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\ActionItem\ReorderActionItemRequest;
use App\Http\Requests\ActionItem\UpdateActionItemRequest;
use App\Http\Resources\ActionItemResource;
use App\Models\ActionItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ActionItemController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $userId = $request->user()->id;

        $query = ActionItem::query()
            ->whereHas('actionPlan.siteAnalysis.site', fn ($q) => $q->where('user_id', $userId))
            ->with(['actionPlan.siteAnalysis.site']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->string('priority'));
        }

        if ($request->filled('category')) {
            $query->where('category', $request->string('category'));
        }

        if ($request->filled('site_id')) {
            $query->whereHas('actionPlan.siteAnalysis', fn ($q) => $q->where('site_id', $request->integer('site_id')));
        }

        $items = $query
            ->orderBy('position')
            ->get();

        return ActionItemResource::collection($items);
    }

    public function update(UpdateActionItemRequest $request, ActionItem $actionItem): ActionItemResource
    {
        $this->authorizeActionItem($request, $actionItem);

        $data = $request->validated();

        if (isset($data['status'])) {
            $data['completed_at'] = $data['status'] === ActionItemStatus::Completed->value ? now() : null;
        }

        $actionItem->update($data);

        return new ActionItemResource($actionItem);
    }

    public function reorder(ReorderActionItemRequest $request, ActionItem $actionItem): ActionItemResource
    {
        $this->authorizeActionItem($request, $actionItem);

        $data = $request->validated();
        $data['completed_at'] = ($data['status'] ?? null) === ActionItemStatus::Completed->value ? now() : $actionItem->completed_at;

        $actionItem->update($data);

        return new ActionItemResource($actionItem);
    }

    private function authorizeActionItem(Request $request, ActionItem $actionItem): void
    {
        abort_unless(
            $actionItem->actionPlan->siteAnalysis->site->user_id === $request->user()->id,
            403
        );
    }
}
