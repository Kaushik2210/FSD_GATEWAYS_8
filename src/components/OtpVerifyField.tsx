import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { requestOtp, checkOtp } from "../lib/otp";

const VERIFY_MESSAGES = {
  expired: "That code expired — send a new one.",
  mismatch: "That code doesn't match.",
  not_found: "Send a code first.",
};

export default function OtpVerifyField({
  id,
  label,
  type, // "email" | "tel"
  value,
  onChange,
  placeholder,
  autoComplete,
  formatError,
  verifiedValue,
  onVerifiedValue,
}) {
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [demoCode, setDemoCode] = useState(null);
  const [delivered, setDelivered] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [verifyError, setVerifyError] = useState(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const rowRef = useRef(null);

  const isVerified = Boolean(value) && value === verifiedValue;
  const key = `${type}:${value.trim().toLowerCase()}`;

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const sendCode = async () => {
    if (formatError || !value || sending || cooldown > 0) return;
    setSending(true);
    setSendError(null);
    setVerifyError(null);
    try {
      const { code: freshCode, resendCooldownS, delivered: wasDelivered } = await requestOtp(key);
      setDemoCode(freshCode ?? null);
      setDelivered(Boolean(wasDelivered));
      setSent(true);
      setCode("");
      setCooldown(resendCooldownS);
      gsap.fromTo(rowRef.current, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
    } catch (err) {
      if (err.status === 429 && err.data?.cooldownRemainingS) {
        setCooldown(err.data.cooldownRemainingS);
      }
      setSendError("Couldn't send a code — try again.");
    } finally {
      setSending(false);
    }
  };

  const checkCode = async () => {
    if (!code || verifying) return;
    setVerifying(true);
    setVerifyError(null);
    let result;
    try {
      result = await checkOtp(key, code);
    } catch {
      result = null;
    }
    if (result === "ok") {
      onVerifiedValue(value);
      setSent(false);
      setCode("");
      setDemoCode(null);
    } else {
      setVerifyError(VERIFY_MESSAGES[result] || "Something went wrong.");
      gsap.fromTo(rowRef.current, { x: -6 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.4)" });
    }
    setVerifying(false);
  };

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs tracking-widest text-white/50 uppercase">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          value={value}
          disabled={isVerified}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none focus:border-cyan disabled:opacity-60"
          placeholder={placeholder}
        />
        {!isVerified && (
          <button
            type="button"
            data-cursor-hover
            onClick={sendCode}
            disabled={!!formatError || !value || sending || cooldown > 0}
            className="shrink-0 rounded-xl border border-cyan/50 px-3 text-xs font-display tracking-widest text-cyan uppercase disabled:opacity-40"
          >
            {sending ? "…" : cooldown > 0 ? `${cooldown}s` : sent ? "Resend" : "Send OTP"}
          </button>
        )}
      </div>
      {formatError && value && <p className="mt-1 text-xs text-magenta">{formatError}</p>}
      {sendError && <p className="mt-1 text-xs text-magenta">{sendError}</p>}

      {isVerified && (
        <p className="mt-1 flex items-center gap-1 text-xs text-emerald">
          <span aria-hidden="true">✓</span> Verified
        </p>
      )}

      {!isVerified && sent && (
        <div ref={rowRef} className="mt-2 rounded-xl border border-dashed border-cyan/40 bg-cyan/5 p-3">
          <p className="text-[11px] text-white/50">
            {delivered ? (
              <>Code sent to your {type === "email" ? "email" : "phone"} — check your {type === "email" ? "inbox" : "texts"}.</>
            ) : (
              <>
                Demo mode — {type === "email" ? "email" : "SMS"} delivery isn't configured on this deployment, so
                here's the code instead of a real {type === "email" ? "email" : "text"}:{" "}
                <span className="font-display tracking-[0.2em] text-cyan">{demoCode}</span>
              </>
            )}
          </p>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="6-digit code"
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm tracking-[0.3em] text-white outline-none focus:border-cyan"
            />
            <button
              type="button"
              data-cursor-hover
              onClick={checkCode}
              disabled={code.length !== 6 || verifying}
              className="shrink-0 rounded-lg bg-gradient-to-r from-cyan to-purple px-3 text-xs font-display tracking-widest text-black uppercase disabled:opacity-40"
            >
              Verify
            </button>
          </div>
          {verifyError && <p className="mt-1 text-xs text-magenta">{verifyError}</p>}
        </div>
      )}
    </div>
  );
}
