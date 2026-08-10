import { useRef, useState } from "react";
import gsap from "gsap";
import NeonButton from "./NeonButton";
import OtpVerifyField from "./OtpVerifyField";
import PaymentStep from "./PaymentStep";
import { apiPost } from "../lib/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\d{10}$/;

export default function RegistrationWizard({ event, onSuccess }) {
  const [step, setStep] = useState("details"); // details | payment
  const [values, setValues] = useState({ name: "", college: "", course: "", email: "", phone: "" });
  const [verifiedEmail, setVerifiedEmail] = useState(null);
  const [touched, setTouched] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef(null);

  const setField = (key) => (val) => setValues((v) => ({ ...v, [key]: typeof val === "string" ? val : val.target.value }));

  const emailFormatError = values.email && !EMAIL_RE.test(values.email.trim()) ? "Enter a valid email." : null;
  const phoneFormatError = values.phone && !PHONE_RE.test(values.phone.trim()) ? "Enter a 10-digit number." : null;

  const nameOk = values.name.trim().length > 0;
  const collegeOk = values.college.trim().length > 0;
  const courseOk = values.course.trim().length > 0;
  const emailOk = values.email === verifiedEmail;
  const phoneOk = PHONE_RE.test(values.phone.trim());
  const canContinue = nameOk && collegeOk && courseOk && emailOk && phoneOk;

  const goToPayment = () => {
    if (!canContinue) {
      setTouched(true);
      gsap.fromTo(formRef.current, { x: -6 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.4)" });
      return;
    }
    setStep("payment");
  };

  const finishRegistration = async ({ txnId, screenshot }) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const registration = await apiPost("/registrations", {
        eventId: event.id,
        ...values,
        txnId,
        screenshotName: screenshot?.name,
      });
      onSuccess({ ...values, ticket: registration.ticket, txnId, screenshotName: screenshot?.name });
    } catch {
      setSubmitError("Couldn't confirm your registration — try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "payment") {
    return (
      <PaymentStep
        event={event}
        onBack={() => setStep("details")}
        onContinue={finishRegistration}
        submitting={submitting}
        submitError={submitError}
      />
    );
  }

  return (
    <div ref={formRef} className="flex flex-col gap-4">
      <div>
        <label htmlFor="reg-name" className="mb-1 block text-xs tracking-widest text-white/50 uppercase">
          Name
        </label>
        <input
          id="reg-name"
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={setField("name")}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none focus:border-cyan"
          placeholder="Your name"
        />
        {touched && !nameOk && <p className="mt-1 text-xs text-magenta">Enter your name.</p>}
      </div>

      <div>
        <label htmlFor="reg-college" className="mb-1 block text-xs tracking-widest text-white/50 uppercase">
          College
        </label>
        <input
          id="reg-college"
          type="text"
          autoComplete="organization"
          value={values.college}
          onChange={setField("college")}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none focus:border-cyan"
          placeholder="Your college"
        />
        {touched && !collegeOk && <p className="mt-1 text-xs text-magenta">Enter your college.</p>}
      </div>

      <div>
        <label htmlFor="reg-course" className="mb-1 block text-xs tracking-widest text-white/50 uppercase">
          Course
        </label>
        <input
          id="reg-course"
          type="text"
          value={values.course}
          onChange={setField("course")}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none focus:border-cyan"
          placeholder="e.g. B.Tech CSE"
        />
        {touched && !courseOk && <p className="mt-1 text-xs text-magenta">Enter your course.</p>}
      </div>

      <OtpVerifyField
        id="reg-email"
        label="Email"
        type="email"
        autoComplete="email"
        value={values.email}
        onChange={setField("email")}
        placeholder="you@campus.edu"
        formatError={emailFormatError}
        verifiedValue={verifiedEmail}
        onVerifiedValue={setVerifiedEmail}
      />

      <div>
        <label htmlFor="reg-phone" className="mb-1 block text-xs tracking-widest text-white/50 uppercase">
          Phone
        </label>
        <input
          id="reg-phone"
          type="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={setField("phone")}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none focus:border-cyan"
          placeholder="10-digit mobile number"
        />
        {phoneFormatError && values.phone && <p className="mt-1 text-xs text-magenta">{phoneFormatError}</p>}
        {touched && !phoneOk && !values.phone && <p className="mt-1 text-xs text-magenta">Enter your phone number.</p>}
      </div>

      {touched && !canContinue && (nameOk && collegeOk && courseOk && phoneOk) && (
        <p className="text-xs text-magenta">Verify your email to continue.</p>
      )}

      <NeonButton variant="primary" onClick={goToPayment}>
        Continue to Payment
      </NeonButton>
    </div>
  );
}
