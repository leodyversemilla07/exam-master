import AppLayout from "@/layouts/app-layout";
import { PageProps } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, ClipboardList, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const breadcrumbs = [{ title: "Dashboard", href: "/dashboard" }];

export default function Dashboard({ auth }: PageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="p-4 md:p-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Welcome Section */}
                    <Card>
                        <CardContent className="pt-6">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Welcome back, {auth.user.name}!
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Manage your exam questions and build comprehensive exams
                            </p>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <MessageSquare className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <CardTitle>Question Bank</CardTitle>
                                        <CardDescription>Manage individual exam questions</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-gray-600">
                                    Create, organize, and manage your collection of exam questions. 
                                    Questions are grouped by modules and table of specifications for easy access.
                                </p>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 bg-blue-600 rounded-full" />
                                        Add new questions with different types and difficulty levels
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 bg-blue-600 rounded-full" />
                                        Organize questions by module and TOS
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 bg-blue-600 rounded-full" />
                                        Review and approve AI-generated questions
                                    </li>
                                </ul>
                                <Button asChild className="w-full">
                                    <Link href="/question-bank">
                                        Go to Question Bank
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <ClipboardList className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <CardTitle>Exam Builder</CardTitle>
                                        <CardDescription>Build complete exams from questions</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-gray-600">
                                    Combine questions from your question bank to create complete, ready-to-use exams. 
                                    Set exam settings, configure scoring, and manage exam delivery.
                                </p>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 bg-green-600 rounded-full" />
                                        Create exams by selecting questions from the bank
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 bg-green-600 rounded-full" />
                                        Configure time limits and passing scores
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 bg-green-600 rounded-full" />
                                        Publish exams for student access
                                    </li>
                                </ul>
                                <Button asChild className="w-full">
                                    <Link href="/exam-builder">
                                        Go to Exam Builder
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
