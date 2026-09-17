'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { QRCodeSVG } from 'qrcode.react';
import { CopyIcon, ExternalLinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TableQr({
  token,
  size = 168,
}: {
  token: string;
  size?: number;
}) {
  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);
  const t = useTranslations('Tables');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.origin);
  }, []);

  const url = origin ? `${origin}/m/${token}` : '';

  async function copyLink() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-lg border bg-white p-3">
        {url ? (
          <QRCodeSVG value={url} size={size} level="M" />
        ) : (
          <div style={{ width: size, height: size }} />
        )}
      </div>
      <p className="text-muted-foreground max-w-72 truncate text-center text-xs">
        {url || t('generatingLink')}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" variant="outline" size="sm" asChild>
          <a href={url || '#'} target="_blank" rel="noopener noreferrer">
            <ExternalLinkIcon />
            {t('openMenu')}
          </a>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={copyLink}
          disabled={!url}
        >
          <CopyIcon />
          {copied ? t('linkCopied') : t('copyLink')}
        </Button>
      </div>
    </div>
  );
}
