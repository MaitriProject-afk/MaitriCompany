<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DailyGlobePortalTest extends TestCase
{
    public function test_daily_globe_landing_page_renders_successfully(): void
    {
        $response = $this->get(route('dailyglobe.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('DailyGlobe/Index')
            ->has('articles')
            ->has('categories')
            ->has('breakingNews')
            ->has('weatherReport')
            ->has('marketIndex')
            ->has('communityChannels')
        );
    }

    public function test_daily_globe_filters_by_category(): void
    {
        $response = $this->get(route('dailyglobe.index', ['category' => 'investigasi']));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('DailyGlobe/Index')
            ->where('activeCategory', 'investigasi')
            ->has('articles')
        );
    }

    public function test_daily_globe_searches_articles(): void
    {
        $response = $this->get(route('dailyglobe.index', ['search' => 'Palomino']));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('DailyGlobe/Index')
            ->where('searchQuery', 'Palomino')
            ->has('articles')
        );
    }

    public function test_daily_globe_single_article_shows_successfully(): void
    {
        $slug = 'operasi-terpadu-lintas-palomino-aparat-tertibkan-jalur-ekspedisi-liar';
        $response = $this->get(route('dailyglobe.show', $slug));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('DailyGlobe/Show')
            ->has('article')
            ->where('article.slug', $slug)
        );
    }

    public function test_daily_globe_article_404_for_unknown_slug(): void
    {
        $response = $this->get(route('dailyglobe.show', 'unknown-article-slug'));

        $response->assertStatus(404);
    }

    public function test_daily_globe_aliases_redirect_to_index(): void
    {
        $response1 = $this->get('/berita');
        $response1->assertRedirect(route('dailyglobe.index'));

        $response2 = $this->get('/news');
        $response2->assertRedirect(route('dailyglobe.index'));
    }
}
