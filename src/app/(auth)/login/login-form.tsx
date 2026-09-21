'use client';

import { useActionState, useRef, useCallback, useEffect, useState } from 'react';
import { login } from '@/actions/auth';
import {
  Mail, Lock, Eye, EyeOff, LogIn, Fingerprint, Nfc,
  KeyRound, ShieldCheck, Store, Clock, HeadphonesIcon, LockKeyhole,
  CheckCircle2,
} from 'lucide-react';

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{ message: string; icon: React.ReactNode; visible: boolean }>({
    message: '',
    icon: null,
    visible: false,
  });
  const [clock, setClock] = useState('--:--:--');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, icon: React.ReactNode) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, icon, visible: true });
    toastTimer.current = setTimeout(() => setToast((p) => ({ ...p, visible: false })), 2800);
  }, []);

  const simulateNfc = useCallback(() => {
    showToast('Badge Barista #RFID-4091 scanné', <Nfc className="size-5 text-caramel" />);
    setTimeout(() => showToast('Session Barista ouverte ✓', <CheckCircle2 className="size-5 text-tertiary" />), 1200);
  }, [showToast]);

  const triggerPasskey = useCallback(() => {
    showToast('Attente Touch ID / Passkey FIDO2…', <Fingerprint className="size-5 text-caramel" />);
    setTimeout(() => showToast('WebAuthn validée ✓', <CheckCircle2 className="size-5 text-tertiary" />), 1100);
  }, [showToast]);

  const quickPin = useCallback(() => {
    showToast('Clavier virtuel PIN…', <KeyRound className="size-5 text-caramel" />);
  }, [showToast]);

  const forgotPassword = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    showToast('Lien de réinitialisation envoyé au gérant.', <Mail className="size-5 text-caramel" />);
  }, [showToast]);

  useEffect(() => {
    function tick() {
      const now = new Date();
      setClock(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative z-10 w-full max-w-[540px]">
      {/* ── Glass card ── */}
      <div className="glass-panel rounded-2xl p-8 sm:p-11 shadow-2xl border border-caramel/20 shadow-caramel/10">
        {/* ── Brand header ── */}
        <div className="text-center flex flex-col items-center mb-6">
          <div className="relative group mb-3">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-caramel/30 via-caramel/20 to-tertiary/20 opacity-60 blur-md transition group-hover:opacity-90" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="BrewFlow Logo"
              className="relative w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-xl rounded-full"
              src="/logo-brewflow.svg"
            />
          </div>
          <h1 className="font-heading text-[26px] sm:text-[30px] font-bold tracking-tight text-espresso leading-tight">
            BrewFlow
          </h1>
          <p className="font-body text-[13px] text-espresso/60 font-medium tracking-wide mt-0.5">
            Specialty Coffee &amp; Hospitality OS
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-caramel/10 border border-caramel/20 mt-3">
            <Store className="size-3.5 text-caramel" />
            <span className="font-label text-[11px] uppercase tracking-wider text-espresso/60 font-semibold">
              Succursale La Marsa · Terminal Sécurisé
            </span>
          </div>
        </div>

        {/* ── Form ── */}
        <form action={action} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block font-label text-[11px] uppercase text-espresso/60 font-semibold mb-1.5" htmlFor="email">
              Identifiant, Email ou Matricule
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                <Mail className="size-5 text-espresso/40" />
              </div>
              <input
                ref={usernameRef}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue="admin@brewflow.tn"
                placeholder="nom@brewflow.tn ou BARISTA-01"
                required
                aria-invalid={!!state?.errors?.email}
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-white border border-caramel/20 text-espresso font-body text-sm placeholder-espresso/40 focus:outline-none focus:ring-2 focus:ring-caramel focus:border-transparent transition-all"
              />
            </div>
            {state?.errors?.email?.map((e) => (
              <p key={e} className="text-red-500 text-xs mt-1">{e}</p>
            ))}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-label text-[11px] uppercase text-espresso/60 font-semibold" htmlFor="password">
                Mot de passe
              </label>
              <button
                type="button"
                onClick={forgotPassword}
                className="font-body text-[12px] text-caramel hover:text-caramelDark font-medium hover:underline transition-colors"
              >
                Mot de passe oublié ?
              </button>
            </div>
            <div className="relative rounded-xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                <Lock className="size-5 text-espresso/40" />
              </div>
              <input
                ref={passwordRef}
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                defaultValue="password123"
                placeholder="••••••••••••"
                required
                aria-invalid={!!state?.errors?.password}
                className="w-full h-12 pl-11 pr-11 rounded-xl bg-white border border-caramel/20 text-espresso font-body text-sm placeholder-espresso/40 focus:outline-none focus:ring-2 focus:ring-caramel focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-espresso/40 hover:text-espresso transition-colors"
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
            {state?.errors?.password?.map((e) => (
              <p key={e} className="text-red-500 text-xs mt-1">{e}</p>
            ))}
          </div>

          {state?.errors?.form?.map((e) => (
            <p key={e} className="bg-red-50 text-red-600 rounded-lg px-3 py-2 text-xs border border-red-200">{e}</p>
          ))}

          {/* Remember me */}
          <div className="flex items-center gap-2.5 pt-1">
            <input
              id="rememberMe"
              type="checkbox"
              defaultChecked
              className="w-4 h-4 rounded border-caramel/40 text-caramel focus:ring-caramel focus:ring-offset-0"
            />
            <span className="font-body text-[13px] text-espresso/70 font-medium">Mémoriser cette station</span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={pending}
            className="w-full h-12 mt-2 rounded-xl bg-caramel hover:bg-caramelDark active:bg-caramelDark active:scale-[0.985] text-white font-heading text-[15px] font-semibold flex items-center justify-center gap-2 shadow-lg shadow-caramel/20 transition-all duration-150 disabled:opacity-50"
          >
            <LogIn className="size-5" />
            <span>{pending ? 'Connexion…' : 'Se connecter'}</span>
          </button>
        </form>

        {/* ── Divider ── */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-caramel/20" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-softSand px-3 py-0.5 rounded-full font-label text-[10px] uppercase text-espresso/60 font-semibold tracking-wider">
              Ou connexion rapide par
            </span>
          </div>
        </div>

        {/* ── Quick login buttons ── */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={simulateNfc}
            className="h-11 px-3 rounded-xl bg-softSand hover:bg-caramel/10 border border-caramel/20 text-espresso flex items-center justify-center gap-2 text-[12px] font-medium transition-all active:scale-95 group shadow-sm"
          >
            <Nfc className="size-[19px] text-caramel group-hover:scale-110 transition-transform" />
            <span className="font-heading text-[12px]">Badge RFID / NFC</span>
          </button>
          <button
            type="button"
            onClick={triggerPasskey}
            className="h-11 px-3 rounded-xl bg-softSand hover:bg-caramel/10 border border-caramel/20 text-espresso flex items-center justify-center gap-2 text-[12px] font-medium transition-all active:scale-95 group shadow-sm"
          >
            <Fingerprint className="size-[19px] text-tertiary group-hover:scale-110 transition-transform" />
            <span className="font-heading text-[12px]">Passkey / FIDO2</span>
          </button>
        </div>

        {/* ── PIN mode ── */}
        <div className="mt-4 pt-3 text-center border-t border-caramel/15">
          <button
            type="button"
            onClick={quickPin}
            className="inline-flex items-center gap-1.5 text-caramel hover:text-caramelDark font-heading text-[12px] font-semibold transition-colors"
          >
            <KeyRound className="size-4" />
            <span>Mode PIN rapide pour Barista en service</span>
          </button>
        </div>

        {/* ── Security notice ── */}
        <div className="mt-4 pt-3 flex items-center justify-center gap-2 text-[11px] text-espresso/50 font-body text-center border-t border-caramel/10">
          <ShieldCheck className="size-3.5 text-tertiary" />
          <span>Chiffrement SSL SHA-256 · Conforme Décret 2018-56 Caisses</span>
        </div>
      </div>

      {/* ── Demo credentials ── */}
      <div className="mt-4 text-center text-espresso/50 w-full rounded-xl border border-caramel/15 p-3 text-xs bg-white/50 backdrop-blur-sm">
        <p className="font-medium text-espresso/70 mb-1">Comptes de démonstration</p>
        <p dir="ltr" className="font-mono text-[11px]">
          admin@brewflow.tn · serveur@brewflow.tn · cuisinier@brewflow.tn
        </p>
        <p className="mt-0.5">Mot de passe : password123</p>
      </div>

      {/* ── Toast ── */}
      <div
        className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 pointer-events-none px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 bg-espresso text-warmCream ${
          toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
        }`}
      >
        {toast.icon}
        <span className="font-heading text-[13px]">{toast.message}</span>
      </div>

      {/* ── Footer ── */}
      <div className="mt-6 w-full py-3 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] text-espresso/50">
          <div className="flex items-center gap-2">
            <span className="font-label text-[10px] uppercase tracking-wider text-espresso/40">
              BrewFlow OS v4.2
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-mono text-[11px] text-espresso/40">
              <Clock className="size-3.5" />
              {clock} (Tunis UTC+1)
            </span>
            <span className="text-caramel/30">·</span>
            <button
              type="button"
              onClick={() => showToast('Assistance : +216 71 000 888', <HeadphonesIcon className="size-5 text-caramel" />)}
              className="hover:text-caramel transition-colors cursor-pointer"
            >
              Support
            </button>
            <span className="text-caramel/30">·</span>
            <button
              type="button"
              onClick={() => showToast('Terminal POS sécurisé certifié NF-525', <LockKeyhole className="size-5 text-tertiary" />)}
              className="hover:text-caramel transition-colors cursor-pointer"
            >
              Sécurité
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
