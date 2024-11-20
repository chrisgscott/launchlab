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

type NextStep = {
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
};

type CategoryKey =
  | 'marketOpportunity'
  | 'competitiveAdvantage'
  | 'feasibility'
  | 'revenuePotential'
  | 'marketTiming'
  | 'scalability';

type CategoryInsights = {
  score: number;
  insights: Array<{
    title: string;
    description: string;
    actionSteps?: string[];
  }>;
};

type Insights = {
  [K in CategoryKey]?: CategoryInsights;
} & {
  totalScore: number;
  criticalIssues: Array<{
    issue: string;
    recommendation: string;
  }>;
  nextSteps: NextStep[];
  validationStatus?: string;
};

type FactorInsights = {
  [K in CategoryKey]: CategoryInsights;
} & {
  totalScore: number;
  criticalIssues: Array<{
    issue: string;
    recommendation: string;
  }>;
  nextSteps: NextStep[];
};

export default function InsightsPage() {
  const searchParams = useSearchParams();
  const id = searchParams?.get('id') ?? null;
  const [analysis, setAnalysis] = useState<{ id: string; insights: Insights } | null>(null);
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
  console.log('Total score from API:', score);
  const statusColor = score >= 70 ? 'success' : score >= 50 ? 'warning' : 'error';

  // Create a compatible insights object for our factor cards
  const factorInsights = {
    marketOpportunity: insights.marketOpportunity || { score: 0, insights: [] },
    competitiveAdvantage: insights.competitiveAdvantage || { score: 0, insights: [] },
    feasibility: insights.feasibility || { score: 0, insights: [] },
    revenuePotential: insights.revenuePotential || { score: 0, insights: [] },
    marketTiming: insights.marketTiming || { score: 0, insights: [] },
    scalability: insights.scalability || { score: 0, insights: [] },
    totalScore: insights.totalScore,
    criticalIssues: insights.criticalIssues,
    nextSteps: insights.nextSteps,
  };

  const getStatusMessage = (score: number) => {
    if (score >= 70) return "You're onto something big here";
    if (score >= 50) return "Some tweaks needed, but don't give up";
    return "Back to the drawing board - we'll help you get there";
  };

  const statusMessage = getStatusMessage(score);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-gradient-to-r from-success/20 to-success/5 border-success';
    if (score >= 60) return 'bg-gradient-to-r from-warning/20 to-warning/5 border-warning';
    return 'bg-gradient-to-r from-error/20 to-error/5 border-error';
  };

  const categories = [
    { key: 'marketOpportunity' as const, label: 'Market Opportunity', icon: Globe, weight: 25 },
    {
      key: 'competitiveAdvantage' as const,
      label: 'Competitive Advantage',
      icon: Target,
      weight: 20,
    },
    { key: 'feasibility' as const, label: 'Feasibility', icon: Gauge, weight: 15 },
    { key: 'revenuePotential' as const, label: 'Revenue Potential', icon: TrendingUp, weight: 15 },
    { key: 'marketTiming' as const, label: 'Market Timing', icon: Clock, weight: 15 },
    { key: 'scalability' as const, label: 'Scalability', icon: Radio, weight: 10 },
  ] as const;

  const renderFactorCard = (category: (typeof categories)[number], insights: Insights) => {
    const categoryData = insights[category.key];
    if (!categoryData) return null;

    const score = categoryData.score;
    console.log(`${category.key} score:`, score);

    const needsImprovement = score <= 50; // Show improvement suggestions for scores of 50 or below

    return (
      <div
        key={category.key}
        className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 mb-8"
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
            {categoryData.insights.map((insight: any, i: number) => (
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

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-error/10 text-error';
      case 'MEDIUM':
        return 'bg-warning/10 text-warning';
      case 'LOW':
        return 'bg-success/10 text-success';
      default:
        return 'bg-base-200 text-base-content';
    }
  };

  const getPriorityLabel = (priority: string) => {
    return `${priority.charAt(0) + priority.slice(1).toLowerCase()} Priority`;
  };

  const handleGetReport = () => {
    setShowEmailModal(true);
  };

  const handleEmailSuccess = () => {
    setShowEmailModal(false);
    // Redirect to the full report page
    router.push(`/idea/report/${analysis?.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 pb-32">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-2 bg-base-200 rounded-full mb-4">
          <Rocket className="w-6 h-6 text-primary mr-2" />
          <span className="font-medium">Idea Analysis</span>
        </div>
      </div>

      {/* Status Card */}
      <div
        className={`card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 mb-8 border border-${statusColor}/20`}
      >
        <div className={`card-body p-8 bg-gradient-to-br from-${statusColor}/5 to-transparent`}>
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <h2 className="text-4xl font-bold text-base-content mb-3">
                {score >= 70
                  ? 'This idea has serious potential'
                  : score >= 50
                    ? 'Getting there, needs some work'
                    : 'Time to pivot and iterate'}
              </h2>
              <p className="text-xl opacity-70 mb-6">{statusMessage}</p>

              <div className="flex items-center gap-6">
                <div>
                  <div className="text-lg font-semibold flex items-center mb-2">
                    <ChartBar className="w-5 h-5 mr-2 text-primary" />
                    Overall Score
                  </div>
                  <div className="flex items-center gap-3">
                    <progress
                      className={`progress w-56 h-3 shadow-sm ${
                        score >= 70
                          ? 'bg-success/20 [&::-webkit-progress-value]:bg-success [&::-moz-progress-bar]:bg-success'
                          : score >= 50
                            ? 'bg-warning/20 [&::-webkit-progress-value]:bg-warning [&::-moz-progress-bar]:bg-warning'
                            : 'bg-error/20 [&::-webkit-progress-value]:bg-error [&::-moz-progress-bar]:bg-error'
                      }`}
                      value={score}
                      max="100"
                    ></progress>
                    <span className="text-lg font-medium tabular-nums">{score}/100</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`text-${statusColor} flex flex-col items-center justify-center p-6 bg-${statusColor}/10 rounded-xl`}
            >
              <div className="text-7xl font-bold tabular-nums">{score}</div>
              <div className="text-lg font-medium">out of 100</div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Factors */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Core Strengths & Challenges</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {categories.slice(0, 3).map(category => renderFactorCard(category, factorInsights))}
        </div>
      </div>

      {/* Supporting Factors */}
      <div>
        <h2 className="text-xl font-bold mb-4">Supporting Factors</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {categories.slice(3).map(category => renderFactorCard(category, factorInsights))}
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
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold">{step.title}</h3>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${getPriorityBadgeClass(step.priority)}`}
                  >
                    {getPriorityLabel(step.priority)}
                  </span>
                </div>
                <p className="text-sm opacity-70">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-base-200/95 backdrop-blur-sm border-t border-base-300 shadow-lg transform translate-y-0 transition-transform duration-300 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="hidden md:flex flex-col items-start gap-1">
            <span className="text-xs font-medium bg-success/10 text-success px-2 py-0.5 rounded-full">
              Free Roadmap
            </span>
            <div>
              <h4 className="font-semibold text-base">Get Your Startup Validation Roadmap</h4>
              <p className="text-sm text-base-content/70">
                Step-by-step guide to validate your idea
              </p>
            </div>
          </div>
          <button
            className="btn btn-primary shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-full md:w-auto"
            onClick={handleGetReport}
          >
            Get Your Free Roadmap
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>

      {/* Email Capture Modal */}
      {showEmailModal && (
        <EmailCaptureModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          analysisId={analysis.id}
          onSuccess={() => {
            handleEmailSuccess();
          }}
          insights={insights}
        />
      )}
    </div>
  );
}
