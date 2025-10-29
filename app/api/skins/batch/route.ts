import { NextResponse } from 'next/server';
import { getSkinDetail } from '@/data/skinData';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ids: string[] = Array.isArray(body?.ids) ? body.ids : [];

    const result: Record<string, any> = {};

    ids.forEach((id) => {
      const detail = getSkinDetail(id);
      if (detail) {
        result[id] = detail;
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }
}
