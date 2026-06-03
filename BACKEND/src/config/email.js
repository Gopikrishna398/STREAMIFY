import nodemailer from "nodemailer";

const getTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn("WARNING: EMAIL_USER and EMAIL_PASS environment variables are not configured. Email sending will fail.");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user,
      pass: pass,
    },
  });
};

export const sendVerificationEmail = async (toEmail, otp) => {
  const transporter = getTransporter();

  const mailOptions = {
    from: `"Streamify" <${process.env.EMAIL_USER || "noreply@streamify.com"}>`,
    to: toEmail,
    subject: "Verify Your Streamify Account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #6366f1; text-align: center;">Welcome to Streamify!</h2>
        <p style="font-size: 16px; color: #333333;">Thank you for registering. Please verify your email address by using the 6-digit One-Time Password (OTP) below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4f46e5; background-color: #f3f4f6; padding: 10px 20px; border-radius: 6px; border: 1px dashed #6366f1;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 14px; color: #666666;">This verification code is valid for 15 minutes. If you did not request this, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999999; text-align: center;">&copy; ${new Date().getFullYear()} Streamify. All rights reserved.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Verification email sent: ${info.messageId}`);
    return { success: true };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { success: false, error };
  }
};
