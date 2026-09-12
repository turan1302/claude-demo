<?php

namespace App\Enums;

enum FindingSource: string
{
    case Rule = 'rule';
    case Pagespeed = 'pagespeed';
    case Llm = 'llm';
}
