import nodemailer from "nodemailer";
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { firstName, lastName, email, headline } = req.body;

  try {
    // 1. Ask Gemini for personalized text
    const prompt = `Write a short engaging message explaining how Repleaf will help ${firstName} ${lastName}, a ${headline}, build credibility through the Repleaf Score.`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    const aiMessage =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Your personalized Repleaf guide is on its way!";

    // 2. Send via email
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Repleaf" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Personalized Repleaf Guide 🌱",
      html: `<p>Hi ${firstName},</p><p>${aiMessage}</p><br/><p>— The Repleaf Team 🌿</p>`,
    });

    res.status(200).json({ success: true, message: "Email sent!" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
}
