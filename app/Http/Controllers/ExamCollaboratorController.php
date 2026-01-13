<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExamCollaboratorController extends Controller
{
    /**
     * List collaborators for a specific exam.
     */
    public function index(Exam $exam): Response
    {
        $exam->load(['collaborators', 'creator']);

        abort_unless($exam->created_by === auth()->id() || $exam->collaborators->contains(auth()->id()), 403);

        return Inertia::render('exam-collaborators/index', [
            'exam' => $exam,
            'availableUsers' => User::whereNotIn('id', [$exam->created_by, ...$exam->collaborators->pluck('id')->toArray()])
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
        ]);
    }

    /**
     * Add a collaborator to an exam.
     */
    public function store(Request $request, Exam $exam): RedirectResponse
    {
        $request->validate([
            'user_id' => ['required', 'exists:users,id', 'not_in:'.$exam->created_by],
            'role' => ['required', 'in:editor,viewer'],
            'can_delete' => ['boolean'],
        ]);

        // Prevent duplicate collaborators
        if ($exam->collaborators()->where('user_id', $request->user_id)->exists()) {
            return back()->with('error', 'User is already a collaborator.');
        }

        // Prevent adding owner as collaborator
        abort_if($request->user_id == $exam->created_by, 403, 'You cannot add yourself as a collaborator.');

        $exam->collaborators()->attach($request->user_id, [
            'role' => $request->role,
            'can_delete' => $request->boolean('can_delete'),
        ]);

        return back()->with('success', 'Collaborator added successfully.');
    }

    /**
     * Update collaborator role/permissions.
     */
    public function update(Request $request, Exam $exam, User $user): RedirectResponse
    {
        // Only owner can update collaborator
        abort_unless($exam->created_by === auth()->id(), 403, 'You can only update collaborators you own.');

        // Check if user is a collaborator
        abort_unless($exam->collaborators()->where('user_id', $user->id)->exists(), 403);

        $exam->collaborators()->updateExistingPivot($user->id, [
            'role' => $request->role,
            'can_delete' => $request->boolean('can_delete'),
        ]);

        return back()->with('success', 'Collaborator updated successfully.');
    }

    /**
     * Remove a collaborator from an exam.
     */
    public function destroy(Exam $exam, User $user): RedirectResponse
    {
        // Only owner can remove collaborator
        abort_unless($exam->created_by === auth()->id(), 403, 'You can only remove collaborators from exams you own.');

        abort_unless($exam->collaborators()->where('user_id', $user->id)->exists(), 403, 'User is not a collaborator.');

        $exam->collaborators()->detach($user->id);

        return back()->with('success', 'Collaborator removed successfully.');
    }

    /**
     * Remove self as collaborator from an exam.
     */
    public function leave(Exam $exam): RedirectResponse
    {
        abort_unless($exam->collaborators()->where('user_id', auth()->id())->exists(), 403);
        $exam->collaborators()->detach(auth()->id());

        return back()->with('success', 'You have left this exam.');
    }

    /**
     * Search users to add as collaborators.
     */
    public function searchUsers(Request $request): JsonResponse
    {
        $exam = Exam::findOrFail($request->exam_id);
        abort_unless($exam->created_by === auth()->id(), 403, 'You can only search users for exams you own.');

        $excludedUserIds = [$exam->created_by, ...$exam->collaborators->pluck('id')->toArray()];
        $excludedUserIds = array_filter($excludedUserIds);

        $searchTerm = $request->input('query');

        $users = User::whereNotIn('id', $excludedUserIds)
            ->where(function ($query) use ($searchTerm) {
                $query->where('name', 'like', '%'.$searchTerm.'%')
                    ->orWhere('email', 'like', '%'.$searchTerm.'%');
            })
            ->limit(10)
            ->get(['id', 'name', 'email'])
            ->map(fn ($user) => [
                'id' => (int) $user->id,
                'name' => (string) $user->name,
                'email' => (string) $user->email,
            ]);

        return response()->json($users);
    }
}
