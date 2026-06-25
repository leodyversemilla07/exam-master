import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';

export default function Appearance() {
    return (
        <>
            <Head title="Appearance settings" />

            <div className="space-y-6">
                <HeadingSmall
                    title="Appearance settings"
                    description="Update your account's appearance settings"
                />
                <AppearanceTabs />
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        { title: 'Appearance settings', href: '/settings/appearance' },
    ],
};
