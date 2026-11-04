<?php

namespace App\Http\Controllers;

use App\Models\DailyGlobeArticle;
use App\Models\DailyGlobeComment;
use App\Models\DailyGlobeSetting;
use App\Models\RadioSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class DailyGlobeController extends Controller
{
    /**
     * Display the Daily Globes public news landing page.
     */
    public function index(Request $request): Response
    {
        $category = $request->query('category', 'all');
        $search = $request->query('search', '');
        $articleSlug = $request->query('read', null);

        $articles = $this->resolvePublishedArticles();
        $setting = $this->resolveSettings();

        $filteredArticles = collect($articles)->when($category && $category !== 'all', function ($collection) use ($category) {
            return $collection->where('category', $category);
        })->when($search, function ($collection) use ($search) {
            return $collection->filter(function ($item) use ($search) {
                return str_contains(strtolower($item['title']), strtolower($search)) ||
                    str_contains(strtolower($item['excerpt']), strtolower($search)) ||
                    str_contains(strtolower($item['author']), strtolower($search));
            });
        })->values()->all();

        $leadArticle = collect($articles)->firstWhere('featured', true) ?? ($articles[0] ?? null);

        return Inertia::render('DailyGlobe/Index', [
            'articles' => $filteredArticles,
            'allArticles' => $articles,
            'leadArticle' => $leadArticle,
            'breakingNews' => $setting['breakingNews'],
            'trendingArticles' => array_slice($articles, 0, 5),
            'editorsPicks' => array_slice($articles, 1, 3),
            'categories' => $setting['categories'],
            'weatherReport' => $setting['weatherReport'],
            'marketIndex' => $setting['marketIndex'],
            'activeCategory' => $category,
            'searchQuery' => $search,
            'activeArticleSlug' => $articleSlug,
            'editionDate' => $setting['editionDate'],
            'editionMeta' => $setting['editionMeta'],
            'communityChannels' => $setting['communityChannels'],
            'radioBroadcast' => RadioSetting::current()->toBroadcastPayload(),
        ]);
    }

    /**
     * Show a single article page.
     */
    public function show(string $slug): Response
    {
        $article = null;

        if (Schema::hasTable('daily_globe_articles')) {
            DailyGlobeArticle::ensureDefaultArticlesExist();
            $model = DailyGlobeArticle::with('comments')->where('slug', $slug)->first();

            if ($model) {
                $model->increment('views_count');
                $article = $model->toFrontendArray(includeComments: true);
            }
        }

        $articles = $this->resolvePublishedArticles(includeDraftSlug: $slug);

        if (! $article) {
            $article = collect($articles)->firstWhere('slug', $slug);
        }

        if (! $article) {
            abort(404, 'Artikel Berita Tidak Ditemukan');
        }

        $related = collect($articles)
            ->where('id', '!==', $article['id'])
            ->where('category', $article['category'])
            ->take(3)
            ->values()
            ->all();

        if (count($related) < 2) {
            $related = collect($articles)
                ->where('id', '!==', $article['id'])
                ->take(3)
                ->values()
                ->all();
        }

        $setting = $this->resolveSettings();

        return Inertia::render('DailyGlobe/Show', [
            'article' => $article,
            'relatedArticles' => $related,
            'communityChannels' => $setting['communityChannels'],
            'radioBroadcast' => RadioSetting::current()->toBroadcastPayload(),
        ]);
    }

    /**
     * Store a new citizen IC comment on an article.
     */
    public function storeComment(Request $request, string $slug): RedirectResponse
    {
        $article = DailyGlobeArticle::where('slug', $slug)->firstOrFail();

        $validated = $request->validate([
            'author' => ['required', 'string', 'max:100'],
            'region' => ['nullable', 'string', 'max:100'],
            'role_badge' => ['nullable', 'string', 'max:100'],
            'text' => ['required', 'string', 'max:1500'],
        ]);

        DailyGlobeComment::create([
            'daily_globe_article_id' => $article->id,
            'author' => trim($validated['author']),
            'region' => ! empty($validated['region']) ? trim($validated['region']) : 'San Andreas',
            'role_badge' => ! empty($validated['role_badge']) ? trim($validated['role_badge']) : 'Warga San Andreas',
            'text' => trim($validated['text']),
            'published_time' => now()->format('H:i').' SAST',
        ]);

        return back()->with('success', 'Tanggapan / kesaksian IC Anda berhasil dipublikasikan.');
    }

    /**
     * Resolve published articles from database (auto-seeding if empty).
     *
     * @return array<int, array<string, mixed>>
     */
    private function resolvePublishedArticles(?string $includeDraftSlug = null): array
    {
        if (! Schema::hasTable('daily_globe_articles')) {
            return DailyGlobeArticle::defaultSeedArticles();
        }

        DailyGlobeArticle::ensureDefaultArticlesExist();

        return DailyGlobeArticle::where(function ($q) use ($includeDraftSlug) {
            $q->where('is_published', true);
            if ($includeDraftSlug) {
                $q->orWhere('slug', $includeDraftSlug);
            }
        })
            ->orderByDesc('is_featured')
            ->orderBy('sort_order', 'asc')
            ->orderByDesc('id')
            ->get()
            ->map(fn (DailyGlobeArticle $a) => $a->toFrontendArray())
            ->all();
    }

    /**
     * Resolve global newspaper settings from database or fallback defaults.
     *
     * @return array<string, mixed>
     */
    private function resolveSettings(): array
    {
        if (! Schema::hasTable('daily_globe_settings')) {
            return [
                'editionDate' => 'Selasa, 13 Oktober 2026',
                'editionMeta' => DailyGlobeSetting::defaultEditionMeta(),
                'breakingNews' => DailyGlobeSetting::defaultBreakingNews(),
                'weatherReport' => DailyGlobeSetting::defaultWeatherReport(),
                'marketIndex' => DailyGlobeSetting::defaultMarketIndex(),
                'communityChannels' => DailyGlobeSetting::defaultCommunityChannels(),
                'categories' => DailyGlobeSetting::defaultCategories(),
            ];
        }

        $setting = DailyGlobeSetting::current();

        return [
            'editionDate' => $setting->edition_date ?: 'Selasa, 13 Oktober 2026',
            'editionMeta' => $setting->edition_meta ?: DailyGlobeSetting::defaultEditionMeta(),
            'breakingNews' => $setting->breaking_news ?: DailyGlobeSetting::defaultBreakingNews(),
            'weatherReport' => $setting->weather_report ?: DailyGlobeSetting::defaultWeatherReport(),
            'marketIndex' => $setting->market_index ?: DailyGlobeSetting::defaultMarketIndex(),
            'communityChannels' => $setting->community_channels ?: DailyGlobeSetting::defaultCommunityChannels(),
            'categories' => $setting->categories ?: DailyGlobeSetting::defaultCategories(),
        ];
    }
}
