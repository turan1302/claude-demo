<?php

namespace Database\Seeders;

use App\Enums\ActionItemStatus;
use App\Enums\AnalysisStatus;
use App\Enums\EstimatedImpact;
use App\Enums\SiteStatus;
use App\Models\ActionItem;
use App\Models\ActionPlan;
use App\Models\AnalysisFinding;
use App\Models\Site;
use App\Models\SiteAnalysis;
use App\Models\User;
use Database\Factories\AnalysisFindingFactory;
use Illuminate\Database\Seeder;

/**
 * Seeds one demo user with a handful of sites carrying a full, completed
 * analysis -> findings -> action plan -> action items chain, so the
 * frontend can be built against realistic data without running the real
 * analysis job queue.
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::factory()->create([
            'name' => 'Demo Kullanıcı',
            'email' => 'demo@example.com',
        ]);

        $siteDefinitions = [
            ['url' => 'https://example.com', 'name' => 'Example Corp'],
            ['url' => 'https://acme-blog.test', 'name' => 'Acme Blog'],
            ['url' => 'https://shoply.test', 'name' => 'Shoply Mağaza'],
        ];

        foreach ($siteDefinitions as $definition) {
            $site = Site::factory()->analyzed()->create([
                'user_id' => $user->id,
                'url' => $definition['url'],
                'name' => $definition['name'],
            ]);

            $analysis = SiteAnalysis::factory()->create([
                'site_id' => $site->id,
                'version' => 1,
                'status' => AnalysisStatus::Completed,
            ]);

            $findings = collect(AnalysisFindingFactory::SAMPLE_FINDINGS)
                ->random(4)
                ->map(fn (array $sample) => AnalysisFinding::factory()->create([
                    'site_analysis_id' => $analysis->id,
                    'category' => $sample['category'],
                    'type' => $sample['type'],
                    'severity' => $sample['severity'],
                    'title' => $sample['title'],
                    'score_impact' => $sample['impact'],
                ]));

            $plan = ActionPlan::factory()->create([
                'site_analysis_id' => $analysis->id,
            ]);

            foreach ($findings->values() as $index => $finding) {
                ActionItem::factory()->create([
                    'action_plan_id' => $plan->id,
                    'analysis_finding_id' => $finding->id,
                    'category' => $finding->category,
                    'priority' => $finding->severity,
                    'title' => $finding->title,
                    'description' => $finding->description,
                    'estimated_impact' => $finding->score_impact >= 8 ? EstimatedImpact::High : ($finding->score_impact >= 5 ? EstimatedImpact::Medium : EstimatedImpact::Low),
                    'status' => $index === 0 ? ActionItemStatus::Completed : ActionItemStatus::Pending,
                    'position' => $index,
                ]);
            }
        }

        // Bir site için "analiz sürüyor" durumunu da gösterelim (realtime UI testi için).
        $pendingSite = Site::factory()->create([
            'user_id' => $user->id,
            'url' => 'https://pending-analysis.test',
            'name' => 'Analiz Bekleyen Site',
            'status' => SiteStatus::Analyzing,
        ]);

        SiteAnalysis::factory()->queued()->create([
            'site_id' => $pendingSite->id,
            'version' => 1,
            'status' => AnalysisStatus::Processing,
            'current_step' => 'seo_analyzers',
        ]);
    }
}
