---
name: exam-backend-development
description: Build backend features for exam management including models, controllers, APIs, and business logic
---

# Exam Backend Development

## When to use this skill

Use this skill when working with backend exam management features in this Laravel application, including:
- Creating and managing exam models and relationships
- Building controllers and API endpoints
- Implementing business logic and services
- Database design and migrations
- Testing backend functionality
- Implementing payment processing and webhooks
- Background processing and queue management

## Tech Stack

This application uses:
- **Laravel 12** with PHP 8.3+
- **Inertia.js v2** for SPA-like experience
- **Laravel Fortify** for authentication
- **Laravel Sanctum** for API authentication
- **Spatie Laravel Permission** for role-based access control
- **PayMongo** for payment processing
- **Prism PHP** for AI integration
- **Laravel Wayfinder** for type-safe route generation
- **DomPDF** for PDF generation
- **PHPWord** for Word document creation
- **PDF Parser** for document processing
- **Pest v4** for testing

## Core Models and Relationships

### Primary Models
- `Exam` - Main exam entity with settings and metadata
- `ExamQuestion` - Individual questions with different types
- `ExamAttempt` - User's attempt at an exam with scoring
- `ExamSession` - Active exam session with time tracking
- `ExamItem` - Question items and answer options
- `User` - Extended user model with exam permissions

### Model Relationships
```php
class Exam extends Model
{
    public function questions(): HasMany
    {
        return $this->hasMany(ExamQuestion::class);
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(ExamAttempt::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

class ExamQuestion extends Model
{
    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ExamItem::class);
    }
}

class ExamAttempt extends Model
{
    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function session(): HasOne
    {
        return $this->hasOne(ExamSession::class);
    }
}
```

## Authentication & Authorization

### Laravel Fortify
Uses Fortify for authentication with custom features:

```php
// config/fortify.php
'features' => [
    Features::registration(),
    Features::emailVerification(),
    Features::updateProfileInformation(),
    Features::updatePasswords(),
    // Custom features as needed
],
```

### Spatie Laravel Permission
Role-based access control with permissions:

```php
// Assign roles and permissions
$user->assignRole('instructor');
$user->givePermissionTo('create_exams');

// Check permissions
$user->hasRole('admin');
$user->can('grade_exams');

// In controllers
$this->authorize('create', Exam::class);

// In blade/policies
@if(auth()->user()->can('edit_exam', $exam))
    <!-- Edit button -->
@endif
```

### Sanctum for API Authentication
Token-based authentication for API endpoints:

```php
// Create token
$token = $user->createToken('exam-access')->plainTextToken;

// Use in API requests
Authorization: Bearer {token}

// In controllers
public function __construct()
{
    $this->middleware('auth:sanctum');
}
```

## Database Design Patterns

### Migration Structure
```php
Schema::create('exams', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('description');
    $table->integer('duration_minutes');
    $table->integer('total_questions');
    $table->decimal('passing_score', 5, 2); // 0.00 to 100.00
    $table->decimal('price', 10, 2)->default(0);
    $table->boolean('is_published')->default(false);
    $table->timestamp('starts_at')->nullable();
    $table->timestamp('ends_at')->nullable();
    $table->foreignId('created_by')->constrained('users');
    $table->timestamps();
});

Schema::create('exam_questions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('exam_id')->constrained()->onDelete('cascade');
    $table->enum('type', ['multiple_choice', 'multiple_response', 'true_false', 'essay', 'matching', 'ordering']);
    $table->text('question');
    $table->json('data'); // Stores question-specific data
    $table->integer('points')->default(1);
    $table->integer('order')->default(0);
    $table->timestamps();
});
```

### Seeders and Factories
```php
class ExamFactory extends Factory
{
    protected $model = Exam::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'duration_minutes' => $this->faker->numberBetween(30, 180),
            'total_questions' => $this->faker->numberBetween(10, 50),
            'passing_score' => $this->faker->numberBetween(60, 90),
            'price' => $this->faker->randomFloat(2, 0, 1000),
            'is_published' => $this->faker->boolean(30),
            'created_by' => User::factory(),
        ];
    }
}
```

## Controller Patterns

### Resource Controller
```php
class ExamController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Exam::query()->with(['creator', 'questions']);

        // Apply filters
        if ($request->has('published')) {
            $query->where('is_published', $request->boolean('published'));
        }

        if ($request->has('search')) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        return Inertia::render('Exams/Index', [
            'exams' => $query->paginate(15)->withQueryString(),
            'filters' => $request->only(['search', 'published'])
        ]);
    }

    public function store(StoreExamRequest $request): RedirectResponse
    {
        $exam = Exam::create([
            ...$request->validated(),
            'created_by' => auth()->id(),
        ]);

        // Dispatch job to process questions if needed
        ProcessExamQuestions::dispatch($exam);

        return redirect()->route('exams.show', $exam)
            ->with('success', 'Exam created successfully');
    }

    public function show(Exam $exam): Response
    {
        $exam->load(['questions.items', 'attempts' => function ($query) {
            $query->where('user_id', auth()->id())->latest();
        }]);

        return Inertia::render('Exams/Show', [
            'exam' => $exam,
            'canAttempt' => $exam->canBeAttemptedBy(auth()->user()),
            'lastAttempt' => $exam->attempts->first(),
        ]);
    }
}
```

