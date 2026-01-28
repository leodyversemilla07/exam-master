---
name: exam-frontend-development
description: Build React components and UI for the exam management system using Inertia.js and Tailwind CSS
---

# Exam Frontend Development

## When to use this skill

Use this skill when building frontend components for the exam management system, including:
- Creating React components with Inertia.js
- Building exam interfaces and question displays
- Implementing forms and user interactions
- Styling with Tailwind CSS
- Managing component state and data flow
- Creating responsive layouts for exams

## Tech Stack

This application uses:
- **React 19** with TypeScript
- **Inertia.js v2** for SPA-like experience
- **Tailwind CSS v4** for utility-first styling
- **@inertiajs/react** for React integration
- **Shadcn/ui** components (Radix UI primitives)
- **Lucide React** for icons
- **TanStack Table** for data tables
- **TipTap** for rich text editing
- **Recharts** for data visualization
- **React Day Picker** for date selection
- **Next Themes** for dark mode support
- **Sonner** for toast notifications
- **Class Variance Authority** for component variants
- **Tailwind Merge** for conditional styling

## UI Component Libraries

### Shadcn/ui Components
Pre-built accessible components using Radix UI primitives:

```tsx
import { Button } from '@/Components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/Components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table'

// Usage
<Button variant="default" size="sm">Click me</Button>
<Card>
    <CardHeader>
        <CardTitle>Exam Results</CardTitle>
    </CardHeader>
    <CardContent>
        <p>Your score: 85%</p>
    </CardContent>
</Card>
```

### TanStack Table
Powerful data table component for exam results and analytics:

```tsx
import { useReactTable, getCoreRowModel, getSortedRowModel, ColumnDef } from '@tanstack/react-table'

interface ExamResult {
    student_name: string
    score: number
    completed_at: string
    status: string
}

const columns: ColumnDef<ExamResult>[] = [
    {
        accessorKey: 'student_name',
        header: 'Student',
    },
    {
        accessorKey: 'score',
        header: 'Score',
        cell: ({ getValue }) => `${getValue<number>()}%`,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => (
            <Badge variant={getValue() === 'passed' ? 'default' : 'destructive'}>
                {getValue<string>()}
            </Badge>
        ),
    },
]

export function ExamResultsTable({ results }: { results: ExamResult[] }) {
    const table = useReactTable({
        data: results,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    return (
        <Table>
            <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                            <TableHead key={header.id}>
                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                        ))}
                    </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {table.getRowModel().rows.map(row => (
                    <TableRow key={row.id}>
                        {row.getVisibleCells().map(cell => (
                            <TableCell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
```

### TipTap Rich Text Editor
For essay questions and content creation:

```tsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import TextAlign from '@tiptap/extension-text-align'

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Table.configure({ resizable: true }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    if (!editor) return null

    return (
        <div className="border rounded-lg">
            <div className="border-b p-2 flex gap-2">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-1 rounded ${editor.isActive('bold') ? 'bg-blue-100' : ''}`}
                >
                    <BoldIcon className="h-4 w-4" />
                </button>
                {/* More toolbar buttons */}
            </div>
            <EditorContent editor={editor} className="p-4 min-h-50" />
        </div>
    )
}
```

### Recharts for Data Visualization
Charts for exam analytics and performance metrics:

```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
    { name: 'Question 1', correct: 85, incorrect: 15 },
    { name: 'Question 2', correct: 92, incorrect: 8 },
    { name: 'Question 3', correct: 78, incorrect: 22 },
]

export function QuestionPerformanceChart() {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="correct" fill="#22c55e" name="Correct %" />
                <Bar dataKey="incorrect" fill="#ef4444" name="Incorrect %" />
            </BarChart>
        </ResponsiveContainer>
    )
}
```

## Dark Mode Support

Using Next Themes for seamless dark mode switching:

```tsx
// In app root (resources/js/app.tsx)
import { ThemeProvider } from 'next-themes'

export default function App({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
        </ThemeProvider>
    )
}

// Theme toggle component
import { useTheme } from 'next-themes'
import { MoonIcon, SunIcon } from 'lucide-react'

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
            <SunIcon className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
```

### Dark Mode Styling
Tailwind CSS automatically handles dark mode with the `dark:` prefix:

```tsx
// Component with dark mode support
export function Card({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
            {children}
        </div>
    )
}

// Text colors that adapt to theme
<p className="text-gray-900 dark:text-gray-100">
    This text changes color based on the theme
</p>
```

## Toast Notifications

Using Sonner for beautiful, accessible toast notifications:

```tsx
// In app root (add Toaster component)
import { Toaster } from 'sonner'

export default function App({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <Toaster position="top-right" richColors />
        </>
    )
}

