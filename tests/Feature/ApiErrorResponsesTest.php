<?php

namespace Tests\Feature;

use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use PHPUnit\Framework\Attributes\TestWith;
use Tests\TestCase;

class ApiErrorResponsesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['app.debug' => false]);
    }

    public function test_unknown_endpoint_returns_a_json_message_without_internals(): void
    {
        $response = $this->getJson('/api/nope');

        $response->assertNotFound()->assertExactJson(['message' => 'The route api/nope could not be found.']);
    }

    public function test_unsupported_method_returns_a_json_message_without_internals(): void
    {
        $response = $this->deleteJson('/api/projects');

        $response->assertMethodNotAllowed()->assertExactJson(['message' => 'The DELETE method is not supported for route api/projects. Supported methods: GET, HEAD, POST.']);
    }

    public function test_unexpected_failure_returns_500_without_exposing_the_exception(): void
    {
        Route::get('/api/boom', fn () => throw new \RuntimeException('database password is hunter2'));

        $response = $this->getJson('/api/boom');

        $response->assertServerError()->assertExactJson(['message' => 'Server Error']);
    }

    public function test_error_is_json_even_when_the_client_does_not_ask_for_json(): void
    {
        $response = $this->get('/api/projects/999');

        $response->assertNotFound()->assertExactJson(['message' => 'Project not found.']);
    }

    #[TestWith(['abc'])]
    #[TestWith(['1abc'])]
    #[TestWith(['1 OR 1=1'])]
    #[TestWith(["1' OR '1'='1"])]
    public function test_non_numeric_project_id_returns_404_instead_of_matching_a_project(string $id): void
    {
        Project::factory()->create(['id' => 1]);

        $response = $this->getJson('/api/projects/'.rawurlencode($id));

        // MySQL reads "1abc" as 1, so the id must be rejected by the route before any lookup happens.
        $response->assertNotFound();
        $this->assertStringStartsWith('The route api/projects/', $response->json('message'));
    }

    public function test_non_numeric_project_id_does_not_update_or_delete_a_project(): void
    {
        $project = Project::factory()->create(['id' => 1, 'project_name' => 'Untouched']);

        $update = $this->putJson('/api/projects/1abc', ['client_name' => 'x', 'project_name' => 'Changed', 'status' => 'planning', 'priority' => 'low']);
        $delete = $this->deleteJson('/api/projects/1abc');

        $update->assertNotFound();
        $delete->assertNotFound();
        $this->assertStringStartsWith('The route api/projects/', $update->json('message'));
        $this->assertStringStartsWith('The route api/projects/', $delete->json('message'));

        $this->assertDatabaseHas('projects', ['id' => 1, 'project_name' => 'Untouched']);
        $this->assertModelExists($project);
    }
}
