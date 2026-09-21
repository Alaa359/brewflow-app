'use client';

import { useState, useRef, useCallback, useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
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
      <div className="w-full max-w-5xl rounded-[32px] p-3 sm:p-4 glass-panel border border-outline-variant/40 shadow-2xl shadow-primary/10 grid grid-cols-1 md:grid-cols-12 gap-4 my-auto">

        {/* LEFT PANEL — Image */}
        <div
          className="relative rounded-[26px] overflow-hidden min-h-[380px] md:min-h-[640px] flex flex-col justify-between p-6 sm:p-7 text-white shadow-xl group select-none md:col-span-6"
          style={{ clipPath: 'polygon(0px 0px, 100% 0px, 88% 100%, 0px 100%)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="BrewFlow Atelier"
            className="absolute inset-0 w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
            src="/login-atelier.jpg"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-black/90 z-10" />

          {/* Top badges */}
          <div className="relative z-20 flex items-center justify-between gap-2">
            <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] uppercase tracking-wider text-white/90 font-semibold">
              Selected Roasts
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="text-white/80 hover:text-white text-xs transition-colors"
                onClick={() => showToast("Authentification requise pour cette action", "info")}
              >
                Atelier
              </button>
              <button
                type="button"
                className="px-3 py-1 rounded-full border border-white/40 hover:bg-white/20 text-white text-xs transition-all"
                onClick={() => showToast("Connexion à la station BrewFlow", "login")}
              >
                Réserve
              </button>
            </div>
          </div>

          {/* Center text */}
          <div className="relative z-20 my-auto text-left py-6">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/40 backdrop-blur-md border border-primary-fixed/30 text-[10px] text-primary-fixed uppercase tracking-wider mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed animate-ping" />
              Extraction d&apos;Origine
            </span>
            <h2 className="text-2xl sm:text-3xl text-white font-bold tracking-tight drop-shadow-md leading-tight">
              L&apos;Artisanat du Café de Spécialité
            </h2>
            <p className="text-white/75 text-xs sm:text-sm mt-2 line-clamp-2 max-w-xs drop-shadow-sm">
              Traçabilité des grains, profilage d&apos;extraction et gestion de
              caisse unifiée en temps réel.
            </p>
          </div>

          {/* Bottom profile */}
          <div className="relative z-20 flex items-end justify-between pt-4 border-t border-white/15">
            <div className="flex items-center gap-3">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Ziyad Ben Amor"
                  className="w-11 h-11 rounded-full object-cover border-2 border-primary-fixed/70 shadow-md"
                  src="/logo-brewflow.svg"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-tertiary-container border-2 border-surface rounded-full" />
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
        <div className="flex flex-col justify-between p-4 sm:p-8 lg:p-10 bg-white/70 rounded-[26px] md:col-span-6">
          {/* Logo + language pills */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="BrewFlow"
                className="h-9 w-9 object-contain drop-shadow-sm"
                src="/logo-brewflow.svg"
              />
              <span className="text-lg font-bold tracking-tight text-on-surface uppercase">
                BREWFLOW
              </span>
            </div>
            <div className="flex items-center bg-surface-container-low/90 rounded-full px-1.5 py-1 border border-outline-variant/40 shadow-sm">
              {locales.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => handleLocale(loc)}
                  className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold transition-colors ${
                    loc === active
                      ? 'bg-surface-container-highest text-on-surface shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {localeLabels[loc]}
                </button>
              ))}
            </div>
          </div>

          {/* Heading + form */}
          <div className="text-center my-auto py-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-on-surface">
              {t('title')}
            </h1>
            <p className="text-secondary text-sm sm:text-base mt-1">
              {t('description')}
            </p>

            <form action={action} className="space-y-4 max-w-sm mx-auto text-left mt-6">
              {/* Email */}
              <div>
                <div className="relative rounded-xl shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                    <span className="material-symbols-outlined text-outline text-[18px]">
                      alternate_email
                    </span>
                  </div>
                  <input
                    ref={usernameRef}
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Email ou matricule barista"
                    required
                    aria-invalid={!!state?.errors?.email}
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60 text-on-surface text-sm placeholder-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    defaultValue="ziyad@brewflow.tn"
                  />
                </div>
                {state?.errors?.email?.map((e) => (
                  <p key={e} className="text-destructive text-xs mt-1">{e}</p>
                ))}
              </div>

              {/* Password */}
              <div>
                <div className="relative rounded-xl shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                    <span className="material-symbols-outlined text-outline text-[18px]">
                      lock
                    </span>
                  </div>
                  <input
                    ref={passwordRef}
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Mot de passe"
                    required
                    aria-invalid={!!state?.errors?.password}
                    className="w-full h-11 pl-10 pr-10 rounded-xl bg-surface-container-lowest border border-outline-variant/60 text-on-surface text-sm placeholder-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {state?.errors?.password?.map((e) => (
                  <p key={e} className="text-destructive text-xs mt-1">{e}</p>
                ))}
                <div className="text-right mt-1.5">
                  <span className="text-[11px] text-primary hover:text-caramel-dark font-medium hover:underline transition-colors cursor-pointer">
                    Mot de passe oublié ?
                  </span>
                </div>
              </div>

              {/* Form errors */}
              {state?.errors?.form?.map((e) => (
                <p key={e} className="bg-destructive/10 text-destructive rounded-xl px-3 py-2 text-xs">
                  {e}
                </p>
              ))}

              {/* Remember */}
              <div className="flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-outline-variant/80 text-primary focus:ring-primary focus:ring-offset-0 transition-colors"
                />
                <label className="text-xs text-on-surface-variant font-medium cursor-pointer">
                  Mémoriser cette station de caisse
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={pending}
                className="w-full h-11 rounded-xl bg-primary hover:bg-caramel-dark active:bg-caramel-dark text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all duration-150 active:scale-[0.985] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  login
                </span>
                <span>{pending ? t('submitting') : t('submit')}</span>
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4 max-w-sm mx-auto">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/40" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-[11px] text-secondary">
                  ou
                </span>
              </div>
            </div>

            {/* Quick login */}
            <div className="max-w-sm mx-auto space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="h-9 px-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/40 text-on-surface flex items-center justify-center gap-1.5 text-[11px] font-medium transition-all active:scale-95"
                  onClick={() => showToast("Badge #RFID-4091 scanné", "contactless", "text-primary")}
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    contactless
                  </span>
                  <span>Badge RFID / NFC</span>
                </button>
                <button
                  type="button"
                  className="h-9 px-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/40 text-on-surface flex items-center justify-center gap-1.5 text-[11px] font-medium transition-all active:scale-95"
                  onClick={() => showToast("Attente Touch ID / FIDO2...", "fingerprint", "text-tertiary")}
                >
                  <span className="material-symbols-outlined text-[16px] text-tertiary">
                    fingerprint
                  </span>
                  <span>Passkey / PIN</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <p className="text-[12px] text-secondary">
              Besoin d&apos;un compte ?{' '}
              <span
                className="text-primary font-semibold hover:underline cursor-pointer"
                onClick={() => showToast("Contacter le gérant de succursale", "admin_panel_settings")}
              >
                Contacter l&apos;administrateur
              </span>
            </p>
            <div className="flex items-center gap-3 text-secondary/70">
              <button
                type="button"
                className="hover:text-primary transition-colors"
                onClick={() => showToast("Certifié Décret 2018-56", "verified_user")}
                title="Sécurité"
              >
                <span className="material-symbols-outlined text-[17px]">verified_user</span>
              </button>
              <button
                type="button"
                className="hover:text-primary transition-colors"
                onClick={() => showToast("Support BrewFlow : 71 000 888", "support")}
                title="Support"
              >
                <span className="material-symbols-outlined text-[17px]">headset_mic</span>
              </button>
              <button
                type="button"
                className="hover:text-primary transition-colors"
                onClick={() => showToast("Succursale La Marsa", "storefront")}
                title="Succursale"
              >
                <span className="material-symbols-outlined text-[17px]">storefront</span>
              </button>
            </div>
          </div>
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
