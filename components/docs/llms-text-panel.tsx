'use client';

import { useEffect, useState } from 'react';
import { withBasePath } from '@/lib/site-path';

export function LLMSTextPanel() {
  const [cacheKey, setCacheKey] = useState('');
  const [text, setText] = useState('正在读取 llms.txt...');
  const staticPath = withBasePath('/llms.txt');

  useEffect(() => {
    const nextCacheKey = String(Date.now());
    const controller = new AbortController();

    setCacheKey(nextCacheKey);
    fetch(`${staticPath}?t=${nextCacheKey}`, {
      cache: 'default',
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok)
          throw new Error(`Failed to load llms.txt: ${response.status}`);
        return response.text();
      })
      .then(setText)
      .catch((error: unknown) => {
        if ((error as Error).name === 'AbortError') return;
        setText('llms.txt 读取失败，请直接打开文本链接重试。');
      });

    return () => controller.abort();
  }, []);

  const href = cacheKey ? `${staticPath}?t=${cacheKey}` : staticPath;

  return (
    <div className="not-prose bg-fd-muted/30 rounded-lg border">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <span className="text-sm font-medium">llms.txt</span>
        <a
          className="text-fd-muted-foreground hover:text-fd-foreground text-sm transition-colors"
          href={href}
        >
          打开文本
        </a>
      </div>
      <pre className="max-h-[640px] overflow-auto p-4 text-sm leading-6 whitespace-pre-wrap">
        <code>{text}</code>
      </pre>
    </div>
  );
}
