'use client';

import { FeedContainer } from '@/components/feed/feed-container';
import { useParams } from 'next/navigation';

export default function FeedCatchAllPage() {
  const params = useParams();
  const id = params?.id?.[0];
  
  return <FeedContainer initialId={id} />;
}
