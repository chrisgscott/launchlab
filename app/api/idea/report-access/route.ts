import { NextResponse } from 'next/server';
import { createClient } from '@/libs/supabase/server';
import { nanoid } from 'nanoid';
import { z } from 'zod';

const ReportAccessRequestSchema = z.object({
  email: z.string().email(),
  analysisId: z.string(),
});

export async function POST(request: Request) {
  try {
    console.log('Received report access request');
    const body = await request.json();
    console.log('Request body:', body);

    const validatedData = ReportAccessRequestSchema.parse(body);
    console.log('Validated request data:', validatedData);

    if (!validatedData.email) {
      console.error('Email is required but was not provided');
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = createClient();

    // Check if the analysis exists and has a report
    console.log('Checking analysis status:', validatedData.analysisId);
    const { data: analysis, error: analysisError } = await supabase
      .from('idea_analyses')
      .select('report_generated')
      .eq('id', validatedData.analysisId)
      .single();

    if (analysisError) {
      console.error('Error fetching analysis:', analysisError);
      return NextResponse.json(
        { error: 'Analysis not found', details: analysisError },
        { status: 404 }
      );
    }

    if (!analysis) {
      console.error('Analysis not found:', validatedData.analysisId);
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    if (!analysis.report_generated) {
      console.error('Report not yet generated for analysis:', validatedData.analysisId);
      return NextResponse.json({ error: 'Report not yet generated' }, { status: 400 });
    }

    // Create a unique token for report access
    const token = nanoid();
    console.log('Generated access token:', token);

    // Store the token and email in the database
    console.log('Storing report access record...');
    const { error } = await supabase.from('report_access').insert([
      {
        token,
        email: validatedData.email,
        analysis_id: validatedData.analysisId,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
    ]);

    if (error) {
      console.error('Error creating report access:', error);
      return NextResponse.json(
        { error: 'Failed to create report access', details: error },
        { status: 500 }
      );
    }

    console.log('Successfully created report access');
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error in report access endpoint:', error);
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const supabase = createClient();

    // Get the report access record and check if it's expired
    const { data: accessRecord, error: accessError } = await supabase
      .from('report_access')
      .select('*')
      .eq('token', token)
      .single();

    if (accessError || !accessRecord) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
    }

    if (new Date(accessRecord.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Token has expired' }, { status: 401 });
    }

    // Get the report data
    const { data: analysis, error: analysisError } = await supabase
      .from('idea_analyses')
      .select('report_data')
      .eq('id', accessRecord.analysis_id)
      .single();

    if (analysisError || !analysis) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json(analysis.report_data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
