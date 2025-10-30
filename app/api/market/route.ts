import { NextRequest, NextResponse } from 'next/server'
import { fetchMarketData } from '@/lib/api'
import { MarketFilters } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    const filters: MarketFilters = {
      market: (searchParams.get('market') || 'global') as MarketFilters['market'],
      rarity: (searchParams.get('rarity') || 'legendary') as MarketFilters['rarity'],
      timeframe: (searchParams.get('timeframe') || '24h') as MarketFilters['timeframe'],
    }
    
    const data = await fetchMarketData(filters)
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    })
  } catch (error) {
    console.error('Error fetching market data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    )
  }
}
