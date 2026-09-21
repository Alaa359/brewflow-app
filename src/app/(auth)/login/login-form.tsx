'use client';

import { useState, useRef, useCallback, useActionState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/actions/auth';
import { locales, type Locale } from '@/i18n/config';
import { setUserLocale } from '@/i18n/locale';

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
        <div className="relative min-h-[420px] md:min-h-[680px] flex flex-col justify-between p-6 sm:p-8 text-white select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="BrewFlow Atelier"
            className="absolute inset-0 w-full h-full object-cover object-center"
            src="/login-atelier.jpg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50 z-10" />

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
                  alt="Ziyad Ben Amor"
                  className="w-11 h-11 rounded-full object-cover border-2 border-white/40 shadow-lg"
                  src="/logo-brewflow.svg"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-surface rounded-full" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white tracking-tight">
                  Ziyad Ben Amor
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
                className="w-8 h-8 rounded-full border border-white/30 hover:border-white hover:bg-white/10 flex items-center justify-center text-white transition-all active:scale-90"
                onClick={() => showToast("Profil précédent", "arrow_back")}
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <button
                type="button"
                aria-label="Suivant"
                className="w-8 h-8 rounded-full border border-white/30 hover:border-white hover:bg-white/10 flex items-center justify-center text-white transition-all active:scale-90"
                onClick={() => showToast("Profil suivant", "arrow_forward")}
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
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
                    <span className="material-symbols-outlined text-stone-400 text-[18px]">
                      alternate_email
                    </span>
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
                    <span className="material-symbols-outlined text-stone-400 text-[18px]">
                      lock
                    </span>
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
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
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

              <button
                type="submit"
                disabled={pending}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 active:from-amber-800 active:to-amber-900 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 transition-all duration-150 active:scale-[0.985] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  login
                </span>
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
            <div className="max-w-sm mx-auto space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="h-9 px-2.5 rounded-lg bg-white hover:bg-stone-50 border border-stone-200 text-stone-600 flex items-center justify-center gap-1.5 text-[11px] font-medium transition-all active:scale-95"
                  onClick={() => showToast("Badge #RFID-4091 scanné", "contactless", "text-amber-600")}
                >
                  <span className="material-symbols-outlined text-[16px] text-amber-600">
                    contactless
                  </span>
                  <span>Badge RFID / NFC</span>
                </button>
                <button
                  type="button"
                  className="h-9 px-2.5 rounded-lg bg-white hover:bg-stone-50 border border-stone-200 text-stone-600 flex items-center justify-center gap-1.5 text-[11px] font-medium transition-all active:scale-95"
                  onClick={() => showToast("Attente Touch ID / FIDO2...", "fingerprint", "text-emerald-600")}
                >
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">
                    fingerprint
                  </span>
                  <span>Passkey / PIN</span>
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
