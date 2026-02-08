<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreatePaymentIntentRequest;
use App\Http\Requests\ShowPaymentIntentRequest;
use App\Models\Plan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Paymongo\Exceptions\SignatureVerificationException;
use Paymongo\PaymongoClient;

class PaymentController extends Controller
{
    public function __construct(protected PaymongoClient $client) {}

    public function createPaymentIntent(CreatePaymentIntentRequest $request): JsonResponse
    {
        $planId = $request->validated('plan_id');
        $plan = Plan::query()->findOrFail($planId);

        try {
            $paymentIntent = $this->client->paymentIntents->create([
                'amount' => $plan->price,
                'currency' => 'PHP',
                'payment_method_allowed' => ['card', 'gcash', 'paymaya'],
                'description' => "Subscription to {$plan->name} plan",
            ]);

            return response()->json([
                'client_key' => $paymentIntent->client_key,
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
        } catch (SignatureVerificationException $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function intent(ShowPaymentIntentRequest $request): JsonResponse
    {
        $paymentIntentId = $request->validated('payment_intent_id');

        try {
            $paymentIntent = $this->client->paymentIntents->retrieve($paymentIntentId);

            return response()->json([
                'status' => $paymentIntent->status,
                'id' => $paymentIntent->id,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
