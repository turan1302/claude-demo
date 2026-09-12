<?php

namespace App\Policies;

use App\Models\Keyword;
use App\Models\User;

class KeywordPolicy
{
    public function view(User $user, Keyword $keyword): bool
    {
        return $user->id === $keyword->site->user_id;
    }

    public function delete(User $user, Keyword $keyword): bool
    {
        return $user->id === $keyword->site->user_id;
    }
}
