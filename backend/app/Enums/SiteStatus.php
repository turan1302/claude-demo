<?php

namespace App\Enums;

enum SiteStatus: string
{
    case Pending = 'pending';
    case Analyzing = 'analyzing';
    case Analyzed = 'analyzed';
    case Error = 'error';
}
