<?php

namespace App\Http\Controllers;

use App\Models\ExamManagement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExamManagementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index() :Response
    {
        return Inertia::render('exammanagement/index', [

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
    public function show(ExamManagement $examManagement)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ExamManagement $examManagement)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ExamManagement $examManagement)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ExamManagement $examManagement)
    {
        //
    }
}
