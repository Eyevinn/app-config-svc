'use client';

import { useApiUrl } from '@/hooks/useApiUrl';

export default function Footer() {
  const apiUrl = useApiUrl();

  return (
    <div>
      <span className="text-default text-xs">{apiUrl}</span>
    </div>
  );
}
