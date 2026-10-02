<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\TestWith;
use Tests\TestCase;

class ProjectControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_returns_all_projects_newest_first(): void
    {
        $older = Project::factory()->create();
        $newer = Project::factory()->create();

        $response = $this->getJson('/api/projects');

        $response->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $newer->id)
            ->assertJsonPath('data.1.id', $older->id);
    }

    public function test_index_returns_empty_list_when_there_are_no_projects(): void
    {
        $response = $this->getJson('/api/projects');

        $response->assertOk()->assertExactJson(['data' => []]);
    }

    public function test_show_returns_the_project(): void
    {
        $project = Project::factory()->create([
            'client_name' => 'Acme Studio',
            'project_name' => 'Website Redesign',
            'description' => 'Refresh the marketing site.',
            'status' => ProjectStatus::InProgress,
            'priority' => ProjectPriority::High,
            'start_date' => '2026-01-10',
            'due_date' => '2026-03-31',
        ]);

        $response = $this->getJson("/api/projects/{$project->id}");

        $response->assertOk()->assertJson(['data' => [
            'id' => $project->id,
            'client_name' => 'Acme Studio',
            'project_name' => 'Website Redesign',
            'description' => 'Refresh the marketing site.',
            'status' => 'in_progress',
            'priority' => 'high',
            'start_date' => '2026-01-10',
            'due_date' => '2026-03-31',
        ]]);
    }

    public function test_show_returns_404_when_project_does_not_exist(): void
    {
        $response = $this->getJson('/api/projects/999');

        $response->assertNotFound()->assertExactJson(['message' => 'Project not found.']);
    }

    public function test_valid_payload_creates_project_and_returns_201(): void
    {
        $response = $this->postJson('/api/projects', $this->validPayload());

        $response->assertCreated()
            ->assertJsonPath('data.client_name', 'Acme Studio')
            ->assertJsonPath('data.project_name', 'Website Redesign')
            ->assertJsonPath('data.description', 'Refresh the marketing site.')
            ->assertJsonPath('data.status', 'planning')
            ->assertJsonPath('data.priority', 'medium')
            ->assertJsonPath('data.start_date', '2026-01-10')
            ->assertJsonPath('data.due_date', '2026-03-31');
        $this->assertDatabaseHas('projects', [
            'id' => $response->json('data.id'),
            'client_name' => 'Acme Studio',
            'project_name' => 'Website Redesign',
            'description' => 'Refresh the marketing site.',
            'status' => 'planning',
            'priority' => 'medium',
        ]);
    }

    public function test_store_creates_project_without_description_and_dates(): void
    {
        $response = $this->postJson('/api/projects', [
            'client_name' => 'Acme Studio',
            'project_name' => 'Website Redesign',
            'status' => 'planning',
            'priority' => 'low',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.description', null)
            ->assertJsonPath('data.start_date', null)
            ->assertJsonPath('data.due_date', null);
        $this->assertDatabaseCount('projects', 1);
    }

    public function test_store_returns_422_when_required_fields_are_missing(): void
    {
        $response = $this->postJson('/api/projects', []);

        $response->assertUnprocessable()->assertJsonValidationErrors([
            'client_name' => 'The client name field is required.',
            'project_name' => 'The project name field is required.',
            'status' => 'The status field is required.',
            'priority' => 'The priority field is required.',
        ]);
        $this->assertDatabaseEmpty('projects');
    }

    public function test_store_returns_422_when_status_is_invalid(): void
    {
        $response = $this->postJson('/api/projects', $this->validPayload(['status' => 'archived']));

        $response->assertUnprocessable()->assertJsonValidationErrors([
            'status' => 'The status must be one of: planning, in_progress, on_hold, completed.',
        ]);
        $this->assertDatabaseEmpty('projects');
    }

    public function test_store_returns_422_when_priority_is_invalid(): void
    {
        $response = $this->postJson('/api/projects', $this->validPayload(['priority' => 'urgent']));

        $response->assertUnprocessable()->assertJsonValidationErrors([
            'priority' => 'The priority must be one of: low, medium, high.',
        ]);
        $this->assertDatabaseEmpty('projects');
    }

    #[TestWith(['planning'])]
    #[TestWith(['in_progress'])]
    #[TestWith(['on_hold'])]
    #[TestWith(['completed'])]
    public function test_store_accepts_every_status(string $status): void
    {
        $response = $this->postJson('/api/projects', $this->validPayload(['status' => $status]));

        $response->assertCreated()->assertJsonPath('data.status', $status);
    }

    #[TestWith(['low'])]
    #[TestWith(['medium'])]
    #[TestWith(['high'])]
    public function test_store_accepts_every_priority(string $priority): void
    {
        $response = $this->postJson('/api/projects', $this->validPayload(['priority' => $priority]));

        $response->assertCreated()->assertJsonPath('data.priority', $priority);
    }

    public function test_store_returns_422_when_due_date_is_earlier_than_start_date(): void
    {
        $response = $this->postJson('/api/projects', $this->validPayload([
            'start_date' => '2026-03-31',
            'due_date' => '2026-03-30',
        ]));

        $response->assertUnprocessable()->assertJsonValidationErrors([
            'due_date' => 'The due date cannot be earlier than the start date.',
        ]);
        $this->assertDatabaseEmpty('projects');
    }

    public function test_store_accepts_due_date_equal_to_start_date(): void
    {
        $response = $this->postJson('/api/projects', $this->validPayload([
            'start_date' => '2026-03-31',
            'due_date' => '2026-03-31',
        ]));

        $response->assertCreated()->assertJsonPath('data.due_date', '2026-03-31');
    }

    public function test_store_returns_422_when_a_date_is_not_a_valid_date(): void
    {
        $response = $this->postJson('/api/projects', $this->validPayload([
            'start_date' => 'next week',
            'due_date' => '31/03/2026',
        ]));

        $response->assertUnprocessable()->assertJsonValidationErrors([
            'start_date' => 'The start date field must match the format Y-m-d.',
            'due_date' => 'The due date field must match the format Y-m-d.',
        ]);
        $this->assertDatabaseEmpty('projects');
    }

    public function test_valid_payload_updates_project_and_returns_200(): void
    {
        $project = Project::factory()->create();

        $response = $this->putJson("/api/projects/{$project->id}", $this->validPayload([
            'project_name' => 'Mobile App',
            'status' => 'completed',
            'priority' => 'high',
        ]));

        $response->assertOk()
            ->assertJsonPath('data.id', $project->id)
            ->assertJsonPath('data.project_name', 'Mobile App')
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.priority', 'high');
        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'client_name' => 'Acme Studio',
            'project_name' => 'Mobile App',
            'status' => 'completed',
            'priority' => 'high',
        ]);
    }

    public function test_update_returns_422_and_leaves_project_unchanged_when_payload_is_invalid(): void
    {
        $project = Project::factory()->create(['client_name' => 'Acme Studio', 'status' => ProjectStatus::Planning]);

        $response = $this->putJson("/api/projects/{$project->id}", $this->validPayload([
            'client_name' => '',
            'status' => 'archived',
            'start_date' => '2026-03-31',
            'due_date' => '2026-03-01',
        ]));

        $response->assertUnprocessable()->assertJsonValidationErrors([
            'client_name' => 'The client name field is required.',
            'status' => 'The status must be one of: planning, in_progress, on_hold, completed.',
            'due_date' => 'The due date cannot be earlier than the start date.',
        ]);
        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'client_name' => 'Acme Studio',
            'status' => 'planning',
        ]);
    }

    public function test_update_returns_404_when_project_does_not_exist(): void
    {
        $response = $this->putJson('/api/projects/999', $this->validPayload());

        $response->assertNotFound()->assertExactJson(['message' => 'Project not found.']);
    }

    public function test_destroy_deletes_project_and_returns_204(): void
    {
        $project = Project::factory()->create();

        $response = $this->deleteJson("/api/projects/{$project->id}");

        $response->assertNoContent();
        $this->assertModelMissing($project);
    }

    public function test_destroy_returns_404_when_project_does_not_exist(): void
    {
        $response = $this->deleteJson('/api/projects/999');

        $response->assertNotFound()->assertExactJson(['message' => 'Project not found.']);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function validPayload(array $overrides = []): array
    {
        return [
            'client_name' => 'Acme Studio',
            'project_name' => 'Website Redesign',
            'description' => 'Refresh the marketing site.',
            'status' => 'planning',
            'priority' => 'medium',
            'start_date' => '2026-01-10',
            'due_date' => '2026-03-31',
            ...$overrides,
        ];
    }
}
