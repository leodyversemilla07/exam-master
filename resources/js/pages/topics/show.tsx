import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";
import { PageProps } from "@/types";
import { Module, Topic } from "@/types/models";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Clock, Percent, Plus } from "lucide-react";
import { edit as topicsEdit } from "@/actions/App/Http/Controllers/TopicController";
import { index as objectivesIndex } from "@/actions/App/Http/Controllers/LearningObjectiveController";

interface Props extends PageProps {
    module: Module;
    topic: Topic;
}

const cognitiveLevelColors: Record<string, string> = {
    remembering: "bg-primary/10 text-primary border border-primary/20",
    understanding: "bg-success/10 text-success border border-success/20",
    applying: "bg-warning/10 text-warning border border-warning/20",
    analyzing: "bg-info/10 text-info border border-info/20",
    evaluating: "bg-secondary/10 text-secondary border border-secondary/20",
    creating: "bg-destructive/10 text-destructive border border-destructive/20",
};

export default function TopicShow({ module, topic }: Props) {
    const breadcrumbs = [
        { title: "Modules", href: "/modules" },
        { title: module.name, href: `/modules/${module.id}` },
        { title: "Topics", href: `/modules/${module.id}/topics` },
        { title: topic.title, href: `#` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={topic.title} />

            <div className="p-4 md:p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="font-mono">
                                    {topic.code}
                                </Badge>
                                {!topic.is_active && (
                                    <Badge variant="secondary">Inactive</Badge>
                                )}
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">{topic.title}</h1>
                            {topic.description && (
                                <p className="text-muted-foreground mt-1">{topic.description}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={topicsEdit.url({ module: module.id, topic: topic.id })}>
                            <Button>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Topic
                            </Button>
                        </Link>
                        <Button variant="outline">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Hours Allocated
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {topic.hours_allocated ? `${topic.hours_allocated}h` : "N/A"}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Percent className="h-4 w-4" />
                                Weight Percentage
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {topic.weight_percentage ? `${topic.weight_percentage}%` : "N/A"}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Parent Topic</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {topic.parent ? (
                                    <Link
                                        href={`/modules/${module.id}/topics/${topic.parent.id}`}
                                        className="text-primary hover:underline"
                                    >
                                        {topic.parent.title}
                                    </Link>
                                ) : (
                                    <span className="text-muted-foreground">Root Topic</span>
                                )}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Learning Objectives</CardTitle>
                                <CardDescription>
                                    Specific learning outcomes for this topic based on Bloom's Taxonomy
                                </CardDescription>
                            </div>
                            <Link href={objectivesIndex.url({ module: module.id, topic: topic.id })}>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Objective
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {topic.learning_objectives && topic.learning_objectives.length > 0 ? (
                            <div className="space-y-2">
                                {topic.learning_objectives.map((objective) => (
                                    <div
                                        key={objective.id}
                                        className="flex items-start gap-3 p-3 rounded-lg border"
                                    >
                                        <Badge variant="outline" className="font-mono text-xs">
                                            {objective.code}
                                        </Badge>
                                        <div className="flex-1">
                                            <p className="font-medium">{objective.objective}</p>
                                        </div>
                                        <Badge
                                            className={cognitiveLevelColors[objective.cognitive_level]}
                                        >
                                            {objective.cognitive_level}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No learning objectives yet.</p>
                                <Link href={objectivesIndex.url({ module: module.id, topic: topic.id })}>
                                    <Button className="mt-4" variant="outline">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Your First Objective
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {topic.children && topic.children.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Subtopics</CardTitle>
                            <CardDescription>
                                Child topics nested under this topic
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {topic.children.map((child) => (
                                    <Link
                                        key={child.id}
                                        href={`/modules/${module.id}/topics/${child.id}`}
                                        className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="font-mono text-xs">
                                                {child.code}
                                            </Badge>
                                            <span className="font-medium">{child.title}</span>
                                            {child.learning_objectives && child.learning_objectives.length > 0 && (
                                                <span className="text-sm text-muted-foreground">
                                                    ({child.learning_objectives.length} objectives)
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
