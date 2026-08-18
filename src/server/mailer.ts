import nodemailer from "nodemailer";

let transporter = null;
let attempted = false;

function getTransporter() {
  if (attempted) return transporter;
  attempted = true;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

export function isEmailConfigured() {
  return Boolean(getTransporter());
}

export async function sendOtpEmail(to, code) {
  const t = getTransporter();
  if (!t) return { delivered: false };
  await t.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "Your Gateways verification code",
    text: `Your Gateways verification code is ${code}. It expires in 90 seconds.`,
    html: `<p>Your Gateways verification code is <b style="font-size:20px;letter-spacing:4px">${code}</b>.</p><p>It expires in 90 seconds.</p>`,
  });
  return { delivered: true };
}
