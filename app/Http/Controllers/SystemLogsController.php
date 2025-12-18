<?php

namespace App\Http\Controllers;

use App\Models\SystemLogs;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
class SystemLogsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('systemlogs/index', [

            //

        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(SystemLogs $systemLogs)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(SystemLogs $systemLogs)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SystemLogs $systemLogs)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SystemLogs $systemLogs)
    {
        //
    }
}
