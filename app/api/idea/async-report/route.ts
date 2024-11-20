import { createClient } from '@/libs/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { analysisId, email } = await request.json();
    console.log('Triggering async report generation for:', { analysisId, email });

    const supabase = createClient();

    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('generate-report', {
      body: { analysisId, email },
    });

    if (error) {
      console.error('Error invoking edge function:', error);
      throw error;
    }

    console.log('Successfully triggered report generation');
    return NextResponse.json({ success: true, token: data.token });
  } catch (error) {
    console.error('Error in async report generation:', error);
    return NextResponse.json({ error: 'Failed to process report request' }, { status: 500 });
  }
}
