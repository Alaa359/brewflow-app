'use client';

import { useState, useRef, useCallback, useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { login } from '@/actions/auth';
import Link from 'next/link';

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const t = useTranslations('Auth.login');
  const passwordRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const toastRef = useRef<HTMLDivElement>(null);
  const toastTextRef = useRef<HTMLSpanElement>(null);
  const toastIconRef = useRef<HTMLSpanElement>(null);

  const showToast = useCallback(
    (message: string, iconName = 'info', iconColor = 'text-primary') => {
      const toast = toastRef.current;
      const textEl = toastTextRef.current;
      const iconEl = toastIconRef.current;
      if (!toast || !textEl || !iconEl) return;
      textEl.textContent = message;
      iconEl.textContent = iconName;
      iconEl.className = `material-symbols-outlined ${iconColor} text-[22px]`;
      toast.classList.remove('translate-y-24', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
      setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-24', 'opacity-0');
      }, 2800);
    },
    []
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return (
    <>
      <div className="glass-panel rounded-2xl p-8 sm:p-11 transition-all shadow-2xl border border-outline-variant/60 shadow-primary/20">
        {/* Logo + heading */}
        <div className="text-center flex flex-col items-center mb-6">
          <div className="relative group mb-3">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-primary-container via-primary-fixed-dim to-primary opacity-60 blur-md transition group-hover:opacity-90" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="BrewFlow Medallion"
              className="relative w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-xl"
              src="/logo-brewflow.svg"
            />
          </div>
          <h1 className="font-[family-name:var(--font-sora)] text-[26px] sm:text-[30px] font-bold tracking-tight text-on-surface leading-tight">
            BrewFlow
          </h1>
          <p className="text-[13px] text-secondary font-medium tracking-wide mt-0.5">
            Specialty Coffee &amp; Hospitality OS
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high/80 border border-outline-variant/40 mt-3">
            <span className="material-symbols-outlined text-[15px] text-primary">
              storefront
            </span>
            <span className="text-[11px] uppercase tracking-wider text-secondary font-semibold">
              Succursale La Marsa • Terminal Sécurisé
            </span>
          </div>
        </div>

        {/* Form */}
        <form action={action} className="space-y-4">
          {/* Email */}
          <div>
            <label
              className="block text-[11px] uppercase text-secondary font-semibold mb-1.5 tracking-wider"
              htmlFor="email"
            >
              {t('email')}
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                <span className="material-symbols-outlined text-outline text-[20px]">
                  alternate_email
                </span>
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="admin@brewflow.tn"
                required
                aria-invalid={!!state?.errors?.email}
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-surface-container-lowest/90 border border-outline-variant/60 text-on-surface text-sm placeholder-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            {state?.errors?.email?.map((e) => (
              <p key={e} className="text-destructive text-xs mt-1">{e}</p>
            ))}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                className="text-[11px] uppercase text-secondary font-semibold tracking-wider"
                htmlFor="password"
              >
                {t('password')}
              </label>
              <Link
                href="/login"
                className="text-[12px] text-primary hover:text-caramel-dark font-medium hover:underline transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <div className="relative rounded-xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                <span className="material-symbols-outlined text-outline text-[20px]">
                  lock
                </span>
              </div>
              <input
                ref={passwordRef}
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                required
                aria-invalid={!!state?.errors?.password}
                className="w-full h-12 pl-11 pr-11 rounded-xl bg-surface-container-lowest/90 border border-outline-variant/60 text-on-surface text-sm placeholder-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-outline hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]" id="eyeIcon">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {state?.errors?.password?.map((e) => (
              <p key={e} className="text-destructive text-xs mt-1">{e}</p>
            ))}
          </div>

          {/* Form errors */}
          {state?.errors?.form?.map((e) => (
            <p
              key={e}
              className="bg-destructive/10 text-destructive rounded-xl px-3 py-2 text-xs"
            >
              {e}
            </p>
          ))}

          {/* Remember me */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded border-outline-variant/80 text-primary focus:ring-primary focus:ring-offset-0 transition-colors"
              />
              <span className="text-[13px] text-on-surface-variant font-medium">
                Mémoriser cette station
              </span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={pending}
            className="w-full h-12 mt-2 rounded-xl bg-primary hover:bg-caramel-dark active:bg-caramel-dark text-white font-semibold text-[15px] flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all duration-150 active:scale-[0.985]"
          >
            <span className="material-symbols-outlined text-[20px]">
              login
            </span>
            <span>{pending ? t('submitting') : t('submit')}</span>
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-outline-variant/50" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-surface-container-low/90 px-3 py-0.5 rounded-full text-[10px] uppercase text-secondary font-semibold tracking-wider">
              Ou connexion rapide par
            </span>
          </div>
        </div>

        {/* Quick login buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() =>
              showToast(
                'Badge Barista #RFID-4091 scanné',
                'contactless',
                'text-primary'
              )
            }
            className="h-11 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/40 text-on-surface flex items-center justify-center gap-2 text-[12px] font-medium transition-all active:scale-95 group shadow-sm"
          >
            <span className="material-symbols-outlined text-[19px] text-primary group-hover:scale-110 transition-transform">
              contactless
            </span>
            <span className="font-semibold text-[12px]">Badge RFID / NFC</span>
          </button>
          <button
            type="button"
            onClick={() =>
              showToast(
                'Attente Touch ID / Passkey FIDO2...',
                'fingerprint',
                'text-primary'
              )
            }
            className="h-11 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/40 text-on-surface flex items-center justify-center gap-2 text-[12px] font-medium transition-all active:scale-95 group shadow-sm"
          >
            <span className="material-symbols-outlined text-[19px] text-tertiary group-hover:scale-110 transition-transform">
              fingerprint
            </span>
            <span className="font-semibold text-[12px]">Passkey / FIDO2</span>
          </button>
        </div>

        {/* PIN mode */}
        <div className="mt-4 pt-3 text-center border-t border-outline-variant/30">
          <button
            type="button"
            onClick={() =>
              showToast('Clavier virtuel PIN activé', 'dialpad', 'text-primary')
            }
            className="inline-flex items-center gap-1.5 text-primary hover:text-caramel-dark font-semibold text-[12px] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">
              dialpad
            </span>
            <span>Mode PIN rapide pour Barista en service</span>
          </button>
        </div>

        {/* Security footer */}
        <div className="mt-4 pt-3 flex items-center justify-center gap-2 text-[11px] text-secondary text-center border-t border-outline-variant/20">
          <span
            className="material-symbols-outlined text-[14px] text-tertiary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            verified_user
          </span>
          <span>
            Chiffrement SSL SHA-256 • Conforme Décret 2018-56 Caisses
          </span>
        </div>

        {/* Register link */}
        <div className="mt-4 text-center">
          <p className="text-[13px] text-on-surface-variant">
            {t('noAccount')}{' '}
            <Link
              href="/register"
              className="text-primary hover:text-caramel-dark font-semibold hover:underline transition-colors"
            >
              {t('registerLink')}
            </Link>
          </p>
        </div>
      </div>

      {/* Toast */}
      <div
        ref={toastRef}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 translate-y-24 opacity-0 transition-all duration-300 pointer-events-none px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 bg-inverse-surface text-inverse-on-surface"
      >
        <span
          ref={toastIconRef}
          className="material-symbols-outlined text-tertiary text-[22px]"
        >
          check_circle
        </span>
        <span ref={toastTextRef} className="text-[13px] font-medium" />
      </div>
    </>
  );
}
