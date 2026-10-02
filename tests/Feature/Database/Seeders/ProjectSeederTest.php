<?php

namespace Tests\Feature\Database\Seeders;

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use App\Models\Project;
use Database\Seeders\ProjectSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeds_the_sample_projects(): void
    {
        $this->seed(ProjectSeeder::class);

        $this->assertDatabaseCount('projects', 12);
        $project = Project::where('project_name', 'Corporate Website Redesign')->sole();
        $this->assertSame('Acme Corporation', $project->client_name);
        $this->assertSame("Redesign and modernize the company's corporate website.", $project->description);
        $this->assertSame(ProjectStatus::InProgress, $project->status);
        $this->assertSame(ProjectPriority::High, $project->priority);
        $this->assertSame('2026-06-01', $project->start_date->toDateString());
        $this->assertSame('2026-07-15', $project->due_date->toDateString());
    }

    public function test_seeding_twice_does_not_duplicate_projects(): void
    {
        $this->seed(ProjectSeeder::class);

        $this->seed(ProjectSeeder::class);

        $this->assertDatabaseCount('projects', 12);
    }
}
