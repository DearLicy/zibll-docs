'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Check,
  Copy,
  FileText,
  LibraryBig,
  ListTree,
  MessagesSquare,
} from 'lucide-react';
import { withBasePath } from '@/lib/site-path';

function useCurrentOrigin() {
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin);
  }, []);

  return origin;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1400);
      }}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      复制
    </Button>
  );
}

function EndpointCard({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  const origin = useCurrentOrigin();
  const staticPath = withBasePath(path);
  const value = `${origin}${staticPath}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/35 flex min-w-0 flex-wrap items-center gap-2 rounded-lg border p-3">
          <code className="min-w-0 flex-1 text-sm break-all">
            {origin ? value : staticPath}
          </code>
          <CopyButton value={origin ? value : staticPath} />
        </div>
      </CardContent>
    </Card>
  );
}

export function LLMSGuidePanel() {
  return (
    <div className="not-prose my-6 space-y-6">
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ListTree className="size-4" />
              文档索引
            </CardTitle>
            <CardDescription>
              `llms.txt` 让 AI 先理解文档目录、页面地址和可读取的 Markdown
              入口。
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <LibraryBig className="size-4" />
              完整上下文
            </CardTitle>
            <CardDescription>
              需要一次性提供全部资料时，可以使用构建期生成的完整文档文本。
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="size-4" />
              单页读取
            </CardTitle>
            <CardDescription>
              已知主题时，让 AI 读取对应 slug 的单篇 Markdown，回答会更聚焦。
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="index" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-1 gap-1 p-1 md:grid-cols-3">
          <TabsTrigger value="index">索引</TabsTrigger>
          <TabsTrigger value="full">全文</TabsTrigger>
          <TabsTrigger value="page">单页</TabsTrigger>
        </TabsList>
        <TabsContent value="index">
          <EndpointCard
            title="llms.txt"
            description="适合作为第一步上下文，让 AI 了解本站文档结构。"
            path="/llms.txt"
          />
        </TabsContent>
        <TabsContent value="full">
          <EndpointCard
            title="llms-full.txt"
            description="包含公开文档全文，适合需要完整上下文的长任务。"
            path="/llms-full.txt"
          />
        </TabsContent>
        <TabsContent value="page">
          <EndpointCard
            title="单篇 Markdown"
            description="把 {slug} 换成文档路径，例如 codestar-framework 或 api/functions。"
            path="/docs/{slug}.mdx"
          />
        </TabsContent>
      </Tabs>

      <Alert>
        <MessagesSquare className="size-4" />
        <AlertTitle>推荐使用方式</AlertTitle>
        <AlertDescription>
          先读取 `llms.txt` 确认目录，再读取单篇 Markdown；需要完整资料时再使用
          `llms-full.txt`。
        </AlertDescription>
      </Alert>
    </div>
  );
}
