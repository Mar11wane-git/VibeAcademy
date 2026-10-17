<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SupportTicketMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $ticket;

    /**
     * Create a new message instance.
     */
    public function __construct(array $ticket)
    {
        $this->ticket = $ticket;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $priority = strtolower($this->ticket['priority'] ?? 'normale');
        $prefix = match($priority) {
            'urgente', 'urgent' => '🚨 [URGENT]',
            'haute', 'high'     => '⚡ [HAUTE PRIORITÉ]',
            default             => '🎫 [TICKET SUPPORT]',
        };

        return new Envelope(
            subject: "{$prefix} Nouveau Ticket #{$this->ticket['ticket_ref']} — {$this->ticket['subject']}",
            replyTo: [
                new Address($this->ticket['email'], $this->ticket['name']),
            ],
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.support_ticket',
        );
    }
}
