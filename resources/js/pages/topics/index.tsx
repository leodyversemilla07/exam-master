import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";
import { PageProps } from "@/types";
import { Module, Topic } from "@/types/models";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FolderTree, Edit, Trash2, Clock, Percent } from "lucide-react";
import { index as topicsIndex, create as topicsCreate } from "@/actions/App/Http/Controllers/TopicController";

interface Props extends PageProps {
    module: Module;
    topics: Topic[];
}

export default function TopicsIndex({ module, topics }: Props) {
    const breadcrumbs = [
        { title: "Modules", href: "/modules" },
        { title: module.name, href: `/modules/${module.id}` },
        { title: "Topics", href: topicsIndex.url(module.id) },
    ];

    // Organize topics into a tree structure
    const rootTopics = topics.filter((topic) => !topic.parent_id);

    const renderTopic = (topic: Topic, level: number = 0) => {
        const children = topics.filter((t) => t.parent_id === topic.id);
        const indent = level * 2;

        return (
            <div key={topic.id} className="group">
                <Card className={`mb-2 ${level > 0 ? `ml-${indent * 4}` : ""}`}>
                    <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4 flex-1">
                            {children.length > 0 && (
                                <FolderTree className="h-4 w-4 text-muted-foreground" />
                            )}
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="font-mono text-xs">
                                        {topic.code}
                                    </Badge>
                                    <h3 className="font-semibold">{topic.title}</h3>
                                    {!topic.is_active && (
                                        <Badge variant="secondary">Inactive</Badge>
                                    )}
                                </div>
                                {topic.description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {topic.description}
                                    </p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                    {topic.hours_allocated && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{topic.hours_allocated}h</span>
                                        </div>
                                    )}
                                    {topic.weight_percentage && (
                                        <div className="flex items-center gap-1">
                                            <Percent className="h-3 w-3" />
                                            <span>{topic.weight_percentage}%</span>
                                        </div>
                                    )}
                                    {topic.learning_objectives && topic.learning_objectives.length > 0 && (
                                        <span>{topic.learning_objectives.length} objectives</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/modules/${module.id}/topics/${topic.id}/edit`}>
                                <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {children.length > 0 && (
                    <div className="ml-8 border-l-2 border-border pl-4">
                        {children.map((child) => renderTopic(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Topics - ${module.name}`} />

            <div className="p-4 md:p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Topics</h1>
                        <p className="text-muted-foreground">
                            Manage topics and subtopics for {module.name}
                        </p>
                    </div>
                    <Link href={topicsCreate.url(module.id)}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Topic
                        </Button>
                    </Link>
                </div>

                {rootTopics.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>No Topics Yet</CardTitle>
                            <CardDescription>
                                Get started by creating your first topic for this module.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href={topicsCreate.url(module.id)}>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Topic
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {rootTopics.map((topic) => renderTopic(topic))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
