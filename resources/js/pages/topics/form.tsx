import AppLayout from "@/layouts/app-layout";
import { Head, useForm } from "@inertiajs/react";
import { PageProps } from "@/types";
import { Module, Topic } from "@/types/models";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { store as topicsStore, update as topicsUpdate } from "@/actions/App/Http/Controllers/TopicController";

interface Props extends PageProps {
    module: Module;
    topic?: Topic;
    topics: Topic[]; // For parent selection
}

export default function TopicForm({ module, topic, topics = [] }: Props) {
    const isEditing = !!topic;

    const form = useForm({
        code: topic?.code || "",
        title: topic?.title || "",
        description: topic?.description || "",
        parent_id: topic?.parent_id?.toString() || "",
        hours_allocated: topic?.hours_allocated?.toString() || "",
        weight_percentage: topic?.weight_percentage?.toString() || "",
        is_active: topic?.is_active ?? true,
    });

    const breadcrumbs = [
        { title: "Modules", href: "/modules" },
        { title: module.name, href: `/modules/${module.id}` },
        { title: "Topics", href: `/modules/${module.id}/topics` },
        { title: isEditing ? "Edit Topic" : "Create Topic", href: "#" },
    ];

    // Filter out current topic and its descendants for parent selection
    const availableParents = topics.filter((t) => {
        if (isEditing) {
            // Can't be own parent or descendant
            return t.id !== topic.id && t.parent_id !== topic.id;
        }
        return true;
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            form.put(topicsUpdate.url({ module: module.id, topic: topic.id }), {
                preserveScroll: true,
            });
        } else {
            form.post(topicsStore.url(module.id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? `Edit ${topic.title}` : "Create Topic"} />

            <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isEditing ? "Edit Topic" : "Create Topic"}
                    </h1>
                    <p className="text-muted-foreground">
                        {isEditing ? `Update topic details for ${module.name}` : `Add a new topic to ${module.name}`}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Topic Information</CardTitle>
                            <CardDescription>
                                Enter the details for this topic. Topics can be organized hierarchically.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Topic Code *</Label>
                                    <Input
                                        id="code"
                                        value={form.data.code}
                                        onChange={(e) => form.setData("code", e.target.value)}
                                        placeholder="e.g., T1, T2.1"
                                        required
                                    />
                                    {form.errors.code && (
                                        <p className="text-sm text-destructive">{form.errors.code}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="parent_id">Parent Topic</Label>
                                    <Select
                                        value={form.data.parent_id || "none"}
                                        onValueChange={(value) => form.setData("parent_id", value === "none" ? "" : value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="None (Root Topic)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None (Root Topic)</SelectItem>
                                            {availableParents.map((t) => (
                                                <SelectItem key={t.id} value={t.id.toString()}>
                                                    {t.code} - {t.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Make this a subtopic of another topic
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="title">Topic Title *</Label>
                                <Input
                                    id="title"
                                    value={form.data.title}
                                    onChange={(e) => form.setData("title", e.target.value)}
                                    placeholder="e.g., Introduction to Algebra"
                                    required
                                />
                                {form.errors.title && (
                                    <p className="text-sm text-destructive">{form.errors.title}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={form.data.description}
                                    onChange={(e) => form.setData("description", e.target.value)}
                                    placeholder="Brief description of this topic..."
                                    rows={3}
                                />
                                {form.errors.description && (
                                    <p className="text-sm text-destructive">{form.errors.description}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="hours_allocated">Hours Allocated</Label>
                                    <Input
                                        id="hours_allocated"
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        value={form.data.hours_allocated}
                                        onChange={(e) => form.setData("hours_allocated", e.target.value)}
                                        placeholder="e.g., 4"
                                    />
                                    {form.errors.hours_allocated && (
                                        <p className="text-sm text-destructive">{form.errors.hours_allocated}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="weight_percentage">Weight (%)</Label>
                                    <Input
                                        id="weight_percentage"
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={form.data.weight_percentage}
                                        onChange={(e) => form.setData("weight_percentage", e.target.value)}
                                        placeholder="e.g., 25"
                                    />
                                    {form.errors.weight_percentage && (
                                        <p className="text-sm text-destructive">{form.errors.weight_percentage}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_active">Active Status</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Inactive topics won't appear in TOS generation
                                    </p>
                                </div>
                                <Switch
                                    id="is_active"
                                    checked={form.data.is_active}
                                    onCheckedChange={(checked) => form.setData("is_active", checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-4 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? "Saving..." : isEditing ? "Update Topic" : "Create Topic"}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
