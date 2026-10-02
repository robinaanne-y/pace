<?php

namespace Database\Seeders;

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use App\Models\Project;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (File::json(base_path('docs/test_data.json')) as $project) {
            Project::updateOrCreate(
                [
                    'client_name' => $project['clientName'],
                    'project_name' => $project['projectName'],
                ],
                [
                    'description' => $project['description'],
                    'status' => ProjectStatus::from(Str::snake($project['status'])),
                    'priority' => ProjectPriority::from(Str::snake($project['priority'])),
                    'start_date' => $project['startDate'],
                    'due_date' => $project['dueDate'],
                ],
            );
        }
    }
}
