'use client';

import React, { useState } from 'react';
import { createClient } from '@/libs/supabase/client';
import { XCircle, Mail, ArrowRight } from 'lucide-react';

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisId: string;
  onSuccess: (token: string) => void;
}

export default function EmailCaptureModal({
  isOpen,
  onClose,
  analysisId,
  onSuccess,
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
      const supabase = createClient();

      // Store email and create access token
      const { data, error: dbError } = await supabase
        .from('report_access')
        .insert([
          {
            email,
            analysis_id: analysisId,
            access_token: crypto.randomUUID(), // Generate unique token
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          },
        ])
        .select('access_token')
        .single();

      if (dbError) throw dbError;

      // Call success callback with access token
      onSuccess(data.access_token);
    } catch (err) {
      console.error('Error saving email:', err);
      setError('Failed to save email. Please try again.');
    } finally {
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

            <button
              type="submit"
              disabled={isSubmitting || !email}
              className={`
                btn btn-primary w-full
                ${isSubmitting ? 'loading' : ''}
              `}
            >
              {isSubmitting ? 'Generating Report...' : 'Get Full Report'}
              {!isSubmitting && <ArrowRight className="w-5 h-5 ml-2" />}
            </button>
          </form>

          <p className="text-xs text-center mt-4 text-base-content/50">
            We&apos;ll only use your email to send you the report and important updates about your
            idea.
          </p>
        </div>
      </div>
    </div>
  );
}
