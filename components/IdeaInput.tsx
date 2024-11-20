'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  XCircle,
  Users,
  Star,
  Package,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

// Zod schema for validation
const IdeaSchema = z.object({
  problemStatement: z
    .string()
    .min(20, { message: 'Problem statement must be at least 20 characters' })
    .max(500, { message: 'Problem statement must be less than 500 characters' }),

  targetAudience: z
    .string()
    .min(10, { message: 'Target audience description must be at least 10 characters' })
    .max(500, { message: 'Target audience description must be less than 500 characters' }),

  uniqueValueProposition: z
    .string()
    .min(20, { message: 'Unique value proposition must be at least 20 characters' })
    .max(500, { message: 'Unique value proposition must be less than 500 characters' }),

  productDescription: z
    .string()
    .min(30, { message: 'Product description must be at least 30 characters' })
    .max(1000, { message: 'Product description must be less than 1000 characters' }),
});

// Educational content for each section
const educationalContent = {
  problemStatement: {
    title: 'Crafting a Strong Problem Statement',
    tips: [
      'Focus on the pain point, not your solution',
      'Quantify the problem if possible (time lost, money wasted, etc.)',
      'Explain who experiences this problem and how often',
      'Describe the current alternatives and their limitations',
    ],
    examples: [
      {
        good: 'Small business owners spend 5-10 hours weekly on manual inventory counts, leading to frequent stockouts and lost sales of up to $2,000 monthly.',
        explanation:
          'This statement quantifies the problem, identifies the audience, and shows clear business impact.',
      },
    ],
  },
  targetAudience: {
    title: 'Defining Your Target Audience',
    tips: [
      'Be specific about demographics and behaviors',
      'Include relevant characteristics (job role, company size, budget)',
      'Consider both primary and secondary users',
      'Think about purchasing power and decision-making authority',
    ],
    examples: [
      {
        good: 'E-commerce store owners with 100-1000 SKUs, $50K-$500K annual revenue, who currently use spreadsheets and struggle with seasonal demand planning.',
        explanation:
          'This description includes business size, current solution, and specific pain point.',
      },
    ],
  },
  uniqueValueProposition: {
    title: 'Creating a Compelling Value Proposition',
    tips: [
      'Focus on benefits, not features',
      'Explain why your solution is better than alternatives',
      'Address specific pain points from your problem statement',
      'Quantify the value when possible (time saved, ROI, etc.)',
    ],
    examples: [
      {
        good: 'Our AI reduces inventory costs by 30% while preventing stockouts through predictive analytics, giving small businesses the same advantages as large retailers at 1/10th the cost.',
        explanation:
          "This UVP quantifies the benefit, compares to alternatives, and addresses the target market's needs.",
      },
    ],
  },
  productDescription: {
    title: 'Describing Your Solution',
    tips: [
      'Explain how it works in simple terms',
      'Highlight key features and their benefits',
      'Address potential concerns or objections',
      'Include integration/implementation details',
    ],
    examples: [
      {
        good: 'Our mobile app connects to your POS system, automatically tracks sales and stock levels, and uses AI to predict future demand. It sends real-time alerts for low stock and generates one-click purchase orders based on vendor prices and lead times.',
        explanation:
          'This description covers the key features, how it works, and practical implementation details.',
      },
    ],
  },
};

type IdeaFormData = z.infer<typeof IdeaSchema>;

