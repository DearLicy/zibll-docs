import { DocsLayoutClient } from '@/components/docs-layout-client';
import { source } from '@/lib/source';
import type { ReactNode } from 'react';

export default function Template({ children }: { children: ReactNode }) {
  return (
    <DocsLayoutClient tree={source.getPageTree()}>{children}</DocsLayoutClient>
  );
}
