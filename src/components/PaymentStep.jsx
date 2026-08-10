import { useMemo, useRef, useState } from "react";
import NeonButton from "./NeonButton";

const DEMO_AMOUNT_INR = 299;

function buildQrUrl(event) {
  // Plain text, not a upi:// payment intent — this is a demo QR for a site
  // with no real payment gateway wired up, so it must never look like a
  // functioning payment link if scanned by a real wallet app.
  const payload = [
    "GATEWAYS 2026 — DEMO PAYMENT",
    `Event: ${event.title}`,
    `Amount: INR ${DEMO_AMOUNT_INR}`,
    "This is a mock QR for demo purposes only.",
  ].join("\n");
  const params = new URLSearchParams({ size: "220x220", data: payload, margin: "10" });
  return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;
}

export default function PaymentStep({ event, onBack, onContinue, submitting = false, submitError = null }) {
  const [txnId, setTxnId] = useState("");
  const [confirmTxnId, setConfirmTxnId] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [fileError, setFileError] = useState(null);
  const fileRef = useRef(null);

  const qrUrl = useMemo(() => buildQrUrl(event), [event]);

  const trimmedId = txnId.trim();
  const trimmedConfirm = confirmTxnId.trim();
  const idsMatch = trimmedId.length > 0 && trimmedId === trimmedConfirm;
  const mismatch = trimmedConfirm.length > 0 && !idsMatch;
  const canContinue = idsMatch && !!screenshot;

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFileError("Upload an image file.");
      return;
    }
    setFileError(null);
    const reader = new FileReader();
    reader.onload = () => setScreenshot({ name: file.name, dataUrl: reader.result });
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <button
        onClick={onBack}
        data-cursor-hover
        className="mb-4 flex w-fit items-center gap-1 text-xs tracking-widest text-white/50 uppercase hover:text-white"
      >
        ← Back
      </button>

      <h3 className="mb-1 font-display text-2xl font-bold text-white">Demo Payment</h3>
      <p className="mb-4 text-xs text-white/40">
        No real payment gateway is wired up yet — scan for show, then fill in the mock details below.
      </p>

      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/5 p-4 text-center sm:flex-row sm:items-start sm:text-left">
        <img
          src={qrUrl}
          alt="Demo payment QR code"
          width={140}
          height={140}
          className="mx-auto rounded-lg bg-white p-2 sm:mx-0"
        />
        <div>
          <p className="font-display text-lg text-white">₹{DEMO_AMOUNT_INR}.00</p>
          <p className="text-xs text-white/50">Entry fee for {event.title}</p>
          <p className="mt-2 text-[11px] text-white/30">Demo QR only — no real transaction is made.</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <div>
          <label htmlFor="txn-id" className="mb-1 block text-xs tracking-widest text-white/50 uppercase">
            Transaction ID
          </label>
          <input
            id="txn-id"
            type="text"
            value={txnId}
            onChange={(e) => setTxnId(e.target.value)}
            placeholder="e.g. T2409231045..."
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none focus:border-cyan"
          />
        </div>

        <div>
          <label htmlFor="txn-screenshot" className="mb-1 block text-xs tracking-widest text-white/50 uppercase">
            Payment Screenshot
          </label>
          <input
            id="txn-screenshot"
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onFile}
            className="block w-full text-xs text-white/60 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:text-white file:uppercase file:tracking-widest hover:file:bg-white/20"
          />
          {fileError && <p className="mt-1 text-xs text-magenta">{fileError}</p>}
          {screenshot && (
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2">
              <img src={screenshot.dataUrl} alt="Uploaded payment screenshot preview" className="h-14 w-14 rounded-lg object-cover" />
              <p className="truncate text-xs text-white/60">{screenshot.name}</p>
            </div>
          )}
        </div>

        {screenshot && (
          <div>
            <label htmlFor="txn-confirm" className="mb-1 block text-xs tracking-widest text-white/50 uppercase">
              Confirm Transaction ID
            </label>
            <input
              id="txn-confirm"
              type="text"
              value={confirmTxnId}
              onChange={(e) => setConfirmTxnId(e.target.value)}
              placeholder="Re-enter the transaction ID from the screenshot"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none focus:border-cyan"
            />
            {mismatch && <p className="mt-1 text-xs text-magenta">Doesn't match the transaction ID above.</p>}
            {idsMatch && <p className="mt-1 text-xs text-emerald">✓ Transaction ID confirmed</p>}
          </div>
        )}

        {submitError && <p className="text-xs text-magenta">{submitError}</p>}

        <NeonButton
          variant="primary"
          disabled={!canContinue || submitting}
          onClick={() => onContinue({ txnId: trimmedId, screenshot })}
        >
          {submitting ? "Confirming…" : canContinue ? "Confirm & Continue" : "Complete Payment Details"}
        </NeonButton>
      </div>
    </div>
  );
}
