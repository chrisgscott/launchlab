'use client';

import React, { useState } from 'react';
import { XCircle, Mail, ArrowRight } from 'lucide-react';
import { EmailTemplateId } from '@/libs/email-templates';

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisId: string;
  onSuccess: () => void;
  insights: any; // TODO: Type this properly
}

export default function EmailCaptureModal({
  isOpen,
  onClose,
  analysisId,
  onSuccess,
  insights,
}: EmailCaptureModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Create access token for the report
      const response = await fetch('/api/idea/report-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error('Failed to create report access');
      const { token } = await response.json();

      // Generate the report URL
      const reportUrl = `${window.location.origin}/idea/report/${token}`;

      // Send the validation report email
      await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          templateId: EmailTemplateId.VALIDATION_REPORT,
          params: {
            reportUrl,
            businessName: insights.businessName,
            score: insights.score,
          },
        }),
      });

      // Subscribe to the mailing list
      await fetch('/api/email/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          listId: 7,
        }),
      });

      setIsSubmitting(false);
      onSuccess();
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to send report. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-md w-full relative animate-slideIn">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-base-content/50 hover:text-base-content transition-colors"
        >
          <XCircle className="w-6 h-6" />
        </button>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Get Your Full Validation Report</h2>
            <p className="text-base-content/70">
              We&apos;ll send you a detailed report with everything you need to start validating
              your idea with real users.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input input-bordered w-full"
                placeholder="you@example.com"
                required
              />
            </div>

            {error && (
              <div className="text-error text-sm flex items-center gap-1">
                <XCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <>
                  Send Me the Report
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
