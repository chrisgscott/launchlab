'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/libs/supabase/client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Report {
  id: string;
  url: string;
  summary: string;
  key_strengths: {
    summary: string;
    points: string[];
    potential_impact: string;
  };
  monetization: {
    primary_stream: {
      approach: string;
      rationale: string;
      pricing: string;
      benefits: string[];
    };
    alternative_approaches: Array<{
      model: string;
      implementation: string;
      best_for: string;
      pricing: string;
      pros: string[];
      cons: string[];
    }>;
    optimization_opportunities: string;
    early_stage_strategy: {
      initial_approach: string;
      key_metrics: string[];
      adjustment_triggers: string[];
    };
  };
  refinement_questions: Array<{
    question: string;
    context: string;
  }>;
  challenges: Array<{
    challenge: string;
    description: string;
  }>;
  mitigation_strategies: Array<{
    strategy: string;
    details: string;
  }>;
  recommendation: {
    recommendation: string;
    priority: string;
    timeline: string;
  };
  improvement_areas: Array<{
    area: string;
    details: string;
  }>;
}

export default function ReportPage({ params }: { params: { id: string } }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        const supabase = createClient();
        console.log('Fetching report for ID:', params.id);

        const { data: report, error: fetchError } = await supabase
          .from('idea_reports')
          .select('*')
          .eq('id', params.id)
          .single();

        if (fetchError) {
          console.error('Error fetching report:', fetchError);
          throw fetchError;
        }

        if (!report) {
          console.error('No report found for ID:', params.id);
          throw new Error(`No report found for ID: ${params.id}`);
        }

        console.log('Raw report data:', report);
        setReport(report);
      } catch (err) {
        console.error('Error in fetchReport:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load report. Please check the URL and try again.'
        );
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <h2 className="text-xl font-semibold mb-2">Error Loading Report</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 text-center">
          <h2 className="text-xl font-semibold mb-2">No Report Data</h2>
          <p>Unable to load the report data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-12">
      {/* Back Button */}
      <Link
        href="/idea"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Idea Analysis
      </Link>

      <div className="space-y-8">
        {/* Executive Summary */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Executive Summary</h2>
          <div className="prose max-w-none">
            <p>{report.summary}</p>
          </div>
        </div>

        {/* Key Strengths */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Key Strengths</h3>
          <div className="prose max-w-none">
            <p>{report.key_strengths.summary}</p>
            <ul>
              {report.key_strengths.points.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
            <div className="mt-4">
              <h4 className="font-semibold">Potential Impact</h4>
              <p>{report.key_strengths.potential_impact}</p>
            </div>
          </div>
        </div>

        {/* Monetization Strategy */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Monetization Strategy</h3>

          {/* Primary Revenue Stream */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold mb-4">Primary Revenue Stream</h4>
            <div className="space-y-4">
              <div>
                <h5 className="font-medium">Approach</h5>
                <p>{report.monetization.primary_stream.approach}</p>
              </div>
              <div>
                <h5 className="font-medium">Rationale</h5>
                <p>{report.monetization.primary_stream.rationale}</p>
              </div>
              <div>
                <h5 className="font-medium">Pricing</h5>
                <p>{report.monetization.primary_stream.pricing}</p>
              </div>
              <div>
                <h5 className="font-medium">Benefits</h5>
                <ul className="list-disc pl-5">
                  {report.monetization.primary_stream.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Alternative Approaches */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold mb-4">Alternative Approaches</h4>
            <div className="space-y-6">
              {report.monetization.alternative_approaches.map((approach, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="space-y-2">
                    <div>
                      <h5 className="font-medium">Model</h5>
                      <p>{approach.model}</p>
                    </div>
                    <div>
                      <h5 className="font-medium">Implementation</h5>
                      <p>{approach.implementation}</p>
                    </div>
                    <div>
                      <h5 className="font-medium">Best For</h5>
                      <p>{approach.best_for}</p>
                    </div>
                    <div>
                      <h5 className="font-medium">Pricing</h5>
                      <p>{approach.pricing}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium">Pros</h5>
                        <ul className="list-disc pl-5">
                          {approach.pros.map((pro, i) => (
                            <li key={i}>{pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium">Cons</h5>
                        <ul className="list-disc pl-5">
                          {approach.cons.map((con, i) => (
                            <li key={i}>{con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optimization Opportunities */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold mb-2">Optimization Opportunities</h4>
            <p>{report.monetization.optimization_opportunities}</p>
          </div>

          {/* Early Stage Strategy */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold mb-4">Early Stage Strategy</h4>
            <div className="space-y-4">
              <div>
                <h5 className="font-medium">Initial Approach</h5>
                <p>{report.monetization.early_stage_strategy.initial_approach}</p>
              </div>
              <div>
                <h5 className="font-medium">Key Metrics</h5>
                <ul className="list-disc pl-5">
                  {report.monetization.early_stage_strategy.key_metrics.map((metric, index) => (
                    <li key={index}>{metric}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-medium">Adjustment Triggers</h5>
                <ul className="list-disc pl-5">
                  {report.monetization.early_stage_strategy.adjustment_triggers.map(
                    (trigger, index) => (
                      <li key={index}>{trigger}</li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Refinement Questions */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Key Questions to Consider</h3>
          <div className="space-y-6">
            {report.refinement_questions.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <h4 className="font-semibold mb-2">{item.question}</h4>
                <p className="text-gray-600">{item.context}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Challenges and Mitigation Strategies */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Challenges and Solutions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-4">Key Challenges</h4>
              <div className="space-y-4">
                {report.challenges.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg shadow p-4">
                    <h5 className="font-medium mb-2">{item.challenge}</h5>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Mitigation Strategies</h4>
              <div className="space-y-4">
                {report.mitigation_strategies.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg shadow p-4">
                    <h5 className="font-medium mb-2">{item.strategy}</h5>
                    <p className="text-gray-600">{item.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Recommendation</h3>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              <p className="text-lg">{report.recommendation.recommendation}</p>
              <div className="flex gap-4">
                <div className="bg-blue-50 px-4 py-2 rounded-md">
                  <span className="font-medium">Priority:</span> {report.recommendation.priority}
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-md">
                  <span className="font-medium">Timeline:</span> {report.recommendation.timeline}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Areas for Improvement */}
        {report.improvement_areas.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Areas for Improvement</h3>
            <div className="space-y-4">
              {report.improvement_areas.map((item, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <h4 className="font-semibold mb-2">{item.area}</h4>
                  <p className="text-gray-600">{item.details}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
