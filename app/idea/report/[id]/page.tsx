'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/libs/supabase/client';
import type { IdeaAnalysis } from '@/types/supabase';
import {
  AlertTriangle,
  Rocket,
  ArrowLeft,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Users,
  Lightbulb,
  ArrowRight,
  BadgeCheck,
} from 'lucide-react';

export default function ReportPage({ params }: { params: { id: string } }) {
  const [analysis, setAnalysis] = useState<IdeaAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('idea_analyses')
          .select('*')
          .eq('report_url', params.id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Report not found');

        if (!data.report_generated) {
          setError(
            'Report is still being generated. Please check back in a few minutes or check your email for the link.'
          );
          return;
        }

        setAnalysis(data);
      } catch (err) {
        console.error('Error fetching report:', err);
        setError('Failed to load report. Please check the URL and try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [params.id]);

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

  const insights = analysis.insights;
  const score = insights.totalScore;
  const statusColor = score >= 70 ? 'success' : score >= 50 ? 'warning' : 'error';

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      {/* Header Section */}
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

      {/* Score Overview */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Validation Score</h2>
              <p className="text-base-content/70">
                Based on market potential and execution feasibility
              </p>
            </div>
            <div
              className={`radial-progress text-${statusColor}`}
              style={{ '--value': score, '--size': '8rem' } as any}
            >
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold">{score}</span>
                <span className="text-sm opacity-70">/ 100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights Grid */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        {/* Idea Refinement & Positioning */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-success/10">
                <Lightbulb className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Idea Refinement & Positioning</h3>
                <div className="space-y-4">
                  {/* One-liner */}
                  <div className="card bg-base-200">
                    <div className="card-body">
                      <h4 className="font-semibold">Your One-Liner</h4>
                      <p className="text-lg">{insights.oneLiner}</p>
                    </div>
                  </div>

                  {/* Value Proposition */}
                  <div>
                    <h4 className="font-semibold mb-2">Unique Value Proposition</h4>
                    <div className="space-y-2">
                      {insights.uniqueValueInsights.map((insight: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <BadgeCheck className="w-5 h-5 text-success shrink-0 mt-0.5" />
                          <p>{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Differentiators */}
                  <div>
                    <h4 className="font-semibold mb-2">Key Differentiators</h4>
                    <div className="space-y-2">
                      {insights.differentiators.map((diff: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                          <p>{diff}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Target Customer Deep-Dive */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Target Customer Deep-Dive</h3>
                <div className="space-y-4">
                  {/* Ideal Early Adopter */}
                  <div>
                    <h4 className="font-semibold mb-2">Ideal Early Adopter Profile</h4>
                    <div className="card bg-base-200">
                      <div className="card-body">
                        <div className="space-y-2">
                          {insights.targetAudienceInsights.map((insight: string, index: number) => (
                            <div key={index} className="flex items-start gap-2">
                              <Target className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                              <p>{insight}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Current Solutions & Pain Points */}
                  <div>
                    <h4 className="font-semibold mb-2">Current Solutions & Pain Points</h4>
                    <div className="space-y-2">
                      {insights.painPoints.map((point: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <p>{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Landing Page Blueprint */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-secondary/10">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Landing Page Blueprint</h3>
                <div className="space-y-4">
                  {/* Headline Formulas */}
                  <div>
                    <h4 className="font-semibold mb-2">Recommended Headlines</h4>
                    <div className="space-y-2">
                      {insights.headlines.map((headline: string, index: number) => (
                        <div key={index} className="card bg-base-200">
                          <div className="card-body py-2">
                            <p className="font-medium">{headline}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Benefits */}
                  <div>
                    <h4 className="font-semibold mb-2">Key Benefits to Highlight</h4>
                    <div className="space-y-2">
                      {insights.keyBenefits.map((benefit: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                          <p>{benefit}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick-Start Validation Plan */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-warning/10">
                <Rocket className="w-6 h-6 text-warning" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Quick-Start Validation Plan</h3>
                <div className="space-y-4">
                  {/* 30-day Timeline */}
                  <div>
                    <h4 className="font-semibold mb-2">30-Day Validation Timeline</h4>
                    <div className="space-y-2">
                      {insights.nextSteps.map((step: string, index: number) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                            <span className="text-warning font-bold">
                              W{Math.floor(index / 2) + 1}
                            </span>
                          </div>
                          <p>{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Success Metrics */}
                  <div>
                    <h4 className="font-semibold mb-2">Success Metrics</h4>
                    <div className="card bg-base-200">
                      <div className="card-body">
                        <div className="space-y-2">
                          {insights.successMetrics.map((metric: string, index: number) => (
                            <div key={index} className="flex items-start gap-2">
                              <Target className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                              <p>{metric}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confidence Boosters */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-success/10">
                <BadgeCheck className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Confidence Boosters</h3>
                <div className="space-y-4">
                  {/* Similar Success Stories */}
                  <div>
                    <h4 className="font-semibold mb-2">Similar Success Stories</h4>
                    <div className="space-y-2">
                      {insights.successStories.map((story: string, index: number) => (
                        <div key={index} className="card bg-base-200">
                          <div className="card-body py-3">
                            <p>{story}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
          <div className="space-y-4">
            {insights.nextSteps.map((step: string, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold">{index + 1}</span>
                </div>
                <p className="text-lg">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-12">
        <a href="/idea/landing" className="btn btn-primary btn-lg gap-2">
          Create Your Landing Page
          <ArrowRight className="w-5 h-5" />
        </a>
        <p className="text-sm text-base-content/70 mt-2">
          Ready to start validating? Create a landing page to test your idea with real users.
        </p>
      </div>
    </div>
  );
}
