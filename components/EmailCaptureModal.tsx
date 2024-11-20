'use client';

import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Insights } from '@/types/supabase';

/**
 * EmailCaptureModal component props.
 *
 * @typedef {Object} EmailCaptureModalProps
 * @property {boolean} isOpen - Whether the modal is open.
 * @property {function} onClose - Callback function to close the modal.
 * @property {string} analysisId - ID of the analysis.
 * @property {function} onSuccess - Callback function to call on success.
 * @property {Insights} insights - Insights data.
 */
interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisId: string;
  onSuccess: () => void;
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
  onSuccess,
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
        throw new Error('Failed to start report generation');
      }

      onSuccess();
      toast.success(
        "We're generating your validation roadmap! We'll email you a secure link when it's ready (usually within 2-3 minutes).",
        { duration: 7000 }
      );

      onClose();
    } catch (err) {
      console.error('Error submitting email:', err);
      setError('Failed to submit email. Please try again.');
    } finally {
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
          <h2 className="text-2xl font-bold mb-4">Get Your Validation Roadmap</h2>
          <p className="mb-4">
            We'll analyze your idea and send you a personalized validation roadmap with actionable
            next steps to test your assumptions.
          </p>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-2 border rounded mb-4"
              required
              disabled={isSubmitting}
            />
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Get Roadmap'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
