<?php

return [
    /*
    |--------------------------------------------------------------------------
    | PayMongo Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains the configuration for PayMongo payment gateway.
    |
    */

    'secret_key' => env('PAYMONGO_SECRET_KEY'),

    'public_key' => env('PAYMONGO_PUBLIC_KEY'),

    /*
    |--------------------------------------------------------------------------
    | Webhook Secret
    |--------------------------------------------------------------------------
    |
    | The webhook secret key for verifying webhook signatures.
    |
    */

    'webhook_secret' => env('PAYMONGO_WEBHOOK_SECRET'),
];
