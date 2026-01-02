<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\ExamQuestion;
use App\Models\ExamSession;
use App\Models\Module;
use App\Models\TosGenerate;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard with analytics.
     */
    public function __invoke(): Response
    {
        $user = auth()->user();

        if ($user->hasRole('student')) {
            return $this->studentDashboard();
        }

        // Get statistics
        $stats = [
            'total_modules' => Module::count(),
            'active_modules' => Module::where('is_active', true)->count(),
            'total_questions' => ExamQuestion::count(),
            'approved_questions' => ExamQuestion::where('is_approved', true)->count(),
            'pending_questions' => ExamQuestion::where('is_approved', false)->count(),
            'ai_generated_questions' => ExamQuestion::where('is_ai_generated', true)->count(),
            'total_exams' => Exam::count(),
            'published_exams' => Exam::where('status', 'published')->count(),
            'draft_exams' => Exam::where('status', 'draft')->count(),
            'total_tos' => TosGenerate::count(),
            'completed_tos' => TosGenerate::where('status', 'completed')->count(),
            'total_users' => User::count(),
        ];

        // Get questions by cognitive level
        $questionsByCognitiveLevel = ExamQuestion::select('cognitive_level', DB::raw('count(*) as count'))
            ->groupBy('cognitive_level')
            ->pluck('count', 'cognitive_level')
            ->toArray();

        // Get questions by difficulty
        $questionsByDifficulty = ExamQuestion::select('difficulty', DB::raw('count(*) as count'))
            ->groupBy('difficulty')
            ->pluck('count', 'difficulty')
            ->toArray();

        // Get questions by type
        $questionsByType = ExamQuestion::select('question_type', DB::raw('count(*) as count'))
            ->groupBy('question_type')
            ->pluck('count', 'question_type')
            ->toArray();

        // Get recent activity
        $recentQuestions = ExamQuestion::with('module')
            ->latest()
            ->take(5)
            ->get(['id', 'question', 'cognitive_level', 'difficulty', 'is_approved', 'module_id', 'created_at']);

        $recentExams = Exam::with('module')
            ->latest()
            ->take(5)
            ->get(['id', 'title', 'status', 'total_items', 'module_id', 'created_at']);

        $recentTos = TosGenerate::with('module')
            ->latest()
            ->take(5)
            ->get(['id', 'subject', 'status', 'total_items', 'module_id', 'created_at']);

        // Get modules with question counts
        $moduleStats = Module::withCount(['questions', 'exams', 'tosGenerates'])
            ->where('is_active', true)
            ->orderBy('questions_count', 'desc')
            ->take(5)
            ->get(['id', 'code', 'name']);

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'questionsByCognitiveLevel' => $questionsByCognitiveLevel,
            'questionsByDifficulty' => $questionsByDifficulty,
            'questionsByType' => $questionsByType,
            'recentQuestions' => $recentQuestions,
            'recentExams' => $recentExams,
            'recentTos' => $recentTos,
            'moduleStats' => $moduleStats,
        ]);
    }

    protected function studentDashboard(): Response
    {
        $user = auth()->user();

        $now = now();

        $availableSessions = ExamSession::with(['exam.module', 'exam.creator'])
            ->where('status', 'active')
            ->where('start_time', '<=', $now)
            ->where('end_time', '>=', $now)
            ->whereDoesntHave('attempts', function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->where('status', 'in_progress');
            })
            ->get()
            ->filter(function ($session) use ($user) {
                return $session->canUserAttempt($user);
            });

        $inProgressAttempts = ExamAttempt::with(['examSession.exam.module'])
            ->where('user_id', $user->id)
            ->where('status', 'in_progress')
            ->get();

        $recentResults = ExamAttempt::with(['examSession.exam.module'])
            ->where('user_id', $user->id)
            ->whereIn('status', ['submitted', 'graded'])
            ->orderByDesc('submitted_at')
            ->take(10)
            ->get();

        $stats = [
            'total_attempts' => ExamAttempt::where('user_id', $user->id)->count(),
            'completed_exams' => ExamAttempt::where('user_id', $user->id)
                ->whereIn('status', ['submitted', 'graded'])
                ->count(),
            'average_score' => ExamAttempt::where('user_id', $user->id)
                ->whereNotNull('percentage')
                ->avg('percentage') ?? 0,
            'in_progress' => $inProgressAttempts->count(),
        ];

        return Inertia::render('student/dashboard', [
            'availableSessions' => $availableSessions,
            'inProgressAttempts' => $inProgressAttempts,
            'recentResults' => $recentResults,
            'stats' => $stats,
        ]);
    }
}
