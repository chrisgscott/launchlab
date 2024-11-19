'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/libs/supabase/client';
import type { IdeaAnalysis } from '@/types/supabase';
import { AlertTriangle, Rocket, ArrowLeft } from 'lucide-react';

export default function ReportPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');

  const [analysis, setAnalysis] = useState<IdeaAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function validateAccess() {
      if (!token) {
        setError('Invalid access parameters');
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();

        // Verify access token
        const { data: accessData, error: accessError } = await supabase
          .from('report_access')
          .select('*')
          .eq('access_token', token)
          .single();

        if (accessError || !accessData) {
          throw new Error('Invalid or expired access token');
        }

        // Fetch analysis data
        const { data: analysisData, error: analysisError } = await supabase
          .from('idea_analyses')
          .select('*')
          .eq('id', accessData.analysis_id)
          .single();

        if (analysisError || !analysisData) {
          throw new Error('Analysis not found');
        }

        setAnalysis(analysisData);
      } catch (err) {
        console.error('Error fetching report:', err);
        setError(err instanceof Error ? err.message : 'Failed to load report');
      } finally {
        setLoading(false);
      }
    }

    validateAccess();
  }, [token]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-lg font-medium animate-pulse">Generating Your Report... 🚀</p>
          <p className="text-sm opacity-70">Analyzing market opportunities</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="alert alert-error shadow-lg">
          <AlertTriangle className="w-6 h-6" />
          <div>
            <h3 className="font-bold">Access Denied</h3>
            <p className="text-sm">{error || 'Report not found'}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <a href="/" className="btn btn-primary">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Launch Pad
          </a>
        </div>
      </div>
    );
  }

  // TODO: Implement full report UI here
  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
          <Rocket className="w-6 h-6 text-primary mr-2" />
          <span className="font-medium">Full Validation Report</span>
        </div>
        <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Your Idea Validation Roadmap
        </h1>
        <p className="text-xl opacity-80 max-w-2xl mx-auto">
          Everything you need to start testing your idea with real users.
        </p>
      </div>

      {/* Placeholder for report content */}
      <div className="prose max-w-none">
        <p>Report content will go here...</p>
      </div>
    </div>
  );
}
