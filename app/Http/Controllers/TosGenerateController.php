<?php

namespace App\Http\Controllers;

 
use App\Models\TosGenerate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TosGenerateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('tosgenerate/index', [

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
    public function show(TosGenerate $tosGenerate)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(TosGenerate $tosGenerate)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TosGenerate $tosGenerate)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TosGenerate $tosGenerate)
    {
        //
    }
}
