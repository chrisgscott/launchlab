// Follow Deno and Edge Function conventions
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'https://esm.sh/openai@4.20.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // 1. Get the analysis data
    console.log('Fetching analysis data...');
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
- Market Opportunity: ${analysis.insights.marketOpportunity}
- Competitive Advantage: ${analysis.insights.competitiveAdvantage}
- Feasibility: ${analysis.insights.feasibility}
- Revenue Potential: ${analysis.insights.revenuePotential}
- Market Timing: ${analysis.insights.marketTiming}
- Scalability: ${analysis.insights.scalability}
- Total Score: ${analysis.insights.totalScore}
- Critical Issues: ${analysis.insights.criticalIssues.join(', ')}
- Next Steps: ${analysis.insights.nextSteps.join(', ')}

Please provide a comprehensive report that includes:
1. Executive Summary
2. Market Analysis and Opportunity
3. Key Strengths and Competitive Advantages
4. Critical Issues and Challenges
5. Recommended Next Steps
6. Timeline and Milestones
7. Success Metrics and KPIs`;

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
      max_tokens: 2000,
    });

    const report = completion.choices[0]?.message?.content;
    if (!report) {
      throw new Error('Failed to generate report');
    }

    console.log('Generated report successfully');

    // 3. Store the report
    console.log('Storing report in database...');
    const { error: updateError } = await supabaseClient
      .from('idea_analyses')
      .update({
        report_data: report,
        report_generated: true,
      })
      .eq('id', analysisId);

    if (updateError) {
      console.error('Error updating analysis:', updateError);
      throw updateError;
    }

    console.log('Stored report successfully');

    // 4. Create access token
    console.log('Creating access token...');
    const { data: token, error: tokenError } = await supabaseClient.rpc(
      'create_report_access_token',
      {
        p_analysis_id: analysisId,
        p_email: email,
      }
    );

    if (tokenError) {
      console.error('Error creating access token:', tokenError);
      throw tokenError;
    }

    console.log('Created access token:', token);

    // 5. Send email using Brevo
    console.log('Sending email...');
    const reportUrl = `${publicAppUrl}/report/${token}`;
    const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify({
        to: [{ email }],
        templateId: 7,
        params: {
          reportUrl,
          score: analysis.insights.totalScore,
        },
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Error sending email:', errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    console.log('Email sent successfully');

    return new Response(JSON.stringify({ success: true, token }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in generate-report function:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        stack: error.stack,
        name: error.name,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
