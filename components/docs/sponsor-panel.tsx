'use client';

import { Copy, HeartHandshake, QrCode } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { sponsorSettings as sponsor } from '@/lib/static-config';
import { withBasePath } from '@/lib/site-path';

export function SponsorPanel() {
  if (!sponsor.enabled) {
    return (
      <Card className="not-prose my-8">
        <CardContent className="text-muted-foreground grid min-h-40 place-items-center text-sm">
          赞助通道暂未开放。
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="not-prose my-8 grid gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <HeartHandshake className="size-5" />
                赞助这份开发文档
              </CardTitle>
              <CardDescription>
                所有赞助都将用于购买 token，继续蒸馏子比主题数据和完善知识库。
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">国产模型：DeepSeek</Badge>
              <Badge variant="secondary">国外模型：ChatGPT / Claude</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-muted-foreground text-sm leading-7">
            {sponsor.intro}
          </p>
          {sponsor.tokenSponsorEnabled ? (
            <div className="bg-muted/45 rounded-lg border p-3 text-sm">
              也支持以 token 预算的方式赞助本站。当前仅考虑 DeepSeek、ChatGPT 和
              Claude，其它模型暂不纳入数据蒸馏预算。
            </div>
          ) : null}
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        <SponsorMethod title="微信赞助" qrUrl={sponsor.wechatQrUrl} />
        <SponsorMethod title="支付宝赞助" qrUrl={sponsor.alipayQrUrl} />
        <SponsorMethod
          title="USDT / TRC20"
          qrUrl={sponsor.usdtQrUrl}
          address={sponsor.usdtTrc20Address}
        />
      </div>
    </div>
  );
}

function SponsorMethod({
  title,
  qrUrl,
  address,
}: {
  title: string;
  qrUrl?: string;
  address?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyAddress() {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="bg-muted/45 grid aspect-square place-items-center rounded-lg border">
          {qrUrl ? (
            <img
              src={withBasePath(qrUrl)}
              alt={`${title}二维码`}
              className="h-full w-full rounded-lg object-contain p-3"
            />
          ) : (
            <div className="text-muted-foreground grid gap-2 text-center text-sm">
              <QrCode className="mx-auto size-9" />
              暂未配置二维码
            </div>
          )}
        </div>
        {address ? (
          <div className="grid gap-2">
            <div className="bg-muted rounded-md p-2 font-mono text-xs break-all">
              {address}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => void copyAddress()}
            >
              <Copy className="size-4" />
              {copied ? '已复制' : '复制地址'}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
