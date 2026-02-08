<?php

use App\Models\User;
use Illuminate\Contracts\Auth\Authenticatable;
use Paymongo\Entities\PaymentIntent;
use Paymongo\PaymongoClient;
use Paymongo\Services\PaymentIntentService;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\getJson;

it('returns payment intent status', function () {
    /** @var Authenticatable $user */
    $user = User::factory()->createOne();

    $paymentIntent = \Mockery::mock(PaymentIntent::class);
    $paymentIntent->status = 'succeeded';
    $paymentIntent->id = 'pi_test_123';

    $paymentIntentService = \Mockery::mock(PaymentIntentService::class);
    $paymentIntentService
        ->shouldReceive('retrieve')
        ->once()
        ->with('pi_test_123')
        ->andReturn($paymentIntent);

    app()->instance(PaymongoClient::class, new class($paymentIntentService) extends PaymongoClient
    {
        public function __construct(private PaymentIntentService $paymentIntentService)
        {
            parent::__construct('sk_test_dummy');
        }

        public function __get(string $name): \Paymongo\Services\BaseService
        {
            if ($name === 'paymentIntents') {
                return $this->paymentIntentService;
            }

            return parent::__get($name);
        }
    });

    actingAs($user);

    getJson(route('payments.intent', ['payment_intent_id' => 'pi_test_123']))
        ->assertSuccessful()
        ->assertJson([
            'status' => 'succeeded',
            'id' => 'pi_test_123',
        ]);
});

it('requires a payment intent id', function () {
    /** @var Authenticatable $user */
    $user = User::factory()->createOne();

    actingAs($user);

    getJson(route('payments.intent'))
        ->assertUnprocessable();
});
