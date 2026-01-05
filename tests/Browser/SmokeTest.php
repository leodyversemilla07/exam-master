<?php

/**
 * Smoke Tests - Basic page load verification for all public and authenticated routes
 *
 * These tests verify that critical pages load without JavaScript errors.
 */

use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    // Ensure roles exist
    Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'educator', 'guard_name' => 'web']);
});

describe('Public Pages', function () {
    it('loads the welcome page without errors', function () {
        $page = $this->visit('/');

        $page->assertSee('ExamMaster')
            ->assertNoJavascriptErrors();
    });

    it('loads the login page without errors', function () {
        $page = $this->visit('/login');

        $page->assertSee('Log in')
            ->assertNoJavascriptErrors();
    });

    it('loads the registration page without errors', function () {
        $page = $this->visit('/register');

        $page->assertSee('Create account')
            ->assertNoJavascriptErrors();
    });

    it('loads the forgot password page without errors', function () {
        $page = $this->visit('/forgot-password');

        $page->assertSee('Forgot')
            ->assertNoJavascriptErrors();
    });
});

describe('Authenticated Pages', function () {
    it('loads the dashboard without errors', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $this->actingAs($user);

        $page = $this->visit('/dashboard');

        $page->assertNoJavascriptErrors();
    });

    it('loads the profile page without errors', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $this->actingAs($user);

        $page = $this->visit('/profile');

        $page->assertNoJavascriptErrors();
    });

    it('loads the password settings page without errors', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $this->actingAs($user);

        $page = $this->visit('/password');

        $page->assertNoJavascriptErrors();
    });

    it('loads the appearance settings page without errors', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $this->actingAs($user);

        $page = $this->visit('/appearance');

        $page->assertNoJavascriptErrors();
    });
});

describe('Admin Pages', function () {
    it('loads the users management page without errors', function () {
        $user = User::factory()->create();
        $user->assignRole('super_admin');

        $this->actingAs($user);

        $page = $this->visit('/users');

        $page->assertNoJavascriptErrors();
    });

    it('loads the modules page without errors', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $this->actingAs($user);

        $page = $this->visit('/modules');

        $page->assertNoJavascriptErrors();
    });

    it('loads the question bank page without errors', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $this->actingAs($user);

        $page = $this->visit('/question-bank');

        $page->assertNoJavascriptErrors();
    });

    it('loads the TOS generates page without errors', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $this->actingAs($user);

        $page = $this->visit('/tos-generates');

        $page->assertNoJavascriptErrors();
    });

    it('loads the exam builder page without errors', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $this->actingAs($user);

        $page = $this->visit('/exam-builder');

        $page->assertNoJavascriptErrors();
    });
});
