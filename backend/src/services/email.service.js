import { Resend } from "resend";

export const sendVerificationOTP = async (email, name, otp) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verify your email",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2>Verify your account</h2>

        <p>Hello ${name},</p>

        <p>Use the following OTP to verify your email address.</p>

        <div style="font-size: 30px; font-weight: bold; letter-spacing: 6px; text-align: center; margin: 24px 0;">
          ${otp}
        </div>

        <p>This OTP will expire in 10 minutes.</p>

        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

export const sendPasswordResetOTP = async (email, otp) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2>Password Reset</h2>

        <p>Use the following OTP to reset your password.</p>

        <div style="font-size: 30px; font-weight: bold; letter-spacing: 6px; text-align: center; margin: 24px 0;">
          ${otp}
        </div>

        <p>This OTP will expire in 10 minutes.</p>

        <p>If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
};