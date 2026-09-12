<?php

namespace App\Enums;

enum FindingCategory: string
{
    case Seo = 'seo';
    case Geo = 'geo';
    case Technical = 'technical';
    case Content = 'content';
}
