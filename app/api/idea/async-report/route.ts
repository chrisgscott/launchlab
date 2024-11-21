import { createClient } from '@/libs/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { analysisId, email } = await request.json();
    console.log('Triggering async report generation for:', { analysisId, email });

    // Start the Edge Function invocation without waiting for it to complete
    const supabase = createClient();
    supabase.functions.invoke('generate-report', {
      body: { analysisId, email },
    }).catch(error => {
      // Log any errors but don't block the response
      console.error('Error in edge function (async):', error);
    });

    console.log('Successfully triggered report generation');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in async report generation:', error);
    return NextResponse.json({ error: 'Failed to process report request' }, { status: 500 });
  }
}
