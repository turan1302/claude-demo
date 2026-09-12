<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Bu backend saf bir JSON API'dir; bir "login" web route'u hiç
     * tanımlanmadığından kimliksiz istekler asla bir sayfaya yönlendirilmez,
     * her zaman standart 401 JSON yanıtı döner.
     */
    protected function redirectTo(Request $request): ?string
    {
        return null;
    }
}
