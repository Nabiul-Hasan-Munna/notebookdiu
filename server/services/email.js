import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_APP_PASSWORD?.replace(/\s/g, ""),
  },
});

export async function sendVerificationEmail(email, code, name) {
  if (!process.env.SMTP_USER || !process.env.SMTP_APP_PASSWORD) {
    throw new Error("Gmail SMTP credentials are not configured.");
  }

  await transporter.sendMail({
    from: `"UniverseDIU" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Verify your UniverseDIU account",
    text: `Hello ${name},

Your UniverseDIU verification code is: ${code}

This code expires in 10 minutes.

If you did not request this registration, ignore this email.

UniverseDIU Team`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:28px;color:#1e293b">
        <h2 style="color:#2563eb">Welcome to UniverseDIU!</h2>
        <p>Hello ${String(name).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c])},</p>
        <p>Use this verification code to complete your registration:</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;padding:18px;background:#eff6ff;text-align:center;border-radius:12px;color:#1d4ed8">
          ${code}
        </div>
        <p>This code expires in <strong>10 minutes</strong>.</p>
        <p style="color:#64748b;font-size:12px">If you did not request this registration, ignore this email.</p>
        <hr style="border:0;border-top:1px solid #e2e8f0">
        <p style="font-weight:bold">UniverseDIU Team</p>
      </div>
    `,
  });
}
