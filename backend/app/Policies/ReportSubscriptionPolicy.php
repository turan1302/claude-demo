<?php

namespace App\Policies;

use App\Models\ReportSubscription;
use App\Models\User;

class ReportSubscriptionPolicy
{
    public function view(User $user, ReportSubscription $reportSubscription): bool
    {
        return $user->id === $reportSubscription->user_id;
    }

    public function update(User $user, ReportSubscription $reportSubscription): bool
    {
        return $user->id === $reportSubscription->user_id;
    }

    public function delete(User $user, ReportSubscription $reportSubscription): bool
    {
        return $user->id === $reportSubscription->user_id;
    }
}
