<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Paymongo\PaymongoClient;

class PaymentController extends Controller
{
    protected PaymongoClient $client;

    public function __construct()
    {
        $this->client = new PaymongoClient(config('paymongo.secret_key'));
    }

    public function createPaymentIntent(Request $request): JsonResponse
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
        ]);

        $plan = Plan::findOrFail($request->plan_id);

        try {
            $paymentIntent = $this->client->paymentIntents->create([
                'amount' => $plan->price,
                'currency' => 'PHP',
                'payment_method_allowed' => ['card', 'gcash', 'paymaya'],
                'description' => "Subscription to {$plan->name} plan",
            ]);

            return response()->json([
                'client_secret' => $paymentIntent->client_secret,
                'payment_intent_id' => $paymentIntent->id,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function handleWebhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $signature = $request->header('Paymongo-Signature');

        try {
            $event = $this->client->webhooks->constructEvent([
                'payload' => $payload,
                'signature_header' => $signature,
                'webhook_secret_key' => config('paymongo.webhook_secret'),
            ]);

            // Handle the event
            switch ($event->type) {
                case 'payment_intent.succeeded':
                    // Payment was successful
                    $paymentIntent = $event->resource;
                    // Update user's subscription status
                    // This would typically update a subscription model
                    break;
                case 'payment_intent.payment_failed':
                    // Payment failed
                    break;
                    // Handle other events as needed
            }

            return response()->json(['status' => 'ok']);
        } catch (\Paymongo\Exceptions\SignatureVerificationException $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
