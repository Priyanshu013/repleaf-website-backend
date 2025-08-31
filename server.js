import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ✅ Gemini + Email route
app.post("/send-email", async (req, res) => {
  const { firstName, lastName, email, headline } = req.body;

  try {
    // 1. Generate personalized content from Gemini
    const prompt = `Write a short engaging message explaining how Repleaf will help ${firstName} ${lastName}, a ${headline}, build credibility through the Repleaf Score, showcasing skills, teamwork, and trust.`;

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

    // 2. Send Email using Nodemailer
    let transporter = nodemailer.createTransport({
      service: "gmail", // you can change if using another SMTP
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Repleaf" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Personalized Repleaf Guide 🌱",
      text: aiMessage,
      html: `<p>Hi ${firstName},</p><p>${aiMessage}</p><br/><p>— The Repleaf Team 🌿</p>`,
    });

    res.json({ success: true, message: "Email sent!" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

app.get("/", (req, res) => {
  res.send("✅ Repleaf Backend Running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
