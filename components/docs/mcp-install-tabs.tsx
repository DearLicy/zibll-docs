'use client';

import { useState } from 'react';
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
  BookOpenText,
  Check,
  Copy,
  FileSearch,
  MessageSquareText,
  Network,
  PlugZap,
  Sparkles,
} from 'lucide-react';

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-muted-foreground hover:text-foreground absolute top-2 right-2 h-7 px-2"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1400);
      }}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      <span className="sr-only">复制</span>
    </Button>
  );
}

function CodeBlock({
  value,
  language = 'bash',
}: {
  value: string;
  language?: string;
}) {
  return (
    <div className="bg-muted/40 relative my-4 overflow-hidden rounded-lg border">
      <CopyButton value={value} />
      <pre className="overflow-x-auto p-4 pr-16 text-sm leading-6">
        <code data-language={language}>{value}</code>
      </pre>
    </div>
  );
}

const localCommand = 'npx -y zibll-docs-mcp';
const pluginCommand =
  'codex plugin marketplace add https://github.com/DearLicy/zibll-docs.git && codex plugin add zibll-docs@zibll-docs';
const optionalPluginCommands = `codex plugin add zibll-theme-dev@zibll-docs
codex plugin add zibll-wp-ai-dev@zibll-docs
codex plugin add zibll-migration-helper@zibll-docs`;
const codexConfig = `[mcp_servers.zibll-docs]
command = "npx"
args = ["-y", "zibll-docs-mcp"]`;
const cursorConfig = `{
  "mcpServers": {
    "zibll-docs": {
      "command": "npx",
      "args": ["-y", "zibll-docs-mcp"]
    }
  }
}`;
const vscodeConfig = `{
  "servers": {
    "zibll-docs": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "zibll-docs-mcp"]
    }
  }
}`;

export function MCPInstallTabs() {
  return (
    <div className="not-prose my-6 space-y-6">
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Network className="size-4" />
              纯静态文档站
            </CardTitle>
            <CardDescription>
              网站只发布 Fumadocs 静态文件，不运行 AI、登录、数据库或 MCP HTTP
              服务。
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileSearch className="size-4" />
              本地按需启动
            </CardTitle>
            <CardDescription>
              AI 客户端需要资料时才启动本地 `stdio` MCP 进程，读取公开文档资源。
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpenText className="size-4" />
              无密钥配置
            </CardTitle>
            <CardDescription>
              文档随插件包发布，不需要数据库、环境变量、Redis 或网站账号。
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Alert>
        <PlugZap className="size-4" />
        <AlertTitle>推荐接入方式</AlertTitle>
        <AlertDescription>
          MCP 运行在你的本地 AI 客户端进程中；网站本身只负责静态文档和下载入口。
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="codex" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1 md:grid-cols-4">
          <TabsTrigger value="codex">Codex</TabsTrigger>
          <TabsTrigger value="cursor">Cursor</TabsTrigger>
          <TabsTrigger value="vscode">VS Code</TabsTrigger>
          <TabsTrigger value="manual">手动运行</TabsTrigger>
        </TabsList>

        <TabsContent value="codex">
          <Card>
            <CardHeader>
              <CardTitle>Codex 插件</CardTitle>
              <CardDescription>
                插件会同时安装 Skill 和本地 stdio MCP 配置。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock value={pluginCommand} />
              <p className="text-muted-foreground text-sm leading-6">
                按需安装专业插件：
              </p>
              <CodeBlock value={optionalPluginCommands} />
              <p className="text-muted-foreground text-sm leading-6">
                只接入 MCP 时，把下面配置放入 Codex 配置文件：
              </p>
              <CodeBlock value={codexConfig} language="toml" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cursor">
          <Card>
            <CardHeader>
              <CardTitle>Cursor</CardTitle>
              <CardDescription>
                将本地 stdio 配置加入项目的 MCP 设置。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock value={cursorConfig} language="json" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vscode">
          <Card>
            <CardHeader>
              <CardTitle>VS Code</CardTitle>
              <CardDescription>
                在工作区 `.vscode/mcp.json` 中配置本地服务器。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock value={vscodeConfig} language="json" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>手动运行</CardTitle>
              <CardDescription>
                适合先检查 MCP 是否能够正常启动。运行后通过 stdin/stdout
                与客户端通信。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock value={localCommand} />
              <p className="text-muted-foreground text-sm leading-6">
                该命令不会启动网站端口，也不会写入数据库。更新文档包后重新运行即可。
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-4" />
            可直接尝试的提示词
          </CardTitle>
          <CardDescription>
            连接完成后，让 AI 先检索本站文档，再结合你的主题或插件源码工作。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="text-muted-foreground grid gap-2 text-sm">
            <li>
              先搜索本站关于 Codestar 自定义字段的文档，再给出文章 Meta 示例。
            </li>
            <li>读取 Zibpay 付费下载资料，列出开发时需要保留的权限检查。</li>
            <li>结合我的子主题源码，判断新功能应该放在插件还是子主题中。</li>
            <li>结合源码和文档，列出一次主题扩展的核对顺序。</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareText className="size-4" />
            可用工具
          </CardTitle>
          <CardDescription>
            MCP
            包提供文档列表、单页读取、关键词检索、相关文档包、大纲和代码示例查询。
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
