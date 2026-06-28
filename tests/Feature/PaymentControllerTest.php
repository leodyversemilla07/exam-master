<?php

use App\Models\Payment;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Contracts\Auth\Authenticatable;
use Paymongo\Entities\PaymentIntent;
use Paymongo\PaymongoClient;
use Paymongo\Services\BaseService;
use Paymongo\Services\PaymentIntentService;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\postJson;

it('creates a payment intent and returns client key', function () {
    /** @var Authenticatable $user */
    $user = User::factory()->createOne();
    $plan = Plan::factory()->create([
        'price' => 19900,
    ]);

    $paymentIntent = Mockery::mock(PaymentIntent::class);
    $paymentIntent->client_key = 'pi_client_key_test';
    $paymentIntent->id = 'pi_test_123';

    $paymentIntentService = Mockery::mock(PaymentIntentService::class);
    $paymentIntentService
        ->shouldReceive('create')
        ->once()
        ->withArgs(function (array $payload) use ($plan, $user) {
            return $payload['amount'] === $plan->price
                && $payload['currency'] === 'PHP'
                && $payload['payment_method_allowed'] === ['card', 'gcash', 'paymaya']
                && $payload['description'] === "Subscription to {$plan->name} plan"
                && $payload['metadata']['user_id'] === (string) $user->id
                && $payload['metadata']['plan_id'] === (string) $plan->id;
        })
        ->andReturn($paymentIntent);

    app()->instance(PaymongoClient::class, new class($paymentIntentService) extends PaymongoClient
    {
        public function __construct(private PaymentIntentService $paymentIntentService)
        {
            parent::__construct('sk_test_dummy');
        }

        public function __get(string $name): BaseService
        {
            if ($name === 'paymentIntents') {
                return $this->paymentIntentService;
            }

            return parent::__get($name);
        }
    });

    actingAs($user);

    postJson(route('payments.create-intent'), ['plan_id' => $plan->id])
        ->assertSuccessful()
        ->assertJson([
            'client_key' => 'pi_client_key_test',
            'payment_intent_id' => 'pi_test_123',
        ]);

    expect(Payment::query()
        ->where('user_id', $user->id)
        ->where('plan_id', $plan->id)
        ->where('paymongo_payment_intent_id', 'pi_test_123')
        ->where('status', 'pending')
        ->exists())->toBeTrue();
});

it('validates the plan id when creating payment intent', function () {
    /** @var Authenticatable $user */
    $user = User::factory()->createOne();
    app()->instance(PaymongoClient::class, new PaymongoClient('sk_test_dummy'));
    actingAs($user);

    postJson(route('payments.create-intent'), ['plan_id' => 99999])
        ->assertUnprocessable();
});