const IdeaInput: React.FC = () => {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsights] = useState<any>(null);
  const [activeGuide, setActiveGuide] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<IdeaFormData>({
    resolver: zodResolver(IdeaSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: IdeaFormData) => {
    setIsAnalyzing(true);
    try {
      console.log('Submitting idea data:', JSON.stringify(data, null, 2));

      const response = await fetch('/api/idea/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to analyze idea');
      }

      // Navigate to insights page with analysis ID
      router.push(`/idea/insights?id=${result.id}`);
    } catch (error) {
      console.error('Error analyzing idea:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
      // Show error toast or message to user
      alert(error instanceof Error ? error.message : 'Failed to analyze idea. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderEducationalGuide = (section: string) => {
    const content = educationalContent[section as keyof typeof educationalContent];
    if (!content) return null;

    return (
      <div className="bg-base-200 rounded-lg p-6 mt-4 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <BookOpen className="w-5 h-5" />
          <h3 className="font-semibold">{content.title}</h3>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2 text-sm">Tips for Success:</h4>
            <ul className="space-y-2">
              {content.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="opacity-70">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-sm">Strong Example:</h4>
            {content.examples.map((example, index) => (
              <div key={index} className="space-y-2">
                <div className="bg-base-100 p-3 rounded border-l-4 border-success text-sm">
                  {example.good}
                </div>
                <p className="text-sm opacity-70 italic">Why this works: {example.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Problem Statement */}
      <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-200">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-error/10">
                <AlertCircle className="w-5 h-5 text-error" />
              </div>
              <h2 className="card-title">What problem are you solving?</h2>
            </div>
            <button
              type="button"
              onClick={() =>
                setActiveGuide(activeGuide === 'problemStatement' ? null : 'problemStatement')
              }
              className="btn btn-ghost btn-sm btn-circle"
            >
              <HelpCircle
                className={`w-5 h-5 ${activeGuide === 'problemStatement' ? 'text-primary' : 'opacity-50'}`}
              />
            </button>
          </div>
          <p className="text-sm opacity-70 mb-4 ml-9">
            Describe the specific problem or pain point your idea addresses. What frustrates people?
            What needs aren't being met?
          </p>
          <Controller
            name="problemStatement"
            control={control}
            render={({ field }) => (
              <div>
                <textarea
                  {...field}
                  className="textarea textarea-bordered w-full h-32 focus:textarea-primary transition-colors duration-200"
                  placeholder="Example: Many small business owners struggle to manage their inventory efficiently, leading to stockouts and overstocking that hurt their bottom line..."
                />
                {errors.problemStatement && (
                  <p className="text-error text-sm mt-2 flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    {errors.problemStatement.message}
                  </p>
                )}
              </div>
            )}
          />
          {activeGuide === 'problemStatement' && renderEducationalGuide('problemStatement')}
        </div>
      </div>

      {/* Target Audience */}
      <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-200">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-success/10">
                <Users className="w-5 h-5 text-success" />
              </div>
              <h2 className="card-title">Who is your target audience?</h2>
            </div>
            <button
              type="button"
              onClick={() =>
                setActiveGuide(activeGuide === 'targetAudience' ? null : 'targetAudience')
              }
              className="btn btn-ghost btn-sm btn-circle"
            >
              <HelpCircle
                className={`w-5 h-5 ${activeGuide === 'targetAudience' ? 'text-primary' : 'opacity-50'}`}
              />
            </button>
          </div>
          <p className="text-sm opacity-70 mb-4 ml-9">
            Define your ideal customers. Who experiences this problem most acutely? What are their
            characteristics?
          </p>
          <Controller
            name="targetAudience"
            control={control}
            render={({ field }) => (
              <div>
                <textarea
                  {...field}
                  className="textarea textarea-bordered w-full h-32 focus:textarea-primary transition-colors duration-200"
                  placeholder="Example: Small retail business owners with 1-10 employees, managing inventory worth $10,000-$100,000, who are tech-savvy but time-constrained..."
                />
                {errors.targetAudience && (
                  <p className="text-error text-sm mt-2 flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    {errors.targetAudience.message}
                  </p>
                )}
              </div>
            )}
          />
          {activeGuide === 'targetAudience' && renderEducationalGuide('targetAudience')}
        </div>
      </div>

      {/* Unique Value Proposition */}
      <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-200">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-warning/10">
                <Star className="w-5 h-5 text-warning" />
              </div>
              <h2 className="card-title">What makes your solution unique?</h2>
            </div>
            <button
              type="button"
              onClick={() =>
                setActiveGuide(
                  activeGuide === 'uniqueValueProposition' ? null : 'uniqueValueProposition'
                )
              }
              className="btn btn-ghost btn-sm btn-circle"
            >
              <HelpCircle
                className={`w-5 h-5 ${activeGuide === 'uniqueValueProposition' ? 'text-primary' : 'opacity-50'}`}
              />
            </button>
          </div>
          <p className="text-sm opacity-70 mb-4 ml-9">
            Explain what sets your solution apart. Why would customers choose your solution over
            alternatives?
          </p>
          <Controller
            name="uniqueValueProposition"
            control={control}
            render={({ field }) => (
              <div>
                <textarea
                  {...field}
                  className="textarea textarea-bordered w-full h-32 focus:textarea-primary transition-colors duration-200"
                  placeholder="Example: Our AI-powered inventory management system learns from historical data to predict demand patterns and automatically suggests optimal stock levels..."
                />
                {errors.uniqueValueProposition && (
                  <p className="text-error text-sm mt-2 flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    {errors.uniqueValueProposition.message}
                  </p>
                )}
              </div>
            )}
          />
          {activeGuide === 'uniqueValueProposition' &&
            renderEducationalGuide('uniqueValueProposition')}
        </div>
      </div>

      {/* Product Description */}
      <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-200">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <h2 className="card-title">Describe your product or service</h2>
            </div>
            <button
              type="button"
              onClick={() =>
                setActiveGuide(activeGuide === 'productDescription' ? null : 'productDescription')
              }
              className="btn btn-ghost btn-sm btn-circle"
            >
              <HelpCircle
                className={`w-5 h-5 ${activeGuide === 'productDescription' ? 'text-primary' : 'opacity-50'}`}
              />
            </button>
          </div>
          <p className="text-sm opacity-70 mb-4 ml-9">
            Provide details about how your solution works. What are the key features and benefits?
          </p>
          <Controller
            name="productDescription"
            control={control}
            render={({ field }) => (
              <div>
                <textarea
                  {...field}
                  className="textarea textarea-bordered w-full h-32 focus:textarea-primary transition-colors duration-200"
                  placeholder="Example: Our mobile app integrates with point-of-sale systems, uses machine learning for demand forecasting, and provides real-time alerts for low stock..."
                />
                {errors.productDescription && (
                  <p className="text-error text-sm mt-2 flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    {errors.productDescription.message}
                  </p>
                )}
              </div>
            )}
          />
          {activeGuide === 'productDescription' && renderEducationalGuide('productDescription')}
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-center mt-12">
        <button
          type="submit"
          disabled={!isValid || isAnalyzing}
          className={`
            btn btn-primary btn-lg shadow-lg
            ${isAnalyzing ? 'loading' : ''}
            hover:shadow-xl hover:-translate-y-1 transition-all duration-300
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze My Idea'}
          {!isAnalyzing && <ArrowRight className="w-5 h-5 ml-2" />}
        </button>
      </div>

      {aiInsights && (
        <div className="mt-8">
          <ReactMarkdown>{aiInsights}</ReactMarkdown>
        </div>
      )}
    </form>
  );
};

export default IdeaInput;
