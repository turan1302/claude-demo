<?php

use App\Http\Controllers\Api\ActionItemController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompetitorController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\IntegrationController;
use App\Http\Controllers\Api\KeywordController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ReportSubscriptionController;
use App\Http\Controllers\Api\SiteAnalysisController;
use App\Http\Controllers\Api\SiteController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('user', [AuthController::class, 'user']);
    Route::patch('user', [AuthController::class, 'updateProfile']);
    Route::patch('user/password', [AuthController::class, 'updatePassword']);

    Route::get('dashboard/summary', [DashboardController::class, 'summary']);

    Route::get('sites', [SiteController::class, 'index']);
    Route::post('sites', [SiteController::class, 'store']);
    Route::get('sites/{site}', [SiteController::class, 'show']);
    Route::delete('sites/{site}', [SiteController::class, 'destroy']);
    Route::post('sites/{site}/analyze', [SiteController::class, 'analyze']);
    Route::get('sites/{site}/analyses', [SiteAnalysisController::class, 'indexForSite']);

    Route::get('sites/{site}/competitors', [CompetitorController::class, 'index']);
    Route::post('sites/{site}/competitors', [CompetitorController::class, 'store']);
    Route::get('sites/{site}/compare-competitors', [CompetitorController::class, 'compare']);
    Route::delete('competitors/{competitor}', [CompetitorController::class, 'destroy']);

    Route::get('sites/{site}/keywords', [KeywordController::class, 'index']);
    Route::post('sites/{site}/keywords', [KeywordController::class, 'store']);
    Route::delete('keywords/{keyword}', [KeywordController::class, 'destroy']);
    Route::get('keywords/{keyword}/rankings', [KeywordController::class, 'rankings']);
    Route::post('keywords/{keyword}/check', [KeywordController::class, 'check']);

    Route::get('report-subscriptions', [ReportSubscriptionController::class, 'index']);
    Route::post('report-subscriptions', [ReportSubscriptionController::class, 'store']);
    Route::patch('report-subscriptions/{reportSubscription}', [ReportSubscriptionController::class, 'update']);
    Route::delete('report-subscriptions/{reportSubscription}', [ReportSubscriptionController::class, 'destroy']);
    Route::post('report-subscriptions/{reportSubscription}/send-now', [ReportSubscriptionController::class, 'sendNow']);

    Route::get('notifications', [NotificationController::class, 'index']);
    Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('notifications/{notification}/read', [NotificationController::class, 'markRead']);
    Route::post('notifications/read-all', [NotificationController::class, 'readAll']);

    Route::get('analyses/{analysis}', [SiteAnalysisController::class, 'show']);
    Route::get('analyses/{analysis}/findings', [SiteAnalysisController::class, 'findings']);
    Route::get('analyses/{analysis}/action-plan', [SiteAnalysisController::class, 'actionPlan']);
    Route::get('analyses/{analysis}/compare/{compareTo}', [SiteAnalysisController::class, 'compare']);

    Route::get('action-items', [ActionItemController::class, 'index']);
    Route::patch('action-items/{actionItem}', [ActionItemController::class, 'update']);
    Route::patch('action-items/{actionItem}/reorder', [ActionItemController::class, 'reorder']);

    Route::get('integrations', [IntegrationController::class, 'index']);
    Route::post('integrations', [IntegrationController::class, 'store']);
    Route::delete('integrations/{integration}', [IntegrationController::class, 'destroy']);
});
