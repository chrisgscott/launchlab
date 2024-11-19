'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/libs/supabase/client';
import type { IdeaAnalysis } from '@/types/supabase';
import {
  ArrowRight,
  AlertTriangle,
  Rocket,
  Target,
  Gauge,
  Radio,
  Globe,
  Clock,
  TrendingUp,
  CheckCircle,
  Lightbulb,
  ChartBar,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import EmailCaptureModal from '@/components/EmailCaptureModal';

export default function InsightsPage() {
  const searchParams = useSearchParams();
  const id = searchParams?.get('id') ?? null;
  const [analysis, setAnalysis] = useState<IdeaAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchAnalysis() {
      if (!id) {
        setError('No analysis ID provided');
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error: dbError } = await supabase
          .from('idea_analyses')
          .select('*')
          .eq('id', id)
          .single();

        if (dbError) {
          console.error('Database error:', dbError);
          throw dbError;
        }

        if (!data) {
          console.error('No data found for ID:', id);
          throw new Error('Analysis not found');
        }

        console.log('Fetched analysis:', data);
        setAnalysis(data);
      } catch (err) {
        console.error('Error fetching analysis:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analysis');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalysis();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-lg font-medium animate-pulse">Initiating Launch Sequence... 🚀</p>
          <p className="text-sm opacity-70">Running pre-flight diagnostics</p>
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
            <h3 className="font-bold">Launch Sequence Aborted!</h3>
            <p className="text-sm">
              {error || 'Analysis not found'} - Don't worry, even SpaceX had failed launches. Let's
              try again!
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <a href="/" className="btn btn-primary">
            <Rocket className="w-5 h-5 mr-2" />
            Return to Launch Pad
          </a>
        </div>
      </div>
    );
  }

  const insights = analysis.insights;
  const score = insights.totalScore;
  const launchStatus = insights.launchStatus;
  const statusColor = score >= 70 ? 'success' : score >= 50 ? 'warning' : 'error';

  const getStatusMessage = (status: string, score: number) => {
    if (score >= 70) return 'You&apos;re onto something big here';
    if (score >= 50) return 'Some tweaks needed, but don&apos;t give up';
    return 'Back to the drawing board - we&apos;ll help you get there';
  };

  const statusMessage = getStatusMessage(launchStatus, score);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-gradient-to-r from-success/20 to-success/5 border-success';
    if (score >= 60) return 'bg-gradient-to-r from-warning/20 to-warning/5 border-warning';
    return 'bg-gradient-to-r from-error/20 to-error/5 border-error';
  };

  const convertScore = (score: number) => Math.round((score - 1) * 25);

  const categories = [
    { key: 'marketOpportunity', label: 'Market Opportunity', icon: Globe, weight: 25 },
    { key: 'competitiveAdvantage', label: 'Competitive Advantage', icon: Target, weight: 20 },
    { key: 'feasibility', label: 'Feasibility', icon: Gauge, weight: 15 },
    { key: 'revenuePotential', label: 'Revenue Potential', icon: TrendingUp, weight: 15 },
    { key: 'marketTiming', label: 'Market Timing', icon: Clock, weight: 15 },
    { key: 'scalability', label: 'Scalability', icon: Radio, weight: 10 },
  ];

  const renderFactorCard = (category: (typeof categories)[0], insights: any) => {
    const score = convertScore(insights[category.key].score);
    const needsImprovement = score <= 75; // Show improvement suggestions for scores of 3 or below

    return (
      <div
        key={category.key}
        className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
      >
        <div className={`card-body p-0`}>
          <div className={`p-4 rounded-t-xl border-b ${getScoreColor(score)}`}>
            <h2 className="card-title flex items-center">
              <category.icon
                className={`w-5 h-5 mr-2 ${score >= 80 ? 'text-success' : score >= 60 ? 'text-warning' : 'text-error'}`}
              />
              {category.label}
              <span className="ml-auto text-sm font-semibold">{score}/100</span>
            </h2>
          </div>
          <div className="p-4 space-y-4">
            {insights[category.key].insights.map((insight: any, i: number) => (
              <div key={i} className="text-sm">
                <div className="font-medium mb-1">{insight.title}</div>
                <p className="opacity-70 mb-2">{insight.description}</p>

                {/* Show action steps if score needs improvement */}
                {needsImprovement && insight.actionSteps && (
                  <div className="mt-2 pl-3 border-l-2 border-primary bg-primary/5 p-3 rounded-r">
                    <div className="font-medium text-primary mb-1 flex items-center">
                      <Lightbulb className="w-4 h-4 mr-2" />
                      How to improve:
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm opacity-70">
                      {insight.actionSteps.map((step: string, j: number) => (
                        <li key={j}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <AlertTriangle className="w-5 h-5 text-error" />;
      case 'MEDIUM':
        return <Clock className="w-5 h-5 text-warning" />;
      case 'LOW':
        return <CheckCircle className="w-5 h-5 text-success" />;
    }
  };

  const handleGetReport = () => {
    setShowEmailModal(true);
  };

  const handleEmailSuccess = (accessToken: string) => {
    setShowEmailModal(false);
    // Redirect to the full report page
    router.push(`/idea/report/${analysis?.id}?token=${accessToken}`);
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-2 bg-base-200 rounded-full mb-4">
          <Rocket className="w-6 h-6 text-primary mr-2" />
          <span className="font-medium">Idea Analysis</span>
        </div>
      </div>

      {/* Status Card */}
      <div
        className={`card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border-t-4 border-${statusColor} mb-8`}
      >
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <h2
                className={`text-2xl font-bold bg-gradient-to-r from-${statusColor} to-${statusColor}/70 bg-clip-text text-transparent mb-2`}
              >
                {score >= 70
                  ? 'This idea has serious potential'
                  : score >= 50
                    ? 'Getting there, needs some work'
                    : 'Time to pivot and iterate'}
              </h2>
              <p className="text-lg opacity-70">{statusMessage}</p>
              <div className="mt-4">
                <div className="text-xl font-semibold flex items-center">
                  <ChartBar className="w-5 h-5 mr-2 text-primary" />
                  Overall Score
                </div>
                <div className="flex items-center gap-3">
                  <progress
                    className={`progress progress-${statusColor} w-56 shadow-sm`}
                    value={score}
                    max="100"
                  ></progress>
                  <span className="text-lg font-medium tabular-nums">{score}/100</span>
                </div>
              </div>
            </div>
            <div
              className={`text-${statusColor} text-6xl font-bold opacity-20 tabular-nums rotate-[-10deg]`}
            >
              {score}/100
            </div>
          </div>
        </div>
      </div>

      {/* Core Factors */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Core Strengths & Challenges</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {categories.slice(0, 3).map(category => renderFactorCard(category, insights))}
        </div>
      </div>

      {/* Supporting Factors */}
      <div>
        <h2 className="text-xl font-bold mb-4">Supporting Factors</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {categories.slice(3).map(category => renderFactorCard(category, insights))}
        </div>
      </div>

      {/* Critical Issues */}
      {insights.criticalIssues.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Things to Watch Out For</h2>
          <div className="space-y-4">
            {insights.criticalIssues.map((issue, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 bg-base-100 rounded-lg border border-base-200"
              >
                <AlertTriangle className="w-5 h-5 text-warning mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold">{issue.issue}</h3>
                  <p className="text-sm opacity-70">{issue.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Your Action Plan</h2>
        <div className="space-y-4">
          {insights.nextSteps.map((step, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 bg-base-100 rounded-lg border border-base-200"
            >
              {getPriorityIcon(step.priority)}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">{step.title}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      step.priority === 'HIGH'
                        ? 'bg-error/10 text-error'
                        : step.priority === 'MEDIUM'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-success/10 text-success'
                    }`}
                  >
                    {step.priority.toLowerCase()} priority
                  </span>
                </div>
                <p className="text-sm opacity-70 mt-1">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Report CTA */}
      <div className="mt-12 text-center">
        <button
          className="btn btn-primary btn-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          onClick={handleGetReport}
        >
          Get the Full Report
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
        <p className="text-sm text-gray-600 mt-2">
          We&apos;ll send you a detailed report with everything you need to start validating your
          idea with real users.
        </p>
      </div>

      {/* Email Capture Modal */}
      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        analysisId={analysis?.id || ''}
        onSuccess={handleEmailSuccess}
      />
    </div>
  );
}
