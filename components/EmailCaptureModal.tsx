'use client';

import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Insights } from '@/types/insights';

/**
 * EmailCaptureModal component props.
 *
 * @typedef {Object} EmailCaptureModalProps
 * @property {boolean} isOpen - Whether the modal is open.
 * @property {function} onClose - Callback function to close the modal.
 * @property {string} analysisId - ID of the analysis.
 * @property {Insights} insights - Insights data.
 */
interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisId: string;
  insights: Insights;
}

/**
 * EmailCaptureModal component.
 *
 * @param {EmailCaptureModalProps} props - Component props.
 * @returns {JSX.Element|null} Modal content or null if not open.
 */
export default function EmailCaptureModal({
  isOpen,
  onClose,
  analysisId,
  insights,
}: EmailCaptureModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle form submission.
   *
   * @param {React.FormEvent} e - Form event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    console.log('📝 Starting report request...', { email, analysisId });

    try {
      const response = await fetch('/api/idea/async-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          analysisId,
          insights,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Failed to start report generation:', errorData);
        throw new Error(errorData.error || 'Failed to start report generation');
      }

      const data = await response.json();
      console.log('✅ Report generation started successfully:', data);

      // Show success message and close modal immediately
      toast.success(
        "We're generating your blueprint! We'll email you a secure link when it's ready (usually within 2-3 minutes).",
        { duration: 7000 }
      );
      onClose();
    } catch (err) {
      console.error('❌ Error submitting email:', err);
      setError('Failed to submit email. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-md w-full relative animate-slideIn">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-base-content/50 hover:text-base-content transition-colors"
          disabled={isSubmitting}
        >
          <Mail className="w-6 h-6" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Get Your Validation Blueprint</h2>
          <p className="mb-4">
            We'll analyze your idea and send you a personalized validation blueprint with actionable
            next steps to test your assumptions and launch successfully.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Where should we send your blueprint?</span>
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="input input-bordered w-full"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            {error && <div className="text-error text-sm mt-2">{error}</div>}

            <button
              type="submit"
              className={`btn btn-primary w-full mt-4 ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Preparing Your Blueprint...' : 'Get Your Free Blueprint'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
