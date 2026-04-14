<?php

use App\Models\Plan;
use App\Models\User;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Vite;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

uses(RefreshDatabase::class);

beforeEach(function () {
    Vite::shouldReceive('toHtml')->andReturn('');
    Vite::shouldReceive('preloadedAssets')->andReturn([]);
    Vite::shouldReceive('reactRefresh')->andReturn('');
    Vite::shouldReceive('__invoke')->andReturn('');
});

it('shows plans with paymongo public key on plans page', function () {
    /** @var Authenticatable $user */
    $user = User::factory()->createOne();
    Plan::factory()->createOne();

    config()->set('paymongo.public_key', 'pk_test_123');

    actingAs($user);

    get(route('plans'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('Plans/index')
            ->has('plans', 1)
            ->where('paymongo.publicKey', 'pk_test_123')
        );
});
