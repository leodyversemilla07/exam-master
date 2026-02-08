<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Paymongo\PaymongoClient;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(PaymongoClient::class, function () {
            $secretKey = (string) (config('paymongo.secret_key') ?? '');

            return new PaymongoClient($secretKey, [
                'timeout' => 30,
                'connect_timeout' => 10,
            ]);
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
    }
}
