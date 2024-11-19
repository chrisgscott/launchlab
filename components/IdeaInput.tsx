'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Zod schema for validation
const IdeaSchema = z.object({
  problemStatement: z.string()
    .min(20, { message: "Problem statement must be at least 20 characters" })
    .max(500, { message: "Problem statement must be less than 500 characters" }),
  
  targetAudience: z.string()
    .min(10, { message: "Target audience description must be at least 10 characters" })
    .max(300, { message: "Target audience description must be less than 300 characters" }),
  
  uniqueValueProposition: z.string()
    .min(20, { message: "Unique value proposition must be at least 20 characters" })
    .max(500, { message: "Unique value proposition must be less than 500 characters" }),
  
  productDescription: z.string()
    .min(30, { message: "Product description must be at least 30 characters" })
    .max(1000, { message: "Product description must be less than 1000 characters" })
});

type IdeaFormData = z.infer<typeof IdeaSchema>;

const IdeaInput: React.FC = () => {
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { 
    control, 
    handleSubmit, 
    formState: { errors, isValid } 
  } = useForm<IdeaFormData>({
    resolver: zodResolver(IdeaSchema),
    mode: 'onChange'
  });

  const onSubmit = async (data: IdeaFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement AI insight generation
      // This will be replaced with actual AI API call
      const mockAiInsight = generateMockAiInsight(data);
      setAiInsights(mockAiInsight);
    } catch (error) {
      console.error('Error generating AI insights', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock function to simulate AI insights generation
  const generateMockAiInsight = (data: IdeaFormData): string => {
    return `Based on your idea about ${data.problemStatement}, 
    we see potential in targeting ${data.targetAudience}. 
    Your unique value proposition looks promising, 
    but you might want to refine your product description.`;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-base-100 shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-center text-base-content">
        Bring Your Entrepreneurial Vision to Life
      </h2>
      <p className="text-center text-base-content/70 mb-8">
        We'll help you articulate your idea and provide initial insights.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-base-content">
            What Problem Are You Solving?
          </label>
          <Controller
            name="problemStatement"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                className={`textarea textarea-bordered w-full ${
                  errors.problemStatement ? 'textarea-error' : ''
                }`}
                rows={3}
                placeholder="Describe the problem your idea addresses..."
              />
            )}
          />
          {errors.problemStatement && (
            <p className="mt-2 text-sm text-error">
              {errors.problemStatement.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-base-content">
            Who is Your Target Audience?
          </label>
          <Controller
            name="targetAudience"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                className={`textarea textarea-bordered w-full ${
                  errors.targetAudience ? 'textarea-error' : ''
                }`}
                rows={3}
                placeholder="Describe the people who will benefit most from your solution..."
              />
            )}
          />
          {errors.targetAudience && (
            <p className="mt-2 text-sm text-error">
              {errors.targetAudience.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-base-content">
            What Makes Your Solution Unique?
          </label>
          <Controller
            name="uniqueValueProposition"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                className={`textarea textarea-bordered w-full ${
                  errors.uniqueValueProposition ? 'textarea-error' : ''
                }`}
                rows={3}
                placeholder="What sets your solution apart from existing alternatives?"
              />
            )}
          />
          {errors.uniqueValueProposition && (
            <p className="mt-2 text-sm text-error">
              {errors.uniqueValueProposition.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-base-content">
            Describe Your Product or Service
          </label>
          <Controller
            name="productDescription"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                className={`textarea textarea-bordered w-full ${
                  errors.productDescription ? 'textarea-error' : ''
                }`}
                rows={4}
                placeholder="Provide a detailed description of what you're building..."
              />
            )}
          />
          {errors.productDescription && (
            <p className="mt-2 text-sm text-error">
              {errors.productDescription.message}
            </p>
          )}
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={`btn btn-primary btn-wide ${
              isSubmitting ? 'loading' : ''
            }`}
          >
            {isSubmitting ? 'Generating Insights...' : 'Get Idea Insights'}
          </button>
        </div>
      </form>

      {aiInsights && (
        <div className="mt-8 p-4 bg-primary/5 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-base-content">AI Insights</h3>
          <p className="text-base-content/80">{aiInsights}</p>
        </div>
      )}
    </div>
  );
};

export default IdeaInput;