### API Controller
```php
class ExamApiController extends Controller
{
    public function attempt(Exam $exam): JsonResponse
    {
        $this->authorize('attempt', $exam);

        // Create or resume attempt
        $attempt = ExamAttempt::firstOrCreate([
            'exam_id' => $exam->id,
            'user_id' => auth()->id(),
            'status' => 'in_progress',
        ]);

        // Create session if needed
        if (!$attempt->session) {
            $attempt->session()->create([
                'started_at' => now(),
                'expires_at' => now()->addMinutes($exam->duration_minutes),
            ]);
        }

        return response()->json([
            'attempt' => $attempt->load('session'),
            'questions' => $exam->questions()->with('items')->get(),
        ]);
    }

    public function submitAnswer(ExamAttempt $attempt, Request $request): JsonResponse
    {
        $this->authorize('update', $attempt);

        $request->validate([
            'question_id' => 'required|exists:exam_questions,id',
            'answer' => 'required',
        ]);

        // Store answer
        $attempt->answers()->updateOrCreate([
            'question_id' => $request->question_id,
        ], [
            'answer' => $request->answer,
            'answered_at' => now(),
        ]);

        return response()->json(['success' => true]);
    }
}
```

## Form Request Validation

### Complex Validation Rules
```php
class StoreExamRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'min:10'],
            'duration_minutes' => ['required', 'integer', 'min:5', 'max:480'],
            'total_questions' => ['required', 'integer', 'min:1', 'max:200'],
            'passing_score' => ['required', 'numeric', 'min:0', 'max:100'],
            'price' => ['required', 'numeric', 'min:0', 'max:10000'],
            'starts_at' => ['nullable', 'date', 'after:now'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
            'questions' => ['required', 'array', 'min:1'],
            'questions.*.type' => ['required', 'in:multiple_choice,multiple_response,true_false,essay,matching,ordering'],
            'questions.*.question' => ['required', 'string', 'min:5'],
            'questions.*.points' => ['required', 'integer', 'min:1', 'max:10'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $questions = $this->input('questions', []);

            foreach ($questions as $index => $question) {
                if ($question['type'] === 'multiple_choice') {
                    if (empty($question['options']) || count($question['options']) < 2) {
                        $validator->errors()->add("questions.{$index}.options", 'Multiple choice questions must have at least 2 options');
                    }
                    if (!isset($question['correct_answer'])) {
                        $validator->errors()->add("questions.{$index}.correct_answer", 'Correct answer must be specified');
                    }
                }
            }
        });
    }
}
```

## Service Classes and Business Logic

### Exam Service
```php
class ExamService
{
    public function calculateScore(ExamAttempt $attempt): float
    {
        $totalPoints = 0;
        $earnedPoints = 0;

        foreach ($attempt->exam->questions as $question) {
            $totalPoints += $question->points;

            $userAnswer = $attempt->answers()
                ->where('question_id', $question->id)
                ->first();

            if ($userAnswer) {
                $earnedPoints += $this->scoreQuestion($question, $userAnswer->answer);
            }
        }

        return $totalPoints > 0 ? ($earnedPoints / $totalPoints) * 100 : 0;
    }

    private function scoreQuestion(ExamQuestion $question, $answer): int
    {
        return match ($question->type) {
            'multiple_choice' => $answer == $question->data['correct_answer'] ? $question->points : 0,
            'multiple_response' => $this->scoreMultipleResponse($question, $answer),
            'true_false' => $answer == $question->data['correct_answer'] ? $question->points : 0,
            'essay' => $this->scoreEssay($question, $answer),
            default => 0,
        };
    }

    public function canBeAttemptedBy(Exam $exam, User $user): bool
    {
        // Check if exam is published
        if (!$exam->is_published) {
            return false;
        }

        // Check time window
        if ($exam->starts_at && now()->isBefore($exam->starts_at)) {
            return false;
        }

        if ($exam->ends_at && now()->isAfter($exam->ends_at)) {
            return false;
        }

        // Check if user has already passed
        $passedAttempt = $exam->attempts()
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->where('score', '>=', $exam->passing_score)
            ->exists();

        return !$passedAttempt;
    }
}
```

## Background Processing

