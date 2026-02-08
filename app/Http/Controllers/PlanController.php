<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Inertia\Inertia;

class PlanController extends Controller
{
    public function index()
    {
        return Inertia::render('plans/index', [
            'plans' => Plan::query()->get(['id', 'name', 'price', 'features']),
        ]);
    }
}
