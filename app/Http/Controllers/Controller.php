<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Contracts\Auth\Authenticatable;

abstract class Controller
{
    /**
     * Get the currently authenticated user.
     */
    protected function user(): User|Authenticatable|null
    {
        return auth()->user();
    }
}
