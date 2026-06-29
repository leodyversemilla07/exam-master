<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\ExamQuestion;
use App\Models\ExamSession;
use App\Models\Module;
use App\Models\TosGenerate;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the educator dashboard.
     */
    public function __invoke(): Response
    {
        $user = auth()->user();

        if ($user->hasRole('student')) {
            return $this->studentDashboard();
        }

        $moduleQuery = $this->accessibleModulesQuery($user);
        $questionQuery = $this->accessibleQuestionsQuery($user);
        $examQuery = $this->accessibleExamsQuery($user);
        $tosQuery = $this->accessibleTosQuery($user);

        $stats = [
            'total_modules' => (clone $moduleQuery)->count(),
            'active_modules' => (clone $moduleQuery)->where('is_active', true)->count(),
            'total_questions' => (clone $questionQuery)->count(),
            'approved_questions' => (clone $questionQuery)->where('is_approved', true)->count(),
            'pending_questions' => (clone $questionQuery)->where('is_approved', false)->count(),
            'ai_generated_questions' => (clone $questionQuery)->where('is_ai_generated', true)->count(),
            'total_exams' => (clone $examQuery)->count(),
            'published_exams' => (clone $examQuery)->where('status', 'published')->count(),
            'draft_exams' => (clone $examQuery)->where('status', 'draft')->count(),
            'total_tos' => (clone $tosQuery)->count(),
            'completed_tos' => (clone $tosQuery)->where('status', 'completed')->count(),
            'total_users' => $user->isAdmin() ? User::count() : 0,
        ];

        $recentExams = (clone $examQuery)->with(['module', 'creator'])
            ->withCount('questions')
            ->latest()
            ->take(20)
            ->get();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentExams' => $recentExams,
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

    private function accessibleModulesQuery(User $user): Builder
    {
        return Module::query()
            ->when(! $user->isAdmin(), fn ($query) => $query->where('created_by', $user->id));
    }

    private function accessibleQuestionsQuery(User $user): Builder
    {
        return ExamQuestion::query()
            ->when(! $user->isAdmin(), fn ($query) => $query->where(fn ($ownedQuery) => $ownedQuery
                ->where('created_by', $user->id)
                ->orWhereHas('module', fn ($moduleQuery) => $moduleQuery->where('created_by', $user->id))));
    }

    private function accessibleExamsQuery(User $user): Builder
    {
        return Exam::query()
            ->when(! $user->isAdmin(), fn ($query) => $query->where('created_by', $user->id));
    }

    private function accessibleTosQuery(User $user): Builder
    {
        return TosGenerate::query()
            ->when(! $user->isAdmin(), fn ($query) => $query->where(fn ($ownedQuery) => $ownedQuery
                ->where('created_by', $user->id)
                ->orWhereHas('module', fn ($moduleQuery) => $moduleQuery->where('created_by', $user->id))));
    }
}
