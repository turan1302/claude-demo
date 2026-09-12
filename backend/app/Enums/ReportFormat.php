<?php

namespace App\Enums;

enum ReportFormat: string
{
    case EmailSummary = 'email_summary';
    case EmailWithPdf = 'email_with_pdf';
}
