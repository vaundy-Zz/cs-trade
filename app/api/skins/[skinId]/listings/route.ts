import { NextResponse } from 'next/server';
import { getMarketListings } from '@/data/skinData';

interface RouteContext {
  params: {
    skinId: string;
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const { skinId } = context.params;
  const listings = getMarketListings(skinId);

  if (!listings) {
    return NextResponse.json({ error: 'Skin not found' }, { status: 404 });
  }

  return NextResponse.json(listings);
}
