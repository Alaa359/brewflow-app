'use client';

import { useState, useRef, useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { register } from '@/actions/auth';
import Link from 'next/link';

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, undefined);
  const t = useTranslations('Auth.register');
  const passwordRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const toastRef = useRef<HTMLDivElement>(null);
  const toastTextRef = useRef<HTMLSpanElement>(null);
  const toastIconRef = useRef<HTMLSpanElement>(null);

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
            Créer votre établissement
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high/80 border border-outline-variant/40 mt-3">
            <span className="material-symbols-outlined text-[15px] text-primary">
              add_business
            </span>
            <span className="text-[11px] uppercase tracking-wider text-secondary font-semibold">
              Nouveau Compte Gérant
            </span>
          </div>
        </div>

        {/* Form */}
        <form action={action} className="space-y-4">
          {/* Name + Establishment */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                className="block text-[11px] uppercase text-secondary font-semibold mb-1.5 tracking-wider"
                htmlFor="name"
              >
                {t('name')}
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                  <span className="material-symbols-outlined text-outline text-[20px]">
                    person
                  </span>
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder={t('namePlaceholder')}
                  required
                  aria-invalid={!!state?.errors?.name}
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-surface-container-lowest/90 border border-outline-variant/60 text-on-surface text-sm placeholder-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              {state?.errors?.name?.map((e) => (
                <p key={e} className="text-destructive text-xs mt-1">{e}</p>
              ))}
            </div>

            <div>
              <label
                className="block text-[11px] uppercase text-secondary font-semibold mb-1.5 tracking-wider"
                htmlFor="establishmentName"
              >
                {t('establishmentName')}
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                  <span className="material-symbols-outlined text-outline text-[20px]">
                    store
                  </span>
                </div>
                <input
                  id="establishmentName"
                  name="establishmentName"
                  type="text"
                  placeholder={t('establishmentNamePlaceholder')}
                  required
                  aria-invalid={!!state?.errors?.establishmentName}
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-surface-container-lowest/90 border border-outline-variant/60 text-on-surface text-sm placeholder-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              {state?.errors?.establishmentName?.map((e) => (
                <p key={e} className="text-destructive text-xs mt-1">{e}</p>
              ))}
            </div>
          </div>

          {/* Address + Phone */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                className="block text-[11px] uppercase text-secondary font-semibold mb-1.5 tracking-wider"
                htmlFor="address"
              >
                {t('address')}
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                  <span className="material-symbols-outlined text-outline text-[20px]">
                    location_on
                  </span>
                </div>
                <input
                  id="address"
                  name="address"
                  type="text"
                  placeholder={t('addressPlaceholder')}
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-surface-container-lowest/90 border border-outline-variant/60 text-on-surface text-sm placeholder-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-[11px] uppercase text-secondary font-semibold mb-1.5 tracking-wider"
                htmlFor="phone"
              >
                {t('phone')}
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                  <span className="material-symbols-outlined text-outline text-[20px]">
                    phone
                  </span>
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder={t('phonePlaceholder')}
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-surface-container-lowest/90 border border-outline-variant/60 text-on-surface text-sm placeholder-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

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
                placeholder="gerant@brewflow.tn"
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
            <label
              className="block text-[11px] uppercase text-secondary font-semibold mb-1.5 tracking-wider"
              htmlFor="password"
            >
              {t('password')}
            </label>
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
                autoComplete="new-password"
                placeholder="••••••••"
                required
                aria-invalid={!!state?.errors?.password}
                className="w-full h-12 pl-11 pr-11 rounded-xl bg-surface-container-lowest/90 border border-outline-variant/60 text-on-surface text-sm placeholder-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-outline hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
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

          {/* Submit */}
          <button
            type="submit"
            disabled={pending}
            className="w-full h-12 mt-2 rounded-xl bg-primary hover:bg-caramel-dark active:bg-caramel-dark text-white font-semibold text-[15px] flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all duration-150 active:scale-[0.985]"
          >
            <span className="material-symbols-outlined text-[20px]">
              how_to_reg
            </span>
            <span>{pending ? t('submitting') : t('submit')}</span>
          </button>
        </form>

        {/* Security footer */}
        <div className="mt-5 pt-3 flex items-center justify-center gap-2 text-[11px] text-secondary text-center border-t border-outline-variant/20">
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

        {/* Login link */}
        <div className="mt-4 text-center">
          <p className="text-[13px] text-on-surface-variant">
            {t('hasAccount')}{' '}
            <Link
              href="/login"
              className="text-primary hover:text-caramel-dark font-semibold hover:underline transition-colors"
            >
              {t('loginLink')}
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
