import { NextResponse } from 'next/server';
import { getPriceHistory } from '@/data/skinData';

interface RouteContext {
  params: {
    skinId: string;
  };
}

export async function GET(request: Request, context: RouteContext) {
  const { searchParams } = new URL(request.url);
  const daysParam = searchParams.get('days');
  const days = daysParam ? parseInt(daysParam, 10) : null;

  const { skinId } = context.params;
  const history = getPriceHistory(skinId);

  if (!history) {
    return NextResponse.json({ error: 'Skin not found' }, { status: 404 });
  }

  if (days && days > 0) {
    const filtered = history.slice(-days);
    return NextResponse.json(filtered);
  }

  return NextResponse.json(history);
}
