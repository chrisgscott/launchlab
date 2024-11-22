'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/libs/supabase/client';
import EmailCaptureModal from '@/components/EmailCaptureModal';
import { type Insights } from '@/types/insights';

type Insight = {
  title: string;
  description: string;
  action_steps?: string[];
};

type CategoryInsight = {
  score: number;
  insights: Insight[];
  improvement_tips: string[];
};

type Analysis = Insights & {
  critical_issues: Array<{
    issue: string;
    recommendation: string;
  }>;
};

export default function InsightsPage() {
  const searchParams = useSearchParams();
  const id = searchParams?.get('id') ?? null;
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
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
          .from('idea_insights')
          .select('*')
          .eq('id', id)
          .single();

        if (dbError) throw dbError;
        if (!data) throw new Error('Analysis not found');

        console.log('Analysis data:', data);

        // Transform the data to match our Analysis type
        const transformedData: Analysis = {
          id: data.id,
          idea_name: data.idea_name,
          problem_statement: data.problem_statement,
          target_audience: data.target_audience,
          unique_value_proposition: data.unique_value_proposition,
          product_description: data.product_description,
          total_score: data.total_score,
          validation_status: data.validation_status,
          critical_issues:
            (data.critical_issues as Array<{ issue: string; recommendation: string }>) || [],
          market_opportunity: data.market_opportunity as CategoryInsight,
          competitive_advantage: data.competitive_advantage as CategoryInsight,
          feasibility: data.feasibility as CategoryInsight,
          revenue_potential: data.revenue_potential as CategoryInsight,
          market_timing: data.market_timing as CategoryInsight,
          scalability: data.scalability as CategoryInsight,
        };

        setAnalysis(transformedData);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analysis');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalysis();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !analysis) {
    return (
      <div>
        <div>Error: {error}</div>
        <button onClick={() => router.push('/')}>Start Over</button>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Total Score */}
      <div className="mb-8">
        <h1>Total Score: {analysis.total_score}</h1>
        <p>Status: {analysis.validation_status}</p>
      </div>

      {/* Critical Issues */}
      <div className="mb-8">
        <h2>Critical Issues</h2>
        {analysis.critical_issues.map((issue, i) => (
          <div key={i} className="mb-4">
            <h3>{issue.issue}</h3>
            <p>{issue.recommendation}</p>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h2>Categories</h2>
        {Object.entries(analysis).map(([key, value]) => {
          // Only render category data
          if (
            ![
              'market_opportunity',
              'competitive_advantage',
              'feasibility',
              'revenue_potential',
              'market_timing',
              'scalability',
            ].includes(key)
          ) {
            return null;
          }

          const category = value as CategoryInsight;
          return (
            <div key={key} className="mb-6">
              <h3>
                {key.replace('_', ' ').toUpperCase()}: {category.score}/100
              </h3>

              <div className="ml-4">
                <h4>Insights:</h4>
                {category.insights.map((insight, i) => (
                  <div key={i} className="mb-2">
                    <p>
                      <strong>{insight.title}</strong>
                    </p>
                    <p>{insight.description}</p>
                    {insight.action_steps && (
                      <ul>
                        {insight.action_steps.map((step, j) => (
                          <li key={j}>{step}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

                <h4>Improvement Tips:</h4>
                <ul>
                  {category.improvement_tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Call to Action */}
      <div className="mt-8">
        <div className="p-6 bg-base-100 rounded-lg border border-base-200">
          {/* Dynamic message based on score */}
          {analysis.total_score >= 70 ? (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-success mb-2">Your Idea Shows Real Promise!</h2>
              <p className="text-base-content/80">
                With a strong score of {analysis.total_score}/100, your idea has serious potential.
                Let's dive deeper and create a solid plan to bring it to life.
              </p>
            </div>
          ) : analysis.total_score >= 50 ? (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-warning mb-2">Your Idea Has Potential</h2>
              <p className="text-base-content/80">
                Scoring {analysis.total_score}/100, your idea shows promise but needs some
                refinement. Let's explore how to strengthen it and increase your chances of success.
              </p>
            </div>
          ) : (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-error mb-2">
                Your Idea Needs Work - But Don't Give Up!
              </h2>
              <p className="text-base-content/80">
                While the current score is {analysis.total_score}/100, we've identified several
                opportunities to improve and pivot your idea into something more viable.
              </p>
            </div>
          )}

          {/* The offer */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2">Get Your Free Validation Blueprint</h3>
            <p className="mb-4">
              Based on our analysis, we've prepared a detailed blueprint specifically for your idea.
              It includes everything you need to validate and refine your concept:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-sm">1</span>
                </div>
                <span>Step-by-step validation checklist customized for your market</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-sm">2</span>
                </div>
                <span>Market research templates and competitor analysis framework</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-sm">3</span>
                </div>
                <span>Detailed breakdown of your idea's strengths and weaknesses</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-sm">4</span>
                </div>
                <span>Strategic recommendations to improve your score</span>
              </li>
            </ul>
          </div>

          {/* CTA button */}
          <button
            onClick={() => setShowEmailModal(true)}
            className="btn btn-primary btn-lg w-full md:w-auto"
          >
            Get Your Free Blueprint
          </button>
        </div>
      </div>

      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        analysisId={analysis.id}
        insights={analysis}
      />
    </div>
  );
}
