<?php

namespace App\Enums;

/**
 * Shared severity/priority scale used by both analysis_findings.severity
 * and action_items.priority — the two are the same domain concept.
 */
enum Priority: string
{
    case Critical = 'critical';
    case Important = 'important';
    case Improvement = 'improvement';
}
