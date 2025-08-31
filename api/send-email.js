// api/send-email.js
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { firstName, lastName, email, headline } = req.body;

  if (!firstName || !lastName || !email || !headline) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    // Example: send via Gmail SMTP (you can switch to any provider)
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // set in Vercel env
        pass: process.env.EMAIL_PASS, // set in Vercel env
      },
    });

    // AI personalization (simplest placeholder, replace with Gemini call later)
    const personalizedMessage = `Hi ${firstName},\n\nThanks for signing up as ${headline}.\nThis is your personalized Repleaf guide.\n\nBest,\nRepleaf Team`;

    await transporter.sendMail({
      from: `"Repleaf" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Personalized Repleaf Guide",
      text: personalizedMessage,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Email error:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
