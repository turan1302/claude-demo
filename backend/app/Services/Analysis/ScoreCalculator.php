<?php

namespace App\Services\Analysis;

use App\Enums\FindingCategory;
use Illuminate\Support\Collection;

class ScoreCalculator
{
    /**
     * @param  Collection<int, \App\Models\AnalysisFinding>  $findings
     * @return array{seo: int, geo: int}
     */
    public function calculate(Collection $findings): array
    {
        $geoImpact = $findings
            ->where('category', FindingCategory::Geo)
            ->sum('score_impact');

        $seoImpact = $findings
            ->whereIn('category', [FindingCategory::Seo, FindingCategory::Technical, FindingCategory::Content])
            ->sum('score_impact');

        return [
            'seo' => max(0, 100 - (int) $seoImpact),
            'geo' => max(0, 100 - (int) $geoImpact),
        ];
    }
}
