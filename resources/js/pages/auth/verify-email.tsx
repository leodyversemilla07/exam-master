import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { dashboard as dashboardRoute } from '@/routes';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <>
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-success">
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <div className="space-y-6 text-center">
                <p className="text-muted-foreground">
                    Email verification is currently disabled. You can proceed to
                    the dashboard.
                </p>

                <Button render={<Link href={dashboardRoute()} />}>
                    Go to Dashboard
                </Button>
            </div>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Verify email',
    description:
        'Please verify your email address by clicking on the link we just emailed to you.',
};
