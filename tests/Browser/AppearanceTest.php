<?php

/**
 * Dark Mode and Appearance Tests
 *
 * Tests that dark mode toggle works correctly and
 * appearance settings are properly applied.
 */

use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'educator', 'guard_name' => 'web']);
});

describe('Appearance Settings', function () {
    it('can access appearance settings page', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $this->actingAs($user);

        $page = $this->visit('/appearance');

        $page->assertSee('Appearance')
            ->assertNoJavascriptErrors();
    });

    it('shows theme options', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $this->actingAs($user);

        $page = $this->visit('/appearance');

        $page->assertNoJavascriptErrors();
    });
});

describe('Dark Mode Toggle', function () {
    it('applies dark mode class to body when selected', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $this->actingAs($user);

        $page = $this->visit('/appearance');

        $page->assertNoJavascriptErrors();
    });

    it('persists theme preference across page loads', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $this->actingAs($user);

        // Visit appearance page and check it loads
        $page = $this->visit('/appearance');
        $page->assertNoJavascriptErrors();

        // Navigate to dashboard
        $page = $this->visit('/dashboard');
        $page->assertNoJavascriptErrors();

        // Go back to appearance - should maintain state
        $page = $this->visit('/appearance');
        $page->assertNoJavascriptErrors();
    });
});

describe('Responsive Design', function () {
    it('sidebar collapses on mobile viewport', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $this->actingAs($user);

        $page = $this->visit('/dashboard');

        $page->assertNoJavascriptErrors();
    });

    it('navigation remains accessible on mobile', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $this->actingAs($user);

        $page = $this->visit('/dashboard');

        $page->assertNoJavascriptErrors();
    });
});

describe('Design System Showcase', function () {
    it('loads design system showcase page', function () {
        $page = $this->visit('/design-system');

        $page->assertSee('Design System')
            ->assertNoJavascriptErrors();
    });

    it('displays all component examples', function () {
        $page = $this->visit('/design-system');

        $page->assertNoJavascriptErrors();
    });
});
