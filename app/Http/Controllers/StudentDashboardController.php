<?php

namespace App\Http\Controllers;

use App\Models\ExamAttempt;
use App\Models\ExamSession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentDashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $availableSessions = ExamSession::query()
            ->with('exam.module')
            ->where('status', 'active')
            ->where('start_time', '<=', now())
            ->where('end_time', '>=', now())
            ->orderBy('end_time')
            ->limit(5)
            ->get()
            ->filter(function ($session) use ($user) {
                return $session->canUserAttempt($user);
            })
            ->values();

        $inProgressAttempts = ExamAttempt::query()
            ->with('examSession.exam.module')
            ->where('user_id', $user->id)
            ->where('status', 'in_progress')
            ->orderBy('started_at', 'desc')
            ->get();

        $recentResults = ExamAttempt::query()
            ->with('examSession.exam.module')
            ->where('user_id', $user->id)
            ->whereIn('status', ['submitted', 'graded'])
            ->orderBy('submitted_at', 'desc')
            ->limit(5)
            ->get();

        $stats = [
            'total_attempts' => ExamAttempt::where('user_id', $user->id)->count(),
            'completed_exams' => ExamAttempt::where('user_id', $user->id)
                ->whereIn('status', ['submitted', 'graded'])
                ->count(),
            'average_score' => round(
                ExamAttempt::where('user_id', $user->id)
                    ->whereIn('status', ['submitted', 'graded'])
                    ->avg('percentage') ?? 0,
                1
            ),
            'in_progress' => ExamAttempt::where('user_id', $user->id)
                ->where('status', 'in_progress')
                ->count(),
        ];

        return Inertia::render('student/dashboard', [
            'availableSessions' => $availableSessions,
            'inProgressAttempts' => $inProgressAttempts,
            'recentResults' => $recentResults,
            'stats' => $stats,
        ]);
    }
}
