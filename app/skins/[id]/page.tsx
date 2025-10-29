'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { SkinDetailPage } from '@/components/SkinDetailPage';

export default function SkinPage() {
  const params = useParams();
  const skinId = params.id as string;

  return <SkinDetailPage skinId={skinId} />;
}
