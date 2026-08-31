import { cn } from '@/lib/utils';
import { siteSettings } from '@/lib/static-config';
import { withBasePath } from '@/lib/site-path';

export function SiteLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn('relative inline-block h-10 w-[128px] shrink-0', className)}
    >
      <img
        src={withBasePath(siteSettings.logoLight)}
        alt={siteSettings.siteName}
        className="absolute inset-0 h-full w-full object-contain dark:hidden"
      />
      <img
        src={withBasePath(siteSettings.logoDark)}
        alt={siteSettings.siteName}
        className="absolute inset-0 hidden h-full w-full object-contain dark:block"
      />
    </span>
  );
}