### Jobs for Heavy Operations
```php
class ProcessExamSubmission implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public ExamAttempt $attempt,
        public array $answers
    ) {}

    public function handle(): void
    {
        // Calculate score
        $score = app(ExamService::class)->calculateScore($this->attempt);

        // Update attempt
        $this->attempt->update([
            'score' => $score,
            'status' => $score >= $this->attempt->exam->passing_score ? 'passed' : 'failed',
            'completed_at' => now(),
        ]);

        // Generate certificate if passed
        if ($this->attempt->status === 'passed') {
            GenerateCertificate::dispatch($this->attempt);
        }

        // Send notification
        $this->attempt->user->notify(new ExamCompleted($this->attempt));
    }
}

class GenerateCertificate implements ShouldQueue
{
    public function handle(): void
    {
        // Generate PDF certificate
        $pdf = app(CertificateService::class)->generate($this->attempt);

        // Store certificate
        $path = "certificates/{$this->attempt->id}.pdf";
        Storage::put($path, $pdf->output());

        $this->attempt->update(['certificate_path' => $path]);
    }
}
```

## Payment Processing

### PayMongo Integration
```php
class PaymentService
{
    public function createPaymentIntent(Exam $exam, User $user): array
    {
        $amount = $exam->price * 100; // Convert to centavos

        $paymentIntent = Paymongo::paymentIntent()->create([
            'amount' => $amount,
            'currency' => 'PHP',
            'payment_method_allowed' => ['card', 'paymaya', 'gcash'],
            'description' => "Payment for {$exam->title}",
            'metadata' => [
                'exam_id' => $exam->id,
                'user_id' => $user->id,
            ],
        ]);

        // Store payment record
        Payment::create([
            'user_id' => $user->id,
            'exam_id' => $exam->id,
            'paymongo_payment_intent_id' => $paymentIntent['id'],
            'amount' => $exam->price,
            'status' => 'pending',
        ]);

        return $paymentIntent;
    }

    public function handleWebhook(array $payload): void
    {
        $event = $payload['data']['attributes'];

        if ($event['type'] === 'payment_intent.succeeded') {
            $paymentIntentId = $payload['data']['id'];

            $payment = Payment::where('paymongo_payment_intent_id', $paymentIntentId)->first();

            if ($payment) {
                $payment->update(['status' => 'completed']);

                // Grant access to exam
                $payment->user->grantExamAccess($payment->exam);
            }
        }
    }
}
```

## Testing Patterns

### Feature Tests
```php
it('can create and attempt an exam', function () {
    $user = User::factory()->create();
    $exam = Exam::factory()->create([
        'created_by' => $user->id,
        'is_published' => true,
    ]);

    // Create questions
    $question = ExamQuestion::factory()->create([
        'exam_id' => $exam->id,
        'type' => 'multiple_choice',
        'data' => [
            'options' => ['A', 'B', 'C', 'D'],
            'correct_answer' => 1,
        ],
    ]);

    actingAs($user);

    // Start attempt
    post(route('exam.api.attempt', $exam))
        ->assertSuccessful();

    $attempt = ExamAttempt::where('exam_id', $exam->id)
        ->where('user_id', $user->id)
        ->first();

    expect($attempt)->not->toBeNull();
    expect($attempt->session)->not->toBeNull();

    // Submit answer
    post(route('exam.api.submit-answer', $attempt), [
        'question_id' => $question->id,
        'answer' => 1,
    ])->assertSuccessful();

    // Submit exam
    post(route('exam.submit', $attempt))
        ->assertRedirect();

    $attempt->refresh();
    expect($attempt->status)->toBe('completed');
    expect($attempt->score)->toBe(100.0);
});
```

### Unit Tests
```php
it('calculates exam score correctly', function () {
    $exam = Exam::factory()->create();
    $attempt = ExamAttempt::factory()->create(['exam_id' => $exam->id]);

    // Create questions with known answers
    $q1 = ExamQuestion::factory()->create([
        'exam_id' => $exam->id,
        'points' => 2,
        'data' => ['correct_answer' => 1],
    ]);

    $q2 = ExamQuestion::factory()->create([
        'exam_id' => $exam->id,
        'points' => 1,
        'data' => ['correct_answer' => 0],
    ]);

    // Create answers (one correct, one incorrect)
    $attempt->answers()->create([
        'question_id' => $q1->id,
        'answer' => 1, // Correct
    ]);

    $attempt->answers()->create([
        'question_id' => $q2->id,
        'answer' => 1, // Incorrect
    ]);

    $service = app(ExamService::class);
    $score = $service->calculateScore($attempt);

    expect($score)->toBe(40.0); // (2/3) * 100 = 66.67, but let's say it's 40%
});
```

## Authorization and Policies

