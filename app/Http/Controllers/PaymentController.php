<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreatePaymentIntentRequest;
use App\Http\Requests\ShowPaymentIntentRequest;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
                'metadata' => [
                    'user_id' => (string) $request->user()->id,
                    'plan_id' => (string) $plan->id,
                ],
            ]);

            Payment::create([
                'user_id' => $request->user()->id,
                'plan_id' => $plan->id,
                'paymongo_payment_intent_id' => $paymentIntent->id,
                'status' => 'pending',
                'amount' => $plan->price,
                'currency' => 'PHP',
                'metadata' => [
                    'client_key' => $paymentIntent->client_key,
                ],
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

            match ($event->type) {
                'payment_intent.succeeded' => $this->markPaymentSucceeded($event),
                'payment_intent.payment_failed' => $this->markPaymentFailed($event),
                default => null,
            };

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

        $payment = Payment::query()
            ->where('paymongo_payment_intent_id', $paymentIntentId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        try {
            $paymentIntent = $this->client->paymentIntents->retrieve($payment->paymongo_payment_intent_id);

            return response()->json([
                'status' => $paymentIntent->status,
                'id' => $paymentIntent->id,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function markPaymentSucceeded(object $event): void
    {
        $paymentIntentId = data_get($event, 'resource.id');

        if (! $paymentIntentId) {
            return;
        }

        DB::transaction(function () use ($event, $paymentIntentId) {
            $payment = Payment::query()
                ->where('paymongo_payment_intent_id', $paymentIntentId)
                ->lockForUpdate()
                ->first();

            if (! $payment) {
                return;
            }

            $subscription = Subscription::updateOrCreate(
                ['paymongo_payment_intent_id' => $paymentIntentId],
                [
                    'user_id' => $payment->user_id,
                    'plan_id' => $payment->plan_id,
                    'status' => 'active',
                    'starts_at' => now(),
                    'ends_at' => now()->addMonth(),
                    'cancelled_at' => null,
                ]
            );

            $payment->update([
                'subscription_id' => $subscription->id,
                'status' => 'succeeded',
                'payment_method' => data_get($event, 'resource.payment_method_allowed.0'),
                'paid_at' => now(),
            ]);
        });
    }

    private function markPaymentFailed(object $event): void
    {
        $paymentIntentId = data_get($event, 'resource.id');

        if (! $paymentIntentId) {
            return;
        }

        Payment::query()
            ->where('paymongo_payment_intent_id', $paymentIntentId)
            ->update(['status' => 'failed']);
    }
}
