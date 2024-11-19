import { NextResponse } from 'next/server';
import brevo from '@/libs/brevo';

export async function POST(request: Request) {
  try {
    const { email, listId } = await request.json();

    if (!email || !listId) {
      return NextResponse.json({ error: 'Email and listId are required' }, { status: 400 });
    }

    await brevo.subscribeToList(email, listId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error subscribing to list:', error);
    return NextResponse.json({ error: 'Failed to subscribe to list' }, { status: 500 });
  }
}
