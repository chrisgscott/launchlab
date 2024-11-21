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
  MessageSquare,
} from 'lucide-react';

interface InsightItem {
  title: string;
  description: string;
}

interface Challenge {
  title: string;
  description: string;
  mitigation: string;
}

interface NextStep {
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface TimelinePhase {
  phase: string;
  duration: string;
  activities: string[];
}

interface SuccessMetric {
  metric: string;
  description: string;
  target: string;
}

interface CategorySection {
  summary: string;
  key_points: string[];
}

interface CategoryDetails {
  score: number;
  strengths: CategorySection;
  opportunities: CategorySection;
  questions: string[];
}

interface CustomerLocation {
  platform: string;
  details: string[];
}

interface CustomerInsights {
  psychologicalProfile: string;
  painPoints: string[];
  desires: string[];
  transformationStory: string;
}

interface CategoryAnalysis {
  name: string;
  score: number;
  strengths: CategorySection;
  opportunities: CategorySection;
  questions: string[];
}

interface Report {
  id: string;
  overall_score: number;
  validation_status: string;
  summary: string;
  key_strengths: {
    summary: string;
    key_points: string[];
  };
  key_opportunities: {
    summary: string;
    key_points: string[];
  };
  critical_questions: string[];
  business_context: {
    problem_statement: string;
    target_audience: string;
    value_proposition: string;
    product_description: string;
  };
  categories: CategoryAnalysis[];
  customer_insights?: {
    psychologicalProfile: string;
    painPoints: string[];
    desires: string[];
    transformationStory: string;
  };
}

export default function ReportPage({ params }: { params: { id: string } }) {
  const [analysis, setAnalysis] = useState<IdeaAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        const supabase = createClient();
        console.log('Fetching report for ID:', params.id);

        const { data: analysis, error: fetchError } = await supabase
          .from('idea_analyses')
          .select('*')
          .eq('report_url', params.id)
          .single();

        if (fetchError) {
          console.error('Error fetching analysis:', fetchError);
          throw fetchError;
        }

        if (!analysis) {
          console.error('No analysis found for ID:', params.id);
          throw new Error(`No analysis found for ID: ${params.id}`);
        }

        console.log('Raw analysis data:', analysis);
        
        if (analysis.report_data) {
          console.log('Report data structure:', JSON.stringify(analysis.report_data, null, 2));
          const parsedData = analysis.report_data;
          console.log('Parsed report data:', parsedData);
          
          if (parsedData.key_strengths) {
            console.log('Key strengths:', parsedData.key_strengths);
          } else {
            console.warn('No key_strengths found in report data');
          }
          
          if (parsedData.key_opportunities) {
            console.log('Key opportunities:', parsedData.key_opportunities);
          } else {
            console.warn('No key_opportunities found in report data');
          }
          
          if (parsedData.critical_questions) {
            console.log('Critical questions:', parsedData.critical_questions);
          } else {
            console.warn('No critical_questions found in report data');
          }
          
          if (parsedData.business_context) {
            console.log('Business context:', parsedData.business_context);
          } else {
            console.warn('No business_context found in report data');
          }
          
          // Parse and validate report data
          if (parsedData.categoryScores) {
            // Ensure all required categories exist
            const requiredCategories = [
              'marketOpportunity',
              'competitiveAdvantage',
              'feasibility',
              'revenuePotential',
              'marketTiming',
              'scalability'
            ];

            const missingCategories = requiredCategories.filter(
              cat => !parsedData.categoryScores[cat]
            );

            if (missingCategories.length > 0) {
              throw new Error(`Missing required categories: ${missingCategories.join(', ')}`);
            }

            const transformedData = {
              ...parsedData,
              categories: [
                {
                  name: 'Market Opportunity',
                  score: parsedData.categoryScores.marketOpportunity.score,
                  strengths: parsedData.categoryScores.marketOpportunity.strengths,
                  opportunities: parsedData.categoryScores.marketOpportunity.opportunities,
                  questions: parsedData.categoryScores.marketOpportunity.questions,
                },
                {
                  name: 'Competitive Advantage',
                  score: parsedData.categoryScores.competitiveAdvantage.score,
                  strengths: parsedData.categoryScores.competitiveAdvantage.strengths,
                  opportunities: parsedData.categoryScores.competitiveAdvantage.opportunities,
                  questions: parsedData.categoryScores.competitiveAdvantage.questions,
                },
                {
                  name: 'Feasibility',
                  score: parsedData.categoryScores.feasibility.score,
                  strengths: parsedData.categoryScores.feasibility.strengths,
                  opportunities: parsedData.categoryScores.feasibility.opportunities,
                  questions: parsedData.categoryScores.feasibility.questions,
                },
                {
                  name: 'Revenue Potential',
                  score: parsedData.categoryScores.revenuePotential.score,
                  strengths: parsedData.categoryScores.revenuePotential.strengths,
                  opportunities: parsedData.categoryScores.revenuePotential.opportunities,
                  questions: parsedData.categoryScores.revenuePotential.questions,
                },
                {
                  name: 'Market Timing',
                  score: parsedData.categoryScores.marketTiming.score,
                  strengths: parsedData.categoryScores.marketTiming.strengths,
                  opportunities: parsedData.categoryScores.marketTiming.opportunities,
                  questions: parsedData.categoryScores.marketTiming.questions,
                },
                {
                  name: 'Scalability',
                  score: parsedData.categoryScores.scalability.score,
                  strengths: parsedData.categoryScores.scalability.strengths,
                  opportunities: parsedData.categoryScores.scalability.opportunities,
                  questions: parsedData.categoryScores.scalability.questions,
                },
              ],
            };
            delete transformedData.categoryScores;
            
            console.log('Transformed data:', transformedData);
            setReport(transformedData as Report);
          } else if (!parsedData.categories) {
            console.error('Missing categories in parsed data');
            throw new Error('Invalid report structure: missing categories');
          } else {
            setReport(parsedData as Report);
          }
        } else {
          console.error('No report_data found in analysis');
          throw new Error('No report data available');
        }
      } catch (err) {
        console.error('Error in fetchReport:', err);
        setError(err instanceof Error ? err.message : 'Failed to load report. Please check the URL and try again.');
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
      <div className="space-y-8">
        {/* Executive Summary Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Executive Summary</h2>
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-4 rounded-lg">
              <p className="text-lg font-semibold">Overall Score: {report.overall_score}/10</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <p className="text-lg font-semibold">Status: {report.validation_status}</p>
            </div>
          </div>
          <div className="prose max-w-none">
            <p>{report.summary}</p>
          </div>
        </div>

        {/* Key Strengths Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Key Strengths</h3>
          <div className="prose max-w-none">
            {report.key_strengths?.summary ? (
              <>
                <p>{report.key_strengths.summary}</p>
                <ul>
                  {report.key_strengths.key_points?.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p>No strengths analysis available</p>
            )}
          </div>
        </div>

        {/* Key Opportunities Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Key Opportunities</h3>
          <div className="prose max-w-none">
            {report.key_opportunities?.summary ? (
              <>
                <p>{report.key_opportunities.summary}</p>
                <ul>
                  {report.key_opportunities.key_points?.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p>No opportunities analysis available</p>
            )}
          </div>
        </div>

        {/* Critical Questions Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Critical Questions to Consider</h3>
          <div className="prose max-w-none">
            {report.critical_questions?.length ? (
              <ul>
                {report.critical_questions.map((question, index) => (
                  <li key={index}>{question}</li>
                ))}
              </ul>
            ) : (
              <p>No critical questions available</p>
            )}
          </div>
        </div>

        {/* Business Context Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Business Context</h3>
          {report.business_context ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-semibold mb-2">Problem Statement</h4>
                <p>{report.business_context.problem_statement || 'Not specified'}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-semibold mb-2">Target Audience</h4>
                <p>{report.business_context.target_audience || 'Not specified'}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-semibold mb-2">Value Proposition</h4>
                <p>{report.business_context.value_proposition || 'Not specified'}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-semibold mb-2">Product Description</h4>
                <p>{report.business_context.product_description || 'Not specified'}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Business context information not available</p>
          )}
        </div>

        {/* Customer Insights Section */}
        {report.customer_insights && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Customer Insights</h3>
            <div className="prose max-w-none space-y-4">
              <div>
                <h4 className="font-semibold">Psychological Profile</h4>
                <p>{report.customer_insights.psychologicalProfile}</p>
              </div>
              <div>
                <h4 className="font-semibold">Pain Points</h4>
                <ul>
                  {report.customer_insights.painPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">Desires</h4>
                <ul>
                  {report.customer_insights.desires.map((desire, index) => (
                    <li key={index}>{desire}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">Transformation Story</h4>
                <p>{report.customer_insights.transformationStory}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
