import AppLayout from "@/layouts/app-layout";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";

const breadcrumbs = [{ title: "Dashboard", href: "/dashboard" }];

export default function Dashboard({ auth }: PageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="p-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            Welcome back, {auth.user.name}!
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