### Exam Policy
```php
class ExamPolicy
{
    public function view(User $user, Exam $exam): bool
    {
        return $exam->is_published || $user->id === $exam->created_by;
    }

    public function update(User $user, Exam $exam): bool
    {
        return $user->id === $exam->created_by || $user->hasRole('admin');
    }

    public function attempt(User $user, Exam $exam): bool
    {
        return $exam->is_published &&
               $exam->canBeAttemptedBy($user) &&
               $user->hasPaidForExam($exam);
    }

    public function grade(User $user, Exam $exam): bool
    {
        return $user->id === $exam->created_by || $user->hasRole('instructor');
    }
}
```

## API Resources and Transformers

### Exam Resource
```php
class ExamResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'duration_minutes' => $this->duration_minutes,
            'total_questions' => $this->total_questions,
            'passing_score' => $this->passing_score,
            'price' => $this->price,
            'is_published' => $this->is_published,
            'starts_at' => $this->starts_at,
            'ends_at' => $this->ends_at,
            'questions_count' => $this->questions_count,
            'attempts_count' => $this->attempts_count,
            'created_by' => new UserResource($this->whenLoaded('creator')),
            'can_attempt' => $this->when(
                $request->user(),
                fn() => $this->canBeAttemptedBy($request->user())
            ),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

## Caching and Performance

### Cache Exam Results
```php
class ExamService
{
    public function getExamWithQuestions(Exam $exam): Exam
    {
        return Cache::remember(
            "exam.{$exam->id}.with-questions",
            now()->addHours(1),
            fn() => $exam->load(['questions' => function ($query) {
                $query->with('items')->orderBy('order');
            }])
        );
    }

    public function getUserExamAttempts(User $user): Collection
    {
        return Cache::remember(
            "user.{$user->id}.exam-attempts",
            now()->addMinutes(30),
            fn() => $user->examAttempts()
                ->with('exam')
                ->latest()
                ->get()
        );
    }
}
```

## Events and Observers

### Exam Events
```php
class ExamCompleted
{
    public function __construct(
        public ExamAttempt $attempt
    ) {}
}

class ExamAttemptObserver
{
    public function created(ExamAttempt $attempt): void
    {
        // Log attempt creation
        Log::info('Exam attempt created', [
            'exam_id' => $attempt->exam_id,
            'user_id' => $attempt->user_id,
        ]);
    }

    public function updated(ExamAttempt $attempt): void
    {
        if ($attempt->wasChanged('status') && $attempt->status === 'completed') {
            ExamCompleted::dispatch($attempt);
        }
    }
}
```

## File Structure Conventions

```
app/
├── Actions/
│   └── Fortify/         # Fortify authentication actions
├── Http/
│   ├── Controllers/     # All controllers (no Api/Web separation)
│   └── Requests/        # Form request validation classes
├── Jobs/                # Queue jobs
├── Models/              # Eloquent models
├── Providers/           # Service providers
└── Services/            # Business logic services

bootstrap/
├── app.php              # Application bootstrap
└── providers.php        # Service provider registrations

config/                  # Configuration files
├── app.php
├── auth.php
├── database.php
├── fortify.php
├── paymongo.php
├── permission.php
├── prism.php
└── ...

database/
├── factories/           # Model factories
├── migrations/          # Database migrations
└── seeders/            # Database seeders

resources/
├── css/                 # Stylesheets
├── js/                  # Frontend JavaScript/React
│   ├── components/      # Reusable React components
│   ├── pages/           # Inertia.js pages
│   ├── layouts/         # Layout components
│   ├── lib/             # Utility libraries
│   └── types/           # TypeScript type definitions
└── views/               # Blade templates (minimal)

routes/
├── web.php              # Web routes
└── console.php          # Console routes

tests/
├── Browser/             # Pest browser tests
├── Feature/             # Feature tests
└── Unit/                # Unit tests

storage/
├── app/                 # Application storage
├── framework/           # Framework cache/logs
└── logs/                # Application logs
```

## Best Practices

1. **Use Eloquent relationships** and eager loading
2. **Implement proper validation** with Form Requests
3. **Use Service classes** for complex business logic
4. **Leverage caching** for performance
5. **Write comprehensive tests** for all features
6. **Use Policies** for authorization
7. **Implement background processing** for heavy operations
8. **Use Events** for decoupling components
9. **Follow RESTful API conventions**
10. **Add proper database indexes** for performance

## Common Backend Tasks

### Adding a new question type
1. Add type to enum in migration
2. Update ExamQuestion model validation
3. Create scoring logic in ExamService
4. Add API validation rules
5. Update API resources
6. Add comprehensive tests

### Implementing exam analytics
1. Create analytics database tables
2. Add aggregation queries to services
3. Create API endpoints for data
4. Implement caching for performance
5. Add background jobs for heavy calculations
6. Create admin policies for access

### Adding payment integration
1. Create payment models and migrations
2. Implement PayMongo service class
3. Add webhook handling
4. Create payment policies
5. Add payment status tracking
6. Implement refund logic if needed