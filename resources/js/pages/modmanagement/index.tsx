import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";

const breadcrumbs = [{ title: "Module Management", href: "/modmanagements" }];

export default function Index() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Module Management" />

            <div className="p-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            Module Management content goes here.
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
