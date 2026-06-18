/**
 * Email configuration using Brevo HTTPS API.
 * This avoids SMTP port blocking on hosts like Railway.
 */

export const sendVerificationEmail = async (toEmail, otp) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Streamify";

  // Fallback: If no API key is configured, log the OTP to the console
  if (!apiKey || !senderEmail) {
    console.log("-----------------------------------------");
    console.log(`[STREAMIFY EMAIL SERVICE] OTP for ${toEmail}: ${otp}`);
    console.log("To send real emails on Railway, please configure BREVO_API_KEY and BREVO_SENDER_EMAIL.");
    console.log("-----------------------------------------");
    return { success: true, message: "Logged to console" };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email: toEmail,
          },
        ],
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
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      console.log(`Verification email sent via Brevo API: ${data.messageId || "accepted"}`);
      return { success: true };
    } else {
      console.error("Brevo API responded with an error:", data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.error("Error sending verification email via Brevo API:", error);
    return { success: false, error };
  }
};
