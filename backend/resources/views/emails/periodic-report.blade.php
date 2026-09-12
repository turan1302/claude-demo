<!doctype html>
<html lang="tr">
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, Arial, sans-serif; background: #f5f5f6; margin: 0; padding: 24px; color: #1c1b19; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden; }
        .header { padding: 24px 28px; border-bottom: 1px solid #e4e4e7; }
        .header h1 { margin: 0; font-size: 18px; }
        .header p { margin: 4px 0 0; color: #6e6e76; font-size: 13px; }
        .site { padding: 20px 28px; border-bottom: 1px solid #e4e4e7; }
        .site:last-child { border-bottom: none; }
        .site h2 { margin: 0 0 4px; font-size: 15px; }
        .site .url { color: #6e6e76; font-size: 12px; margin-bottom: 12px; }
        .scores { display: flex; gap: 16px; margin-bottom: 12px; }
        .score { font-size: 13px; }
        .score strong { font-size: 20px; display: block; }
        .findings { font-size: 13px; color: #1c1b19; }
        .findings li { margin-bottom: 4px; }
        .footer { padding: 16px 28px; font-size: 11px; color: #9b9ba3; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{ $period_label }} SEO/GEO Özeti</h1>
            <p>{{ $user_name }} için {{ $generated_at->translatedFormat('d F Y') }} tarihli rapor</p>
        </div>

        @forelse ($sites as $site)
            <div class="site">
                <h2>{{ $site['name'] }}</h2>
                <div class="url">{{ $site['url'] }}</div>
                <div class="scores">
                    <div class="score">SEO<br><strong>{{ $site['seo_score'] ?? '—' }}</strong></div>
                    <div class="score">GEO<br><strong>{{ $site['geo_score'] ?? '—' }}</strong></div>
                    <div class="score">Kritik Bulgu<br><strong>{{ $site['critical_finding_count'] }}</strong></div>
                    <div class="score">Bekleyen Kritik Aksiyon<br><strong>{{ $site['pending_critical_action_items'] }}</strong></div>
                </div>
                @if ($site['top_critical_findings']->isNotEmpty())
                    <ul class="findings">
                        @foreach ($site['top_critical_findings'] as $title)
                            <li>{{ $title }}</li>
                        @endforeach
                    </ul>
                @endif
            </div>
        @empty
            <div class="site">Henüz analiz edilmiş bir site bulunmuyor.</div>
        @endforelse

        <div class="footer">Bu e-posta Ufuk SEO/GEO Yönetim Paneli tarafından otomatik gönderilmiştir.</div>
    </div>
</body>
</html>
