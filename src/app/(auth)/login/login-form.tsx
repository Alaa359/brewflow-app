'use client';

import { useState, useRef, useCallback, useActionState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/actions/auth';
import { locales, type Locale } from '@/i18n/config';
import { setUserLocale } from '@/i18n/locale';

function IconMail({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function IconLock({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconEyeOpen({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeClosed({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
      <path d="m2 2 20 20" />
    </svg>
  );
}

function IconNfc({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 8.5a6.5 6.5 0 1 1 13 0" />
      <path d="M6 8.5a6.5 6.5 0 1 0 13 0" />
      <path d="M6 8.5a6.5 6.5 0 0 1 0 -7" />
    </svg>
  );
}

function IconFingerprint({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
      <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
      <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
      <path d="M2 12a10 10 0 0 1 18-6" />
      <path d="M2 16h.01" />
      <path d="M21.8 16c.2-2 .131-5.354 0-6" />
      <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
      <path d="M8.65 22c.21-.66.45-1.32.57-2" />
      <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
    </svg>
  );
}

function IconChevronLeft({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function IconLogin({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" x2="3" y1="12" y2="12" />
    </svg>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const t = useTranslations('Auth.login');
  const active = useLocale();
  const router = useRouter();
  const [langPending, startTransition] = useTransition();

  const passwordRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
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

  const handleLocale = useCallback(
    (locale: Locale) => {
      if (locale === active || langPending) return;
      startTransition(async () => {
        await setUserLocale(locale);
        router.refresh();
      });
    },
    [active, langPending, router]
  );

  const localeLabels: Record<Locale, string> = { fr: 'FR', en: 'EN', ar: 'AR' };

  return (
    <>
      <div className="w-full max-w-[1080px] rounded-3xl overflow-hidden my-auto shadow-2xl shadow-black/20 grid grid-cols-1 md:grid-cols-2">

        {/* LEFT PANEL — Image */}
        <div className="relative min-h-[420px] md:min-h-[680px] flex flex-col justify-between p-6 sm:p-8 text-white select-none overflow-hidden group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="BrewFlow Atelier"
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
            src="/login-atelier.jpg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50 z-10 transition-opacity duration-700 group-hover:opacity-70" />

          {/* Top badges */}
          <div className="relative z-20 flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[10px] uppercase tracking-wider text-white font-semibold">
              Selected Roasts
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="text-white/80 hover:text-white text-xs transition-colors"
                onClick={() => showToast("Authentification requise", "info")}
              >
                Atelier
              </button>
              <button
                type="button"
                className="px-3 py-1 rounded-full border border-white/40 hover:bg-white/20 text-white text-xs transition-all"
                onClick={() => showToast("Connexion à la station", "login")}
              >
                Réserve
              </button>
            </div>
          </div>

          {/* Center text */}
          <div className="relative z-20 my-auto py-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/30 backdrop-blur-md border border-amber-400/30 text-[10px] text-amber-200 uppercase tracking-wider mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping" />
              Extraction d&apos;Origine
            </span>
            <h2 className="text-3xl sm:text-4xl text-white font-bold tracking-tight leading-tight drop-shadow-lg">
              L&apos;Artisanat du<br />Café de Spécialité
            </h2>
            <p className="text-white/80 text-sm mt-3 line-clamp-2 max-w-sm drop-shadow-md leading-relaxed">
              Traçabilité des grains, profilage d&apos;extraction et gestion de
              caisse unifiée en temps réel.
            </p>
          </div>

          {/* Bottom profile */}
          <div className="relative z-20 flex items-center justify-between pt-4 border-t border-white/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Alaa Ameur"
                  className="w-11 h-11 rounded-full object-cover border-2 border-white/40 shadow-lg transition-transform duration-300 hover:scale-110"
                  src="/logo-brewflow.svg"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-surface rounded-full" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white tracking-tight">
                  Alaa Ameur
                </span>
                <span className="text-[11px] text-white/70">
                  Maître Torréfacteur &amp; Gérant
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Précédent"
                className="w-8 h-8 rounded-full border border-white/30 hover:border-white hover:bg-white/10 flex items-center justify-center text-white transition-all duration-200 active:scale-90 hover:scale-110"
                onClick={() => showToast("Profil précédent", "arrow_back")}
              >
                <IconChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="Suivant"
                className="w-8 h-8 rounded-full border border-white/30 hover:border-white hover:bg-white/10 flex items-center justify-center text-white transition-all duration-200 active:scale-90 hover:scale-110"
                onClick={() => showToast("Profil suivant", "arrow_forward")}
              >
                <IconChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — Form */}
        <div className="relative flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100">
          {/* Decorative corner glow */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-300/10 rounded-full blur-2xl pointer-events-none" />

          {/* Logo + language pills */}
          <div className="relative z-10 flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="BrewFlow"
                className="h-9 w-9 object-contain drop-shadow-sm"
                src="/logo-brewflow.svg"
              />
              <span className="text-lg font-bold tracking-tight text-stone-800 uppercase">
                BREWFLOW
              </span>
            </div>
            <div className="flex items-center bg-stone-200/60 rounded-full px-1.5 py-1 border border-stone-300/50">
              {locales.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => handleLocale(loc)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold transition-all ${
                    loc === active
                      ? 'bg-stone-800 text-white shadow-sm'
                      : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200/50'
                  }`}
                >
                  {localeLabels[loc]}
                </button>
              ))}
            </div>
          </div>

          {/* Heading + form */}
          <div className="relative z-10 text-center my-auto py-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-800">
              {t('title')}
            </h1>
            <p className="text-stone-500 text-sm sm:text-base mt-1.5">
              {t('description')}
            </p>

            <form action={action} className="space-y-3.5 max-w-sm mx-auto text-left mt-7">
              {/* Email */}
              <div>
                <label className="block text-[11px] uppercase text-stone-500 font-semibold mb-1.5 tracking-wider" htmlFor="email">
                  Email
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                    <IconMail className="w-[18px] h-[18px] text-stone-400" />
                  </div>
                  <input
                    ref={usernameRef}
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Entrez votre adresse mail"
                    required
                    aria-invalid={!!state?.errors?.email}
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-stone-200 text-stone-800 text-sm placeholder-stone-400/70 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 transition-all"
                  />
                </div>
                {state?.errors?.email?.map((e) => (
                  <p key={e} className="text-red-500 text-xs mt-1">{e}</p>
                ))}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] uppercase text-stone-500 font-semibold tracking-wider" htmlFor="password">
                    Mot de passe
                  </label>
                  <span className="text-[11px] text-amber-600 hover:text-amber-700 font-medium hover:underline transition-colors cursor-pointer">
                    Mot de passe oublié ?
                  </span>
                </div>
                <div className="relative rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                    <IconLock className="w-[18px] h-[18px] text-stone-400" />
                  </div>
                  <input
                    ref={passwordRef}
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••••"
                    required
                    aria-invalid={!!state?.errors?.password}
                    className="w-full h-11 pl-10 pr-10 rounded-xl bg-white border border-stone-200 text-stone-800 text-sm placeholder-stone-400/70 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 transition-all tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showPassword ? (
                      <IconEyeClosed className="w-5 h-5" />
                    ) : (
                      <IconEyeOpen className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {state?.errors?.password?.map((e) => (
                  <p key={e} className="text-red-500 text-xs mt-1">{e}</p>
                ))}
              </div>

              {/* Form errors */}
              {state?.errors?.form?.map((e) => (
                <p key={e} className="bg-red-50 text-red-600 rounded-xl px-3 py-2 text-xs border border-red-100">
                  {e}
                </p>
              ))}

              {/* Toggle remember */}
              <div className="flex items-center justify-between pt-1 select-none">
                <label className="text-xs text-stone-500 font-medium cursor-pointer">
                  Mémoriser cette station
                </label>
                <button
                  type="button"
                  role="switch"
                  aria-checked="true"
                  className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-amber-500 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:ring-offset-2 focus:ring-offset-white"
                >
                  <span className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out translate-x-4" />
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={pending}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 active:from-amber-800 active:to-amber-900 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 transition-all duration-150 active:scale-[0.985] cursor-pointer hover:shadow-xl hover:shadow-amber-600/30 hover:-translate-y-0.5"
              >
                <IconLogin className="w-[18px] h-[18px]" />
                <span>{pending ? t('submitting') : t('submit')}</span>
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5 max-w-sm mx-auto">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 px-3 text-[11px] text-stone-400 uppercase tracking-wider">
                  ou
                </span>
              </div>
            </div>

            {/* Quick login */}
            <div className="max-w-sm mx-auto">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="group/btn relative h-11 px-3 rounded-xl bg-white/60 hover:bg-white border border-stone-200/80 hover:border-amber-300/60 text-stone-600 flex items-center justify-center gap-2 text-[11px] font-medium transition-all duration-300 active:scale-95 hover:shadow-lg hover:shadow-amber-100/50 hover:-translate-y-0.5 overflow-hidden"
                  onClick={() => showToast("Badge #RFID-4091 scanné", "contactless", "text-amber-600")}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-50/0 via-amber-100/40 to-amber-50/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-out" />
                  <IconNfc className="w-4 h-4 text-amber-600 group-hover/btn:scale-110 transition-transform duration-300" />
                  <span className="relative z-10">Badge RFID / NFC</span>
                </button>
                <button
                  type="button"
                  className="group/btn relative h-11 px-3 rounded-xl bg-white/60 hover:bg-white border border-stone-200/80 hover:border-emerald-300/60 text-stone-600 flex items-center justify-center gap-2 text-[11px] font-medium transition-all duration-300 active:scale-95 hover:shadow-lg hover:shadow-emerald-100/50 hover:-translate-y-0.5 overflow-hidden"
                  onClick={() => showToast("Attente Touch ID / FIDO2...", "fingerprint", "text-emerald-600")}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/0 via-emerald-100/40 to-emerald-50/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-out" />
                  <IconFingerprint className="w-4 h-4 text-emerald-600 group-hover/btn:scale-110 transition-transform duration-300" />
                  <span className="relative z-10">Passkey / PIN</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 pt-5 border-t border-stone-200/60 text-center">
            <p className="text-[12px] text-stone-400">
              Besoin d&apos;un compte ?{' '}
              <span
                className="text-amber-600 font-semibold hover:text-amber-700 hover:underline cursor-pointer transition-colors"
                onClick={() => showToast("Contacter le gérant de succursale", "admin_panel_settings")}
              >
                Contacter l&apos;administrateur
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div
        ref={toastRef}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 translate-y-24 opacity-0 transition-all duration-300 pointer-events-none px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 bg-stone-800 text-white"
      >
        <span
          ref={toastIconRef}
          className="material-symbols-outlined text-amber-400 text-[22px]"
        >
          check_circle
        </span>
        <span ref={toastTextRef} className="text-[13px] font-medium" />
      </div>
    </>
  );
}
