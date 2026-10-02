<?php

namespace Tests\Feature;

use PHPUnit\Framework\Attributes\TestWith;
use Tests\TestCase;

class WebRoutesTest extends TestCase
{
    #[TestWith(['/'])]
    #[TestWith(['/projects'])]
    #[TestWith(['/projects/create'])]
    #[TestWith(['/projects/1/edit'])]
    public function test_application_urls_render_the_vue_shell(string $url): void
    {
        $response = $this->withoutVite()->get($url);

        $response->assertOk()->assertViewIs('app');
    }

    public function test_unknown_api_url_returns_404_instead_of_the_vue_shell(): void
    {
        $response = $this->getJson('/api/unknown');

        $response->assertNotFound()->assertJsonStructure(['message']);
    }
}
