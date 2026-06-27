<?php

namespace App\Ai\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Http;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use RuntimeException;
use Stringable;

class TavilyWebSearch implements Tool
{
    protected int $maxResults = 5;

    protected array $allowedDomains = [];

    /**
     * Set the maximum number of search results.
     */
    public function max(int $maxResults): static
    {
        $this->maxResults = $maxResults;

        return $this;
    }

    /**
     * Restrict search to specific domains.
     */
    public function allow(array $domains): static
    {
        $this->allowedDomains = $domains;

        return $this;
    }

    /**
     * Get the description of the tool's purpose.
     */
    public function description(): Stringable|string
    {
        return 'Search the web for current information using Tavily API. Use this to find up-to-date educational content, curriculum requirements, teaching standards, and academic resources.';
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): Stringable|string
    {
        $query = $request['query'];
        $includeAnswer = $request['include_answer'] ?? true;
        $includeRawContent = $request['include_raw_content'] ?? false;

        $apiKey = config('services.tavily.key');

        if (empty($apiKey)) {
            throw new RuntimeException('Tavily API key not configured. Set TAVILY_API_KEY in your .env file.');
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer '.$apiKey,
            'Content-Type' => 'application/json',
        ])->post('https://api.tavily.com/search', [
            'query' => $query,
            'max_results' => $this->maxResults,
            'include_answer' => $includeAnswer,
            'include_raw_content' => $includeRawContent,
            'search_depth' => 'basic',
            'topic' => 'general',
            'include_domains' => $this->allowedDomains,
            'exclude_domains' => [],
        ]);

        if (! $response->successful()) {
            throw new RuntimeException(
                'Tavily search failed with status '.$response->status().': '.$response->body()
            );
        }

        $data = $response->json();

        $formattedResults = [
            'answer' => $data['answer'] ?? null,
            'results' => collect($data['results'] ?? [])->map(fn ($result) => [
                'title' => $result['title'] ?? '',
                'url' => $result['url'] ?? '',
                'content' => $result['content'] ?? '',
                'score' => $result['score'] ?? 0,
            ])->toArray(),
            'query' => $query,
            'total_results' => count($data['results'] ?? []),
        ];

        return json_encode($formattedResults);
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'query' => $schema->string()->required()->description('The search query to find information on the web'),
            'include_answer' => $schema->boolean()->default(true)->description('Whether to include a generated answer summary'),
            'include_raw_content' => $schema->boolean()->default(false)->description('Whether to include raw HTML content of pages'),
        ];
    }
}
