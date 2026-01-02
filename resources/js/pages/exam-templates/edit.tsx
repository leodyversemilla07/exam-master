import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { BreadcrumbItem } from '@/types';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { Toggle } from '@/components/ui/toggle';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, ImageIcon, Grid3X3 } from 'lucide-react';
import examTemplates from '@/routes/exam-templates';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Exam Templates', href: examTemplates.index.url() },
    { title: 'Edit Template', href: '#' },
];

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    const addImage = () => {
        const url = window.prompt('URL');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    return (
        <div className="flex flex-wrap gap-2 p-2 border-b bg-muted/20">
            <Toggle
                size="sm"
                pressed={editor.isActive('bold')}
                onPressedChange={() => editor.chain().focus().toggleBold().run()}
            >
                <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('italic')}
                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            >
                <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive({ textAlign: 'left' })}
                onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
            >
                <AlignLeft className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive({ textAlign: 'center' })}
                onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
            >
                <AlignCenter className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive({ textAlign: 'right' })}
                onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
            >
                <AlignRight className="h-4 w-4" />
            </Toggle>
            <Button variant="ghost" size="sm" onClick={addImage} type="button">
                <ImageIcon className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                type="button"
            >
                <Grid3X3 className="h-4 w-4" />
            </Button>
            <div className="w-[1px] h-6 bg-border mx-1" />

            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().insertContent('{{school_name}}').run()} type="button" className="text-xs">
                School Name
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().insertContent('{{exam_title}}').run()} type="button" className="text-xs">
                Title
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().insertContent('{{student_name}}').run()} type="button" className="text-xs">
                Student Name
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().insertContent('{{date}}').run()} type="button" className="text-xs">
                Date
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().insertContent('{{score}}').run()} type="button" className="text-xs">
                Score
            </Button>
        </div>
    );
};

interface ExamTemplate {
    id: number;
    name: string;
    header_content: string | null;
    footer_content: string | null;
    custom_styles: string | null;
}

interface PageProps {
    template: ExamTemplate;
}

export default function Edit({ template }: PageProps) {
    const form = useForm({
        name: template.name,
        header_content: template.header_content || '',
        footer_content: template.footer_content || '',
        custom_styles: template.custom_styles || '',
    });

    const headerEditor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: form.data.header_content,
        onUpdate: ({ editor }) => {
            form.setData('header_content', editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none p-4 min-h-[150px] focus:outline-none',
            },
        },
    });

    const footerEditor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: form.data.footer_content,
        onUpdate: ({ editor }) => {
            form.setData('footer_content', editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none p-4 min-h-[100px] focus:outline-none',
            },
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(examTemplates.update.url(template.id)); // Using simplified id since args handled in index.ts
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Exam Template" />

            <div className="p-4 md:p-6">
                <div className="mx-auto max-w-5xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Edit Template</CardTitle>
                                <CardDescription>
                                    Update your exam layout.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Template Name *</Label>
                                    <Input
                                        id="name"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        placeholder="e.g., Midterm Exam Layout"
                                        required
                                    />
                                    {form.errors.name && (
                                        <p className="text-sm text-destructive">{form.errors.name}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid gap-6 md:grid-cols-2">
                            <Card className="flex flex-col">
                                <CardHeader>
                                    <CardTitle>Header Design</CardTitle>
                                    <CardDescription>
                                        Design the top section of every page.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col">
                                    <div className="border rounded-md shadow-sm overflow-hidden bg-background flex-1 flex flex-col">
                                        <MenuBar editor={headerEditor} />
                                        <EditorContent editor={headerEditor} className="flex-1" />
                                    </div>
                                    {form.errors.header_content && (
                                        <p className="text-sm text-destructive mt-2">{form.errors.header_content}</p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="flex flex-col">
                                <CardHeader>
                                    <CardTitle>Footer Design</CardTitle>
                                    <CardDescription>
                                        Design the bottom section of every page.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col">
                                    <div className="border rounded-md shadow-sm overflow-hidden bg-background flex-1 flex flex-col">
                                        <MenuBar editor={footerEditor} />
                                        <EditorContent editor={footerEditor} className="flex-1" />
                                    </div>
                                    {form.errors.footer_content && (
                                        <p className="text-sm text-destructive mt-2">{form.errors.footer_content}</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={form.processing} size="lg">
                                <Save className="mr-2 h-4 w-4" />
                                {form.processing ? 'Saving...' : 'Update Template'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
