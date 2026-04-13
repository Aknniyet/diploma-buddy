import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const canSendEmail = Boolean(env.emailUser && env.emailPass && env.emailFrom);

const transporter = canSendEmail
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: env.emailUser,
        pass: env.emailPass,
      },
    })
  : null;

async function sendEmail({ to, subject, html }) {
  if (!transporter) {
    throw new Error(
      "Email sending is not configured. Set EMAIL_USER, EMAIL_PASS and EMAIL_FROM."
    );
  }

  await transporter.sendMail({
    from: env.emailFrom,
    to,
    subject,
    html,
  });
}

export async function sendVerificationEmail(to, code) {
  await sendEmail({
    to,
    subject: "KazakhBuddy verification code",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Verify your email</h2>
        <p>Your KazakhBuddy verification code is:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</p>
        <p>The code will expire in 10 minutes.</p>
      </div>
    `,
  });
}

export async function sendResetEmail(to, code) {
  await sendEmail({
    to,
    subject: "KazakhBuddy password reset code",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Reset your password</h2>
        <p>Your KazakhBuddy password reset code is:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</p>
        <p>The code will expire in 10 minutes.</p>
      </div>
    `,
  });
}
