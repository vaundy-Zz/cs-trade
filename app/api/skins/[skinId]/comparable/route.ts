import { NextResponse } from 'next/server';
import { getComparableSkins } from '@/data/skinData';

interface RouteContext {
  params: {
    skinId: string;
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const { skinId } = context.params;
  const comparable = getComparableSkins(skinId);

  if (!comparable) {
    return NextResponse.json({ error: 'Skin not found' }, { status: 404 });
  }

  return NextResponse.json(comparable);
}
