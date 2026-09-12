<?php

namespace App\Enums;

enum IntegrationProvider: string
{
    case PagespeedInsights = 'pagespeed_insights';
    case Anthropic = 'anthropic';
    case Openai = 'openai';
}
