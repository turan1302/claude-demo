<?php

namespace App\Mail;

use App\Enums\ReportFormat;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * Kasıtlı olarak ShouldQueue UYGULAMIYOR: bu Mailable zaten kuyruklu
 * SendPeriodicReportJob içinden, senkron olarak gönderiliyor. Mailable'ın
 * kendisi de kuyruklanabilir olsaydı gönderim gerçekten tamamlanmadan
 * `last_sent_at` güncellenebilirdi (Mail::send() ikinci bir job'a
 * devrederdi) — gönderim hatası sessizce yutulmuş olurdu.
 */
class PeriodicReportMail extends Mailable
{

    /**
     * @param  array<string, mixed>  $reportData
     */
    public function __construct(
        public readonly array $reportData,
        public readonly ReportFormat $format,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "{$this->reportData['period_label']} SEO/GEO Özeti",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.periodic-report',
            with: $this->reportData,
        );
    }

    /**
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        if ($this->format !== ReportFormat::EmailWithPdf) {
            return [];
        }

        $pdf = Pdf::loadView('emails.periodic-report', $this->reportData);

        return [
            Attachment::fromData(fn () => $pdf->output(), 'seo-geo-raporu.pdf')
                ->withMime('application/pdf'),
        ];
    }
}
