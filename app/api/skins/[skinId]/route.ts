import { NextResponse } from 'next/server';
import { getSkinDetail } from '@/data/skinData';

interface RouteContext {
  params: {
    skinId: string;
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const { skinId } = context.params;
  const data = getSkinDetail(skinId);

  if (!data) {
    return NextResponse.json({ error: 'Skin not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}