// Usage throughout the app
import { toast } from 'sonner'

// Success notifications
toast.success('Exam submitted successfully!')

// Error notifications
toast.error('Failed to save answer. Please try again.')

// Info notifications
toast.info('Your session will expire in 5 minutes')

// Custom notifications with actions
toast('Exam completed!', {
    description: 'Your score: 85%',
    action: {
        label: 'View Results',
        onClick: () => router.visit('/results'),
    },
})

// Loading states
const promise = someAsyncOperation()
toast.promise(promise, {
    loading: 'Saving answer...',
    success: 'Answer saved!',
    error: 'Failed to save answer',
})
```

## Directory Structure

```
resources/
├── js/
│   ├── actions/         # Wayfinder-generated route actions
│   ├── components/      # Reusable React components
│   │   ├── ui/          # Shadcn/ui components
│   │   └── ...          # Custom components
│   ├── hooks/           # Custom React hooks
│   ├── layouts/         # Layout components
│   ├── lib/             # Utility functions and libraries
│   ├── pages/           # Inertia.js page components
│   │   ├── analytics/   # Analytics pages
│   │   ├── auth/        # Authentication pages
│   │   ├── dashboard.tsx
│   │   ├── exam-builder/ # Exam creation pages
│   │   ├── modules/     # Module management pages
│   │   ├── question-bank/ # Question management pages
│   │   ├── student/     # Student portal pages
│   │   └── ...
│   ├── routes/          # Route definitions
│   ├── types/           # TypeScript type definitions
│   ├── wayfinder/       # Wayfinder-generated files
│   ├── app.tsx          # Main app component
│   └── bootstrap.ts     # App bootstrap
└── css/                 # Tailwind CSS styles
```

## Component Structure

### Page Components (Inertia Pages)
Located in `resources/js/Pages/`:

```tsx
import { Head } from '@inertiajs/react'
import { Button } from '@/Components/ui/button'

interface Exam {
    id: number
    title: string
    description: string
    duration_minutes: number
    questions: Question[]
}

export default function ExamShow({ exam }: { exam: Exam }) {
    return (
        <>
            <Head title={exam.title} />
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto py-8 px-4">
                    <ExamHeader exam={exam} />
                    <ExamContent exam={exam} />
                </div>
            </div>
        </>
    )
}
```

### Reusable Components
Located in `resources/js/Components/`:

```tsx
// Button component with variants
export function Button({
    children,
    variant = 'primary',
    size = 'md',
    ...props
}: ButtonProps) {
    const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500",
        danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500"
    }

    const sizes = {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg"
    }

    return (
        <button
            className={`${baseClasses} ${variants[variant]} ${sizes[size]}`}
            {...props}
        >
            {children}
        </button>
    )
}
```

## Lucide React Icons

Using Lucide React for consistent, beautiful icons throughout the application:

```tsx
import {
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    UserIcon,
    BookOpenIcon,
    BarChartIcon,
    SettingsIcon,
    LogOutIcon
} from 'lucide-react'

