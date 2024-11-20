/// <reference lib="deno.ns" />

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'https://esm.sh/openai@4.20.1';
import { customAlphabet } from 'https://esm.sh/nanoid@5.0.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate a secure random URL string (32 characters, URL-safe)
const generateSecureUrl = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  32
);

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Log environment variables (safely)
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const openaiModel = Deno.env.get('OPENAI_MODEL');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const brevoApiKey = Deno.env.get('BREVO_API_KEY');
    const publicAppUrl = Deno.env.get('PUBLIC_APP_URL');

    console.log('Environment check:', {
      hasOpenAiKey: !!openaiKey,
      openaiModel,
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      hasBrevoKey: !!brevoApiKey,
      publicAppUrl,
    });

    // Validate required environment variables
    if (!openaiKey) throw new Error('OPENAI_API_KEY is required');
    if (!openaiModel) throw new Error('OPENAI_MODEL is required');
    if (!supabaseUrl) throw new Error('SUPABASE_URL is required');
    if (!supabaseKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
    if (!brevoApiKey) throw new Error('BREVO_API_KEY is required');
    if (!publicAppUrl) throw new Error('PUBLIC_APP_URL is required');

    // Initialize clients
    const openai = new OpenAI({
      apiKey: openaiKey,
    });

    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    const { analysisId, email } = await req.json();

    // Validate input parameters
    if (!analysisId || typeof analysisId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'analysisId is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'A valid email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing report generation for:', { analysisId, email });

    // Generate a secure random URL string
    const secureUrl = generateSecureUrl();

    // Update the analysis with the secure URL and mark it as pending
    const { error: updateError } = await supabaseClient
      .from('idea_analyses')
      .update({
        report_url: secureUrl,
        report_email: email,
        report_generated: false,
      })
      .eq('id', analysisId);

    if (updateError) {
      console.error('Error updating analysis:', updateError);
      throw updateError;
    }

    // Generate and store the report asynchronously
    const { data: analysis, error: analysisError } = await supabaseClient
      .from('idea_analyses')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (analysisError) {
      console.error('Error fetching analysis:', analysisError);
      throw analysisError;
    }

    if (!analysis) {
      throw new Error(`No analysis found for ID: ${analysisId}`);
    }

    console.log('Found analysis:', analysis);

    // 2. Generate the report using OpenAI
    console.log('Generating report with OpenAI...');
    const prompt = `Generate a detailed validation roadmap report for a business idea with the following details:

Problem Statement: ${analysis.problem_statement}
Target Audience: ${analysis.target_audience}
Value Proposition: ${analysis.unique_value_proposition}
Product Description: ${analysis.product_description}

Analysis Insights:
${JSON.stringify(analysis.insights, null, 2)}

Structure the report in two parts:

PART 1 - PREVIEW INSIGHTS
A high-level overview of the key findings and recommendations.

PART 2 - DETAILED REPORT
Provide a comprehensive report that includes:
1. Executive Summary
2. Market Analysis and Opportunity
3. Key Strengths and Competitive Advantages
4. Critical Issues and Challenges
5. Recommended Next Steps
6. Timeline and Milestones
7. Success Metrics and KPIs
8. Detailed Improvement Strategies
   For each category, provide:
   - Current strengths (2-3 points)
   - Areas for improvement (2-3 points)
   - Comprehensive action plan (5-7 detailed steps)
   - Expected outcomes
   - Implementation timeline
   - Resource requirements
   - Risk mitigation strategies

Important: Focus on providing detailed, actionable strategies that go beyond the initial analysis.`;

    console.log('Using OpenAI model:', openaiModel);
    const completion = await openai.chat.completions.create({
      model: openaiModel,
      messages: [
        {
          role: 'system',
          content:
            'You are a startup advisor and business analyst. Your task is to generate a detailed validation roadmap report based on the provided business idea analysis.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3500,
    });

    const report = completion.choices[0]?.message?.content;
    if (!report) {
      throw new Error('Failed to generate report');
    }

    console.log('Generated report successfully');

    // Store the report and mark it as generated
    const { error: finalUpdateError } = await supabaseClient
      .from('idea_analyses')
      .update({
        report_data: report,
        report_generated: true,
      })
      .eq('id', analysisId);

    if (finalUpdateError) {
      console.error('Error updating analysis:', finalUpdateError);
      throw finalUpdateError;
    }

    console.log('Stored report successfully');

    // Send email with the secure URL
    const reportUrl = `${publicAppUrl}/idea/report/${secureUrl}`;

    // TODO: Send email with reportUrl using Brevo API
    // For now, just return success
    // Using the reportUrl variable to fix the unused variable warning
    console.log('Report URL:', reportUrl);
    return new Response(JSON.stringify({ success: true, reportUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
