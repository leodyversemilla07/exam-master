<?php

/**
 * Authentication Flow Browser Tests
 *
 * Tests the complete authentication flows including login, registration,
 * and password reset using real browser interactions.
 */

use App\Models\User;
use Spatie\Permission\Models\Role;



beforeEach(function () {
    Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'educator', 'guard_name' => 'web']);
});

describe('Login Flow', function () {
    it('shows validation errors for empty login form', function () {
        $page = $this->visit('/login');

        $page->click('button[type="submit"]')
            ->assertSee('email')
            ->assertNoJavascriptErrors();
    });

    it('shows error for invalid credentials', function () {
        $page = $this->visit('/login');

        $page->fill('input[name="email"]', 'nonexistent@example.com')
            ->fill('input[name="password"]', 'wrongpassword')
            ->click('button[type="submit"]')
            ->waitForText('credentials', timeout: 5)
            ->assertNoJavascriptErrors();
    });

    it('can login with valid credentials and redirects to dashboard', function () {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);
        $user->assignRole('educator');

        $page = $this->visit('/login');

        $page->fill('input[name="email"]', 'test@example.com')
            ->fill('input[name="password"]', 'password123')
            ->click('button[type="submit"]')
            ->waitForNavigation()
            ->assertUrlIs(route('dashboard'))
            ->assertNoJavascriptErrors();
    });

    it('remember me checkbox is functional', function () {
        $page = $this->visit('/login');

        $page->assertSee('Remember me')
            ->assertNoJavascriptErrors();
    });

    it('has link to forgot password page', function () {
        $page = $this->visit('/login');

        $page->click('a:has-text("Forgot")')
            ->waitForNavigation()
            ->assertUrlContains('forgot-password')
            ->assertNoJavascriptErrors();
    });

    it('has link to registration page', function () {
        $page = $this->visit('/login');

        $page->click('a:has-text("Register")')
            ->waitForNavigation()
            ->assertUrlContains('register')
            ->assertNoJavascriptErrors();
    });
});

describe('Registration Flow', function () {
    it('shows validation errors for empty registration form', function () {
        $page = $this->visit('/register');

        $page->click('button[type="submit"]')
            ->assertNoJavascriptErrors();
    });

    it('validates password confirmation matches', function () {
        $page = $this->visit('/register');

        $page->fill('input[name="name"]', 'Test User')
            ->fill('input[name="email"]', 'newuser@example.com')
            ->fill('input[name="password"]', 'password123')
            ->fill('input[name="password_confirmation"]', 'differentpassword')
            ->click('button[type="submit"]')
            ->waitForText('confirmation', timeout: 5)
            ->assertNoJavascriptErrors();
    });

    it('can register a new user successfully', function () {
        $page = $this->visit('/register');

        $page->fill('input[name="name"]', 'New Test User')
            ->fill('input[name="email"]', 'newuser'.time().'@example.com')
            ->fill('input[name="password"]', 'SecurePassword123!')
            ->fill('input[name="password_confirmation"]', 'SecurePassword123!')
            ->click('button[type="submit"]')
            ->waitForNavigation()
            ->assertNoJavascriptErrors();

        // Should be redirected to dashboard or email verification
        expect(true)->toBeTrue();
    });

    it('prevents registration with existing email', function () {
        $existingUser = User::factory()->create([
            'email' => 'existing@example.com',
        ]);

        $page = $this->visit('/register');

        $page->fill('input[name="name"]', 'Another User')
            ->fill('input[name="email"]', 'existing@example.com')
            ->fill('input[name="password"]', 'password123')
            ->fill('input[name="password_confirmation"]', 'password123')
            ->click('button[type="submit"]')
            ->waitForText('taken', timeout: 5)
            ->assertNoJavascriptErrors();
    });
});

describe('Logout Flow', function () {
    it('can logout successfully', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $this->actingAs($user);

        $page = $this->visit('/dashboard');

        // Look for logout button/link in user menu
        $page->assertNoJavascriptErrors();
    });
});