// Usage in components
export function ExamStatus({ status }: { status: 'passed' | 'failed' | 'pending' }) {
    const icons = {
        passed: CheckCircleIcon,
        failed: XCircleIcon,
        pending: ClockIcon
    }

    const colors = {
        passed: 'text-green-600',
        failed: 'text-red-600',
        pending: 'text-yellow-600'
    }

    const Icon = icons[status]

    return (
        <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${colors[status]}`} />
            <span className="capitalize">{status}</span>
        </div>
    )
}

// Navigation icons
export function Navigation() {
    return (
        <nav className="flex gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
                <BarChartIcon className="h-4 w-4" />
                Dashboard
            </Link>
            <Link href="/exams" className="flex items-center gap-2">
                <BookOpenIcon className="h-4 w-4" />
                Exams
            </Link>
            <Link href="/profile" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Profile
            </Link>
        </nav>
    )
}
```

## Class Variance Authority & Tailwind Merge

Using Class Variance Authority (CVA) for component variants and Tailwind Merge for class merging:

```tsx
// utils/cn.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Button component with CVA variants
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90",
                destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

// Usage
<Button variant="destructive" size="sm">
    Delete Exam
</Button>
```

## Inertia.js Patterns

### Form Handling
```tsx
import { useForm } from '@inertiajs/react'

export default function ExamCreate() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        duration_minutes: 60,
        passing_score: 70
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route('exams.store'))
    }

    return (
        <form onSubmit={submit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Title
                </label>
                <input
                    type="text"
                    value={data.title}
                    onChange={e => setData('title', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
            </div>
            {/* Other form fields */}
            <Button type="submit" disabled={processing}>
                {processing ? 'Creating...' : 'Create Exam'}
            </Button>
        </form>
    )
}
```

### Data Fetching and Updates
```tsx
import { router } from '@inertiajs/react'

export function ExamTimer({ exam, timeRemaining }: ExamTimerProps) {
    const [time, setTime] = useState(timeRemaining)

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(prev => {
                if (prev <= 1) {
                    // Auto-submit exam
                    router.post(route('exams.submit', exam.id))
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [exam.id])

    return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800 font-medium">
                    Time Remaining: {formatTime(time)}
                </span>
            </div>
        </div>
    )
}
```

## Question Components

### Multiple Choice Question
```tsx
interface MultipleChoiceQuestionProps {
    question: {
        id: number
        question: string
        options: string[]
        correct_answer?: number
    }
    selectedAnswer?: number
    onAnswerSelect: (questionId: number, answerIndex: number) => void
    showResults?: boolean
}

export function MultipleChoiceQuestion({
    question,
    selectedAnswer,
    onAnswerSelect,
    showResults = false
}: MultipleChoiceQuestionProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
                {question.question}
            </h3>

            <div className="space-y-3">
                {question.options.map((option, index) => {
                    const isSelected = selectedAnswer === index
                    const isCorrect = question.correct_answer === index
                    const isIncorrect = showResults && isSelected && !isCorrect

                    return (
                        <label
                            key={index}
                            className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                                isSelected ? 'border-blue-500 bg-blue-50' :
                                isCorrect && showResults ? 'border-green-500 bg-green-50' :
                                isIncorrect ? 'border-red-500 bg-red-50' :
                                'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={index}
                                checked={isSelected}
                                onChange={() => onAnswerSelect(question.id, index)}
                                disabled={showResults}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-3 text-gray-700">{option}</span>
                            {showResults && isCorrect && (
                                <CheckCircleIcon className="h-5 w-5 text-green-600 ml-auto" />
                            )}
                            {showResults && isIncorrect && (
                                <XCircleIcon className="h-5 w-5 text-red-600 ml-auto" />
                            )}
                        </label>
                    )
                })}
            </div>
        </div>
    )
}
```

### Essay Question
```tsx
interface EssayQuestionProps {
    question: {
        id: number
        question: string
        word_limit?: number
    }
    answer?: string
    onAnswerChange: (questionId: number, answer: string) => void
    readonly?: boolean
}

export function EssayQuestion({
    question,
    answer = '',
    onAnswerChange,
    readonly = false
}: EssayQuestionProps) {
    const wordCount = answer.trim().split(/\s+/).filter(word => word.length > 0).length

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
                {question.question}
            </h3>

            <div className="space-y-4">
                <textarea
                    value={answer}
                    onChange={e => onAnswerChange(question.id, e.target.value)}
                    readOnly={readonly}
                    placeholder="Type your answer here..."
                    rows={8}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none"
                />

                {question.word_limit && (
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>Words: {wordCount}</span>
                        <span>Limit: {question.word_limit}</span>
                        {wordCount > question.word_limit && (
                            <span className="text-red-600 font-medium">
                                Over limit by {wordCount - question.word_limit} words
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
```

## Layout Components

### Exam Layout
```tsx
import { ReactNode } from 'react'

interface ExamLayoutProps {
    children: ReactNode
    exam: Exam
    timeRemaining?: number
}

export function ExamLayout({ children, exam, timeRemaining }: ExamLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">
                                {exam.title}
                            </h1>
                            <p className="text-sm text-gray-600">
                                {exam.description}
                            </p>
                        </div>

                        {timeRemaining && (
                            <ExamTimer
                                exam={exam}
                                timeRemaining={timeRemaining}
                            />
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto py-8 px-4">
                {children}
            </main>
        </div>
    )
}
```

### Navigation Components
```tsx
import { Link } from '@inertiajs/react'

export function ExamNavigation({ currentQuestion, totalQuestions, onQuestionClick }: ExamNavigationProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
                Questions
            </h3>

            <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: totalQuestions }, (_, i) => {
                    const questionNumber = i + 1
                    const isCurrent = questionNumber === currentQuestion
                    const isAnswered = false // TODO: Check if answered

                    return (
                        <button
                            key={questionNumber}
                            onClick={() => onQuestionClick(questionNumber)}
                            className={`h-10 w-10 rounded-md text-sm font-medium transition-colors ${
                                isCurrent
                                    ? 'bg-blue-600 text-white'
                                    : isAnswered
                                        ? 'bg-green-100 text-green-800 border border-green-300'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {questionNumber}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
```

## State Management Patterns

### Exam State Hook
```tsx
import { useState, useEffect, useCallback } from 'react'
import { router } from '@inertiajs/react'

interface ExamState {
    currentQuestion: number
    answers: Record<number, any>
    timeRemaining: number
    isSubmitting: boolean
}

export function useExamState(examId: number, initialTime: number) {
    const [state, setState] = useState<ExamState>({
        currentQuestion: 1,
        answers: {},
        timeRemaining: initialTime,
        isSubmitting: false
    })

    // Auto-save answers
    const saveAnswer = useCallback((questionId: number, answer: any) => {
        setState(prev => ({
            ...prev,
            answers: { ...prev.answers, [questionId]: answer }
        }))

        // Debounced save to server
        router.post(route('exams.save-answer', examId), {
            question_id: questionId,
            answer: answer
        }, {
            preserveState: true,
            preserveScroll: true
        })
    }, [examId])

    // Timer countdown
    useEffect(() => {
        if (state.timeRemaining <= 0) return

        const interval = setInterval(() => {
            setState(prev => {
                if (prev.timeRemaining <= 1) {
                    submitExam()
                    return { ...prev, timeRemaining: 0 }
                }
                return { ...prev, timeRemaining: prev.timeRemaining - 1 }
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [state.timeRemaining])

    const submitExam = useCallback(() => {
        setState(prev => ({ ...prev, isSubmitting: true }))

        router.post(route('exams.submit', examId), {
            answers: state.answers
        })
    }, [examId, state.answers])

    return {
        ...state,
        saveAnswer,
        submitExam,
        goToQuestion: (questionNumber: number) =>
            setState(prev => ({ ...prev, currentQuestion: questionNumber }))
    }
}
```

## Styling Patterns

### Tailwind CSS Conventions
```tsx
// Color scheme
const colors = {
    primary: {
        50: '#eff6ff',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8'
    },
    success: {
        50: '#f0fdf4',
        500: '#22c55e',
        600: '#16a34a'
    },
    danger: {
        50: '#fef2f2',
        500: '#ef4444',
        600: '#dc2626'
    }
}

// Component spacing
const spacing = {
    card: 'p-6',
    section: 'py-8',
    container: 'max-w-4xl mx-auto'
}

// Common patterns
const patterns = {
    card: 'bg-white rounded-lg shadow-sm border',
    input: 'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500',
    button: 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
}
```

## Common UI Patterns

### Loading States
```tsx
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizes = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12'
    }

    return (
        <div className="flex items-center justify-center">
            <div
                className={`${sizes[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`}
                role="status"
            />
        </div>
    )
}

// Usage in components
{processing ? (
    <LoadingSpinner />
) : (
    <Button onClick={handleSubmit}>Submit</Button>
)}
```

### Error Handling
```tsx
interface ErrorDisplayProps {
    errors: Record<string, string>
    className?: string
}

export function ErrorDisplay({ errors, className = '' }: ErrorDisplayProps) {
    if (Object.keys(errors).length === 0) return null

    return (
        <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
            <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                        There were some errors:
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                        <ul className="list-disc pl-5 space-y-1">
                            {Object.values(errors).map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
```

### Confirmation Dialogs
```tsx
interface ConfirmDialogProps {
    isOpen: boolean
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    onCancel: () => void
}

export function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel
}: ConfirmDialogProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />

                <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                        {title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                        {message}
                    </p>

                    <div className="mt-4 flex justify-end space-x-3">
                        <Button variant="secondary" onClick={onCancel}>
                            {cancelText}
                        </Button>
                        <Button variant="danger" onClick={onConfirm}>
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
```

## Best Practices

1. **Use TypeScript** for type safety
2. **Follow Inertia.js patterns** for navigation and forms
3. **Use Tailwind utility classes** consistently
4. **Create reusable components** for common UI patterns
5. **Handle loading and error states** appropriately
6. **Use semantic HTML** and proper ARIA attributes
7. **Optimize for mobile** with responsive design
8. **Follow React best practices** (hooks, memo, etc.)

## File Organization

```
resources/
├── js/
│   ├── Components/
│   │   ├── ui/           # Reusable UI components
│   │   ├── exam/         # Exam-specific components
│   │   └── layout/       # Layout components
│   ├── Pages/            # Inertia pages
│   │   ├── Exams/        # Exam pages
│   │   ├── Auth/         # Authentication pages
│   │   └── Dashboard/    # Dashboard pages
│   ├── Hooks/            # Custom React hooks
│   ├── Types/            # TypeScript type definitions
│   └── Utils/            # Utility functions
└── css/
    └── app.css           # Tailwind imports and custom styles
```

This skill provides comprehensive guidance for building the frontend of our exam management system with modern React, Inertia.js, and Tailwind CSS patterns.