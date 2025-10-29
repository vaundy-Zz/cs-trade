import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { skinId, action, metadata, timestamp } = body;

    if (!skinId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('Analytics Event:', {
      skinId,
      action,
      metadata,
      timestamp: timestamp || new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }
}
