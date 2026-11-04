<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DailyGlobeArticle;
use App\Models\DailyGlobeComment;
use App\Models\DailyGlobeSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DailyGlobeAdminController extends Controller
{
    /**
     * Display the Daily Globes newsroom & editorial management console.
     */
    public function index(Request $request): Response
    {
        DailyGlobeArticle::ensureDefaultArticlesExist();
        $setting = DailyGlobeSetting::current();

        $category = $request->query('category', 'all');
        $status = $request->query('status', 'all');
        $search = $request->query('search', '');

        $query = DailyGlobeArticle::with('comments')
            ->orderByDesc('is_featured')
            ->orderBy('sort_order', 'asc')
            ->orderByDesc('id');

        if ($category && $category !== 'all') {
            $query->where('category', $category);
        }

        if ($status === 'published') {
            $query->where('is_published', true);
        } elseif ($status === 'draft') {
            $query->where('is_published', false);
        } elseif ($status === 'featured') {
            $query->where('is_featured', true);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('author', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        $articles = $query->get()->map(fn (DailyGlobeArticle $a) => $a->toFrontendArray(includeComments: true));

        $stats = [
            'total_articles' => DailyGlobeArticle::count(),
            'published_count' => DailyGlobeArticle::where('is_published', true)->count(),
            'draft_count' => DailyGlobeArticle::where('is_published', false)->count(),
            'featured_count' => DailyGlobeArticle::where('is_featured', true)->count(),
            'total_views' => (int) DailyGlobeArticle::sum('views_count'),
        ];

        return Inertia::render('Admin/DailyGlobe/Index', [
            'articles' => $articles,
            'settings' => [
                'edition_date' => $setting->edition_date,
                'edition_meta' => $setting->edition_meta ?: DailyGlobeSetting::defaultEditionMeta(),
                'breaking_news' => $setting->breaking_news ?: DailyGlobeSetting::defaultBreakingNews(),
                'weather_report' => $setting->weather_report ?: DailyGlobeSetting::defaultWeatherReport(),
                'market_index' => $setting->market_index ?: DailyGlobeSetting::defaultMarketIndex(),
                'community_channels' => $setting->community_channels ?: DailyGlobeSetting::defaultCommunityChannels(),
                'categories' => $setting->categories ?: DailyGlobeSetting::defaultCategories(),
            ],
            'defaultLayoutSettings' => DailyGlobeArticle::defaultLayoutSettings(),
            'stats' => $stats,
            'filters' => [
                'category' => $category,
                'status' => $status,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created article with full custom blocks & layout settings.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateArticle($request);

        $slug = ! empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['title']);
        if (DailyGlobeArticle::where('slug', $slug)->exists()) {
            $slug .= '-'.substr(uniqid(), -4);
        }

        if (! empty($validated['is_featured'])) {
            DailyGlobeArticle::where('is_featured', true)->update(['is_featured' => false]);
        }

        $contentBlocks = $validated['content_blocks'] ?? [];
        $compiledContent = $this->compilePlainContentFromBlocks($contentBlocks, $validated['content'] ?? '');

        DailyGlobeArticle::create([
            'title' => $validated['title'],
            'short_title' => $validated['short_title'] ?? null,
            'slug' => $slug,
            'subtitle' => $validated['subtitle'] ?? null,
            'excerpt' => $validated['excerpt'],
            'content' => $compiledContent,
            'content_blocks' => $contentBlocks,
            'layout_settings' => array_merge(
                DailyGlobeArticle::defaultLayoutSettings(),
                $validated['layout_settings'] ?? []
            ),
            'category' => $validated['category'],
            'category_label' => $validated['category_label'] ?: $this->resolveCategoryLabel($validated['category']),
            'badge' => $validated['badge'] ?: 'Liputan Khusus',
            'location' => $validated['location'] ?: 'San Andreas',
            'author' => $validated['author'] ?: 'Redaksi The Daily Globes',
            'author_role' => $validated['author_role'] ?: 'Jurnalis Investigasi',
            'published_date' => $validated['published_date'] ?: now()->translatedFormat('d F Y'),
            'published_time' => $validated['published_time'] ?: now()->format('H:i').' SAST',
            'read_time' => $validated['read_time'] ?: '4 Menit Baca',
            'views_count' => (int) ($validated['views_count'] ?? 1),
            'image' => $validated['image'] ?? null,
            'image_caption' => $validated['image_caption'] ?? null,
            'secondary_image' => $validated['secondary_image'] ?? null,
            'secondary_caption' => $validated['secondary_caption'] ?? null,
            'quote' => $validated['quote'] ?? null,
            'quote_author' => $validated['quote_author'] ?? null,
            'metrics' => array_values(array_filter($validated['metrics'] ?? [], fn ($m) => ! empty($m['label']) || ! empty($m['value']))),
            'is_featured' => $request->boolean('is_featured'),
            'is_published' => $request->boolean('is_published', true),
            'sort_order' => (int) ($validated['sort_order'] ?? 0),
        ]);

        return back()->with('success', 'Artikel berita baru berhasil diterbitkan ke The Daily Globes.');
    }

    /**
     * Update an existing article.
     */
    public function update(Request $request, DailyGlobeArticle $article): RedirectResponse
    {
        $validated = $this->validateArticle($request, $article->id);

        $slug = ! empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($validated['title']);
        if (DailyGlobeArticle::where('slug', $slug)->where('id', '!=', $article->id)->exists()) {
            $slug .= '-'.$article->id;
        }

        if ($request->boolean('is_featured') && ! $article->is_featured) {
            DailyGlobeArticle::where('id', '!=', $article->id)->update(['is_featured' => false]);
        }

        $contentBlocks = $validated['content_blocks'] ?? [];
        $compiledContent = $this->compilePlainContentFromBlocks($contentBlocks, $validated['content'] ?? '');

        $article->update([
            'title' => $validated['title'],
            'short_title' => $validated['short_title'] ?? null,
            'slug' => $slug,
            'subtitle' => $validated['subtitle'] ?? null,
            'excerpt' => $validated['excerpt'],
            'content' => $compiledContent,
            'content_blocks' => $contentBlocks,
            'layout_settings' => array_merge(
                DailyGlobeArticle::defaultLayoutSettings(),
                $validated['layout_settings'] ?? []
            ),
            'category' => $validated['category'],
            'category_label' => $validated['category_label'] ?: $this->resolveCategoryLabel($validated['category']),
            'badge' => $validated['badge'] ?: 'Liputan Khusus',
            'location' => $validated['location'] ?: 'San Andreas',
            'author' => $validated['author'] ?: 'Redaksi The Daily Globes',
            'author_role' => $validated['author_role'] ?: 'Jurnalis Investigasi',
            'published_date' => $validated['published_date'] ?: $article->published_date,
            'published_time' => $validated['published_time'] ?: $article->published_time,
            'read_time' => $validated['read_time'] ?: '4 Menit Baca',
            'views_count' => (int) ($validated['views_count'] ?? $article->views_count),
            'image' => $validated['image'] ?? null,
            'image_caption' => $validated['image_caption'] ?? null,
            'secondary_image' => $validated['secondary_image'] ?? null,
            'secondary_caption' => $validated['secondary_caption'] ?? null,
            'quote' => $validated['quote'] ?? null,
            'quote_author' => $validated['quote_author'] ?? null,
            'metrics' => array_values(array_filter($validated['metrics'] ?? [], fn ($m) => ! empty($m['label']) || ! empty($m['value']))),
            'is_featured' => $request->boolean('is_featured'),
            'is_published' => $request->boolean('is_published'),
            'sort_order' => (int) ($validated['sort_order'] ?? $article->sort_order),
        ]);

        return back()->with('success', "Artikel '{$article->title}' berhasil diperbarui.");
    }

    /**
     * Delete an article.
     */
    public function destroy(DailyGlobeArticle $article): RedirectResponse
    {
        $title = $article->title;
        $article->delete();

        return back()->with('success', "Artikel '{$title}' berhasil dihapus dari arsip.");
    }

    /**
     * Set an article as the primary Lead / Headline Investigation.
     */
    public function toggleFeatured(DailyGlobeArticle $article): RedirectResponse
    {
        if (! $article->is_featured) {
            DailyGlobeArticle::where('id', '!=', $article->id)->update(['is_featured' => false]);
            $article->update(['is_featured' => true, 'is_published' => true]);

            return back()->with('success', "Artikel '{$article->title}' ditetapkan sebagai Berita Utama (Lead Investigation).");
        }

        $article->update(['is_featured' => false]);

        return back()->with('success', "Status Berita Utama dicabut dari '{$article->title}'.");
    }

    /**
     * Toggle publish / draft status of an article.
     */
    public function togglePublish(DailyGlobeArticle $article): RedirectResponse
    {
        $article->update([
            'is_published' => ! $article->is_published,
        ]);

        $statusLabel = $article->is_published ? 'dipublikasikan' : 'disimpan ke draft';

        return back()->with('success', "Artikel '{$article->title}' berhasil {$statusLabel}.");
    }

    /**
     * Delete a citizen comment from an article.
     */
    public function destroyComment(DailyGlobeComment $comment): RedirectResponse
    {
        $comment->delete();

        return back()->with('success', 'Komentar warga berhasil dihapus.');
    }

    /**
     * Update global newspaper settings (Ticker, Edition Meta, Weather, Market Index, Channels).
     */
    public function updateSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'edition_date' => ['required', 'string', 'max:255'],
            'edition_meta' => ['nullable', 'array'],
            'breaking_news' => ['nullable', 'array'],
            'breaking_news.*' => ['nullable', 'string'],
            'weather_report' => ['nullable', 'array'],
            'market_index' => ['nullable', 'array'],
            'community_channels' => ['nullable', 'array'],
            'categories' => ['nullable', 'array'],
        ]);

        $setting = DailyGlobeSetting::current();
        $setting->edition_date = $validated['edition_date'];
        $setting->edition_meta = $validated['edition_meta'] ?? $setting->edition_meta;
        $setting->breaking_news = array_values(array_filter($validated['breaking_news'] ?? []));
        $setting->weather_report = array_values(array_filter($validated['weather_report'] ?? [], fn ($w) => ! empty($w['city'])));
        $setting->market_index = array_values(array_filter($validated['market_index'] ?? [], fn ($m) => ! empty($m['name'])));
        $setting->community_channels = $validated['community_channels'] ?? $setting->community_channels;
        if (! empty($validated['categories'])) {
            $setting->categories = $validated['categories'];
        }
        $setting->save();

        return back()->with('success', 'Konfigurasi portal The Daily Globes (Edisi, Breaking News, Cuaca & Bursa) berhasil disimpan.');
    }

    /**
     * Validate incoming article payload.
     *
     * @return array<string, mixed>
     */
    private function validateArticle(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:300'],
            'short_title' => ['nullable', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:300',
                Rule::unique('daily_globe_articles', 'slug')->ignore($ignoreId),
            ],
            'subtitle' => ['nullable', 'string', 'max:500'],
            'excerpt' => ['required', 'string', 'max:1000'],
            'content' => ['nullable', 'string'],
            'content_blocks' => ['nullable', 'array'],
            'layout_settings' => ['nullable', 'array'],
            'category' => ['required', 'string', 'max:100'],
            'category_label' => ['nullable', 'string', 'max:150'],
            'badge' => ['nullable', 'string', 'max:100'],
            'location' => ['nullable', 'string', 'max:150'],
            'author' => ['required', 'string', 'max:150'],
            'author_role' => ['nullable', 'string', 'max:150'],
            'published_date' => ['nullable', 'string', 'max:100'],
            'published_time' => ['nullable', 'string', 'max:100'],
            'read_time' => ['nullable', 'string', 'max:100'],
            'views_count' => ['nullable', 'integer', 'min:0'],
            'image' => ['nullable', 'string', 'max:2000'],
            'image_caption' => ['nullable', 'string', 'max:1000'],
            'secondary_image' => ['nullable', 'string', 'max:2000'],
            'secondary_caption' => ['nullable', 'string', 'max:1000'],
            'quote' => ['nullable', 'string', 'max:1000'],
            'quote_author' => ['nullable', 'string', 'max:255'],
            'metrics' => ['nullable', 'array'],
            'is_featured' => ['boolean'],
            'is_published' => ['boolean'],
            'sort_order' => ['nullable', 'integer'],
        ]);
    }

    /**
     * Compile structured blocks into fallback plain text content.
     *
     * @param  array<int, array<string, mixed>>  $blocks
     */
    private function compilePlainContentFromBlocks(array $blocks, string $fallbackContent = ''): string
    {
        if (empty($blocks)) {
            return $fallbackContent;
        }

        $parts = [];
        foreach ($blocks as $block) {
            $type = $block['type'] ?? 'paragraph';
            if (in_array($type, ['paragraph', 'heading', 'callout'], true) && ! empty($block['text'])) {
                $parts[] = trim((string) $block['text']);
            }
        }

        return ! empty($parts) ? implode("\n\n", $parts) : $fallbackContent;
    }

    /**
     * Resolve human-readable category label from slug.
     */
    private function resolveCategoryLabel(string $category): string
    {
        $map = [
            'investigasi' => 'Investigasi Khusus',
            'kriminal' => 'Kriminal & Hukum',
            'otomotif' => 'Otomotif & Bisnis',
            'pedesaan' => 'Pedesaan (Flint & Bone)',
            'opini' => 'Opini & Warga',
            'edisi-cetak' => 'Edisi Cetak',
        ];

        return $map[$category] ?? ucfirst($category);
    }
}
