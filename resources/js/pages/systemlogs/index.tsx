import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";

const breadcrumbs = [{ title: "System Logs", href: "/systemlogss" }];

export default function Index() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Logs" />

            <div className="p-4 md:p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="overflow-hidden bg-card shadow-sm sm:rounded-lg">
                        <div className="p-6 text-foreground">
                            System Logs content goes here.
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
