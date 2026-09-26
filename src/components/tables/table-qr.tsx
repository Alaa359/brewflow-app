'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { QRCodeSVG } from 'qrcode.react';

export function TableQr({
  token,
  size = 200,
  onToast,
}: {
  token: string;
  size?: number;
  onToast?: (message: string) => void;
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
      onToast?.(t('linkCopied'));
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-col items-center justify-center p-4 bg-surface-container-low rounded-xl w-full">
        <div className="relative bg-white rounded-xl shadow-sm flex items-center justify-center p-3 overflow-hidden">
          {url ? (
            <QRCodeSVG value={url} size={size} level="M" />
          ) : (
            <div style={{ width: size, height: size }} />
          )}
        </div>
        <div className="mt-3 text-center w-full">
          <span className="font-label-caps text-label-caps text-on-surface-variant/80 select-all block truncate max-w-[280px] mx-auto">
            {url || t('generatingLink')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 w-full pt-1">
        <a
          href={url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold transition-colors shadow-xs"
        >
          <span className="material-symbols-outlined text-body-md text-primary">
            open_in_new
          </span>
          <span>{t('openMenu')}</span>
        </a>
        <button
          type="button"
          onClick={copyLink}
          disabled={!url}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold transition-colors shadow-xs disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-body-md text-secondary">
            content_copy
          </span>
          <span>{copied ? t('linkCopied') : t('copyLink')}</span>
        </button>
      </div>
    </div>
  );
}
