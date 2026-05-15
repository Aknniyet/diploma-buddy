import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const canSendEmail = Boolean(env.emailUser && env.emailPass && env.emailFrom);

const transporter = canSendEmail
  ? nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: env.emailUser,
        pass: env.emailPass,
      },
      tls: {
        family: 4,
        rejectUnauthorized: false,
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

export function isEmailConfigured() {
  return canSendEmail;
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

export async function sendNotificationEmail(to, { recipientName, title, description, actionUrl }) {
  await sendEmail({
    to,
    subject: `KazakhBuddy: ${title}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <h2 style="margin-bottom: 8px;">New notification</h2>
        <p style="margin-top: 0;">Hi${recipientName ? `, ${recipientName}` : ""}.</p>
        <div style="border: 1px solid #dbe8eb; border-radius: 14px; padding: 16px; background: #f8fcfd;">
          <p style="margin: 0 0 6px; font-size: 18px; font-weight: 600;">${title}</p>
          <p style="margin: 0; color: #4b5563;">${description}</p>
        </div>
        <p style="margin: 18px 0 0;">
          <a
            href="${actionUrl}"
            style="display: inline-block; background: #58a9b8; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 999px; font-weight: 600;"
          >
            Open KazakhBuddy
          </a>
        </p>
      </div>
    `,
  });
}
