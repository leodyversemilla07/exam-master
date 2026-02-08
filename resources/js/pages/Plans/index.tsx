import axios from 'axios';
import type { ChangeEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, CreditCard, Landmark, Smartphone } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { createIntent, intent as paymentIntentRoute } from '@/routes/payments';
import { plans as plansRoute } from '@/routes';
import type { BreadcrumbItem, PageProps } from '@/types';
import { Form, Head, usePage } from '@inertiajs/react';

interface Plan {
    id: number;
    name: string;
    price: number;
    features: string[];
}

interface PlansPageProps extends PageProps {
    plans: Plan[];
    paymongo: {
        publicKey: string | null;
    };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Plans', href: plansRoute.url() }];

const currency = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
});

const paymentMethodOptions = [
    { value: 'card', label: 'Card', icon: CreditCard },
    { value: 'gcash', label: 'GCash', icon: Smartphone },
    { value: 'paymaya', label: 'Maya', icon: Landmark },
];

export default function PlansIndex({ plans, paymongo }: PlansPageProps) {
    const { auth } = usePage<PlansPageProps>().props;
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(
        plans.length > 0 ? plans[0].id : null,
    );
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [processing, setProcessing] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const defaultFormValues = useMemo(
        () => ({
            name: auth.user?.name ?? '',
            email: auth.user?.email ?? '',
            phone: '',
            line1: '',
            city: '',
            postalCode: '',
            cardNumber: '',
            cardExpMonth: '',
            cardExpYear: '',
            cardCvc: '',
        }),
        [auth.user?.email, auth.user?.name],
    );
    const [formValues, setFormValues] = useState(defaultFormValues);

    useEffect(() => {
        setFormValues(defaultFormValues);
    }, [defaultFormValues]);

    const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);

    const updateField =
        (field: keyof typeof formValues) => (event: ChangeEvent<HTMLInputElement>) => {
            setFormValues((previous) => ({ ...previous, [field]: event.target.value }));
        };

    const createPaymentMethod = async () => {
        if (!paymongo.publicKey) {
            throw new Error('PayMongo public key is missing.');
        }

        const response = await fetch('https://api.paymongo.com/v1/payment_methods', {
            method: 'POST',
            headers: {
                Authorization: `Basic ${btoa(`${paymongo.publicKey}:`)}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: {
                    attributes: {
                        type: paymentMethod,
                        billing: {
                            name: formValues.name,
                            email: formValues.email,
                            phone: formValues.phone || undefined,
                            address: {
                                line1: formValues.line1 || 'N/A',
                                city: formValues.city || 'N/A',
                                postal_code: formValues.postalCode || '0000',
                                country: 'PH',
                            },
                        },
                        details:
                            paymentMethod === 'card'
                                ? {
                                      card_number: formValues.cardNumber,
                                      exp_month: Number(formValues.cardExpMonth),
                                      exp_year: Number(formValues.cardExpYear),
                                      cvc: formValues.cardCvc,
                                  }
                                : undefined,
                    },
                },
            }),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody?.errors?.[0]?.detail ?? 'Failed to create payment method.');
        }

        const payload = await response.json();
        return payload.data.id as string;
    };

    const attachPaymentIntent = async (
        clientKey: string,
        paymentMethodId: string,
        paymentIntentId?: string | null,
    ) => {
        const resolvedPaymentIntentId = paymentIntentId ?? clientKey.split('_client')[0];

        const response = await fetch(
            `https://api.paymongo.com/v1/payment_intents/${resolvedPaymentIntentId}/attach`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${btoa(`${paymongo.publicKey}:`)}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: {
                        attributes: {
                            client_key: clientKey,
                            payment_method: paymentMethodId,
                            return_url: paymentIntentId
                                ? plansRoute.url({ query: { payment_intent_id: paymentIntentId } })
                                : plansRoute.url(),
                        },
                    },
                }),
            },
        );

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody?.errors?.[0]?.detail ?? 'Failed to attach payment intent.');
        }

        return response.json();
    };

    const handleCheckout = async () => {
        if (!selectedPlan) {
            setStatus('error');
            setStatusMessage('Please select a plan before continuing.');
            return;
        }

        setProcessing(true);
        setStatus('idle');
        setStatusMessage(null);

        try {
            const intentResponse = await axios.post(createIntent.url(), {
                plan_id: selectedPlan.id,
            });

            const { client_key: clientKey, payment_intent_id: paymentIntentId } =
                intentResponse.data;

            if (!clientKey) {
                throw new Error('Unable to create payment intent.');
            }

            const paymentMethodId = await createPaymentMethod();
            const attachResponse = await attachPaymentIntent(
                clientKey,
                paymentMethodId,
                paymentIntentId,
            );

            const statusValue = attachResponse.data.attributes.status;
            const nextAction = attachResponse.data.attributes.next_action;

            if (statusValue === 'awaiting_next_action' && nextAction?.redirect?.url) {
                window.location.href = nextAction.redirect.url;
                return;
            }

            if (statusValue === 'succeeded') {
                setStatus('success');
                setStatusMessage('Payment confirmed. Thank you!');
                return;
            }

            if (statusValue === 'processing') {
                setStatus('success');
                setStatusMessage('Payment is processing. We will update you shortly.');
                return;
            }

            setStatus('error');
            setStatusMessage('Payment requires a new method. Please try again.');
        } catch (error) {
            setStatus('error');
            setStatusMessage(error instanceof Error ? error.message : 'Payment failed.');
        } finally {
            setProcessing(false);
        }
    };

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const statusParam = params.get('status');
        const paymentId = params.get('payment_intent_id');

        if (!statusParam && !paymentId) {
            return;
        }

        if (statusParam === 'success') {
            setStatus('success');
            setStatusMessage('Payment confirmed. Thank you!');
            return;
        }

        if (statusParam === 'processing') {
            setStatus('success');
            setStatusMessage('Payment is processing. We will update you shortly.');
            return;
        }

        if (statusParam === 'failed' || statusParam === 'error') {
            setStatus('error');
            setStatusMessage('Payment failed. Please try again.');
            return;
        }

        if (paymentId) {
            setStatus('success');
            setStatusMessage('Payment submitted. We are verifying the status.');
            void axios
                .get(paymentIntentRoute.url({ query: { payment_intent_id: paymentId } }))
                .then((response) => {
                    const statusValue = response.data?.status as string | undefined;
                    if (!statusValue) {
                        return;
                    }

                    if (['succeeded', 'processing'].includes(statusValue)) {
                        setStatus('success');
                        setStatusMessage(
                            statusValue === 'succeeded'
                                ? 'Payment confirmed. Thank you!'
                                : 'Payment is processing. We will update you shortly.',
                        );
                        return;
                    }

                    setStatus('error');
                    setStatusMessage('Payment failed. Please try again.');
                })
                .catch(() => {
                    setStatus('error');
                    setStatusMessage('Unable to verify payment status. Please try again.');
                });
        }
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Plans" />
            <div className="p-6 lg:p-10">
                <div className="mx-auto max-w-6xl space-y-10">
                    <div className="space-y-3">
                        <Badge variant="outline" className="uppercase tracking-[0.2em]">
                            Plans & Billing
                        </Badge>
                        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                            Upgrade your assessment workflow
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-3xl">
                            Choose a plan that fits your program. Pay securely using PayMongo card
                            or wallet methods.
                        </p>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                {plans.map((plan) => {
                                    const isSelected = plan.id === selectedPlanId;
                                    return (
                                        <Card
                                            key={plan.id}
                                            className={cn(
                                                'border-border/60 transition-all',
                                                isSelected &&
                                                    'border-primary/70 shadow-lg shadow-primary/10',
                                            )}
                                        >
                                            <CardHeader>
                                                <CardTitle className="flex items-center justify-between">
                                                    {plan.name}
                                                    {isSelected && (
                                                        <Badge className="bg-primary text-white">
                                                            Selected
                                                        </Badge>
                                                    )}
                                                </CardTitle>
                                                <CardDescription>
                                                    {currency.format(plan.price / 100)} / month
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <ul className="space-y-3 text-sm text-muted-foreground">
                                                    {plan.features.map((feature) => (
                                                        <li key={feature} className="flex gap-2">
                                                            <CheckCircle2 className="mt-0.5 size-4 text-primary" />
                                                            <span>{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <Button
                                                    type="button"
                                                    variant={isSelected ? 'default' : 'outline'}
                                                    className="w-full"
                                                    onClick={() => setSelectedPlanId(plan.id)}
                                                >
                                                    {isSelected ? 'Selected' : 'Choose Plan'}
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>

                        <Card className="h-fit">
                            <CardHeader>
                                <CardTitle>Checkout</CardTitle>
                                <CardDescription>
                                    Enter billing details and complete your payment.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {!paymongo.publicKey && (
                                    <Alert variant="destructive">
                                        <AlertDescription>
                                            Missing PayMongo public key. Set PAYMONGO_PUBLIC_KEY to
                                            enable payments.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <Form action={plansRoute.url()} method="get" className="space-y-6">
                                    {() => (
                                        <>
                                            <div className="grid gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="name">Full name</Label>
                                                    <Input
                                                        id="name"
                                                        name="name"
                                                        value={formValues.name}
                                                        onChange={updateField('name')}
                                                        placeholder="Jane Doe"
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="email">Email address</Label>
                                                    <Input
                                                        id="email"
                                                        name="email"
                                                        type="email"
                                                        value={formValues.email}
                                                        onChange={updateField('email')}
                                                        placeholder="jane@example.com"
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="phone">Phone number</Label>
                                                    <Input
                                                        id="phone"
                                                        name="phone"
                                                        value={formValues.phone}
                                                        onChange={updateField('phone')}
                                                        placeholder="+63 9xx xxx xxxx"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="line1">Address line</Label>
                                                    <Input
                                                        id="line1"
                                                        name="line1"
                                                        value={formValues.line1}
                                                        onChange={updateField('line1')}
                                                        placeholder="Street, Barangay"
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="city">City</Label>
                                                    <Input
                                                        id="city"
                                                        name="city"
                                                        value={formValues.city}
                                                        onChange={updateField('city')}
                                                        placeholder="Quezon City"
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="postalCode">Postal code</Label>
                                                    <Input
                                                        id="postalCode"
                                                        name="postalCode"
                                                        value={formValues.postalCode}
                                                        onChange={updateField('postalCode')}
                                                        placeholder="1100"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <Label>Payment method</Label>
                                                <div className="grid gap-3">
                                                    {paymentMethodOptions.map((option) => (
                                                        <button
                                                            key={option.value}
                                                            type="button"
                                                            onClick={() =>
                                                                setPaymentMethod(option.value)
                                                            }
                                                            className={cn(
                                                                'flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition',
                                                                paymentMethod === option.value
                                                                    ? 'border-primary/60 bg-primary/5 text-foreground'
                                                                    : 'border-border/60 text-muted-foreground',
                                                            )}
                                                        >
                                                            <span className="flex items-center gap-3">
                                                                <option.icon className="size-4" />
                                                                {option.label}
                                                            </span>
                                                            {paymentMethod === option.value && (
                                                                <Badge className="bg-primary text-white">
                                                                    Selected
                                                                </Badge>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {paymentMethod === 'card' && (
                                                <div className="grid gap-4">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="cardNumber">
                                                            Card number
                                                        </Label>
                                                        <Input
                                                            id="cardNumber"
                                                            name="cardNumber"
                                                            value={formValues.cardNumber}
                                                            onChange={updateField('cardNumber')}
                                                            placeholder="4242 4242 4242 4242"
                                                        />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="cardExpMonth">
                                                            Expiry month
                                                        </Label>
                                                        <Input
                                                            id="cardExpMonth"
                                                            name="cardExpMonth"
                                                            value={formValues.cardExpMonth}
                                                            onChange={updateField('cardExpMonth')}
                                                            placeholder="08"
                                                        />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="cardExpYear">
                                                            Expiry year
                                                        </Label>
                                                        <Input
                                                            id="cardExpYear"
                                                            name="cardExpYear"
                                                            value={formValues.cardExpYear}
                                                            onChange={updateField('cardExpYear')}
                                                            placeholder="2028"
                                                        />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="cardCvc">CVC</Label>
                                                        <Input
                                                            id="cardCvc"
                                                            name="cardCvc"
                                                            value={formValues.cardCvc}
                                                            onChange={updateField('cardCvc')}
                                                            placeholder="123"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {statusMessage && (
                                                <Alert
                                                    variant={
                                                        status === 'error'
                                                            ? 'destructive'
                                                            : 'default'
                                                    }
                                                >
                                                    <AlertDescription>
                                                        {statusMessage}
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            <Button
                                                type="button"
                                                className="w-full"
                                                disabled={
                                                    processing ||
                                                    !selectedPlan ||
                                                    !paymongo.publicKey
                                                }
                                                onClick={handleCheckout}
                                            >
                                                {processing ? (
                                                    <span className="inline-flex items-center gap-2">
                                                        <Spinner className="size-4" /> Processing
                                                    </span>
                                                ) : (
                                                    'Complete payment'
                                                )}
                                            </Button>
                                            <p className="text-xs text-muted-foreground">
                                                You will be redirected to authenticate wallet
                                                payments when required. Use PayMongo test keys in
                                                staging environments.
                                            </p>
                                        </>
                                    )}
                                </Form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
