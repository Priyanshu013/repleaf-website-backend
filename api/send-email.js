// api/send-email.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = process.env.GEMINI_API_URL;

// Your Apps Script Web App URL
const GOOGLE_SHEET_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycby0KXgyotCFs3gE674tyKu8lXhnLTgAOBXufrazuB5aZZJCe4a34f4Tg8yQjD8JqFIqjg/exec";

async function generatePersonalizedEmail(firstName, headline) {
  try {
    if (!GEMINI_API_KEY || !GEMINI_API_URL) {
      throw new Error("Gemini API credentials not configured");
    }

    const prompt = `...`; // (keeping your prompt same as above — omitted here for brevity)

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    let generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    generatedText = generatedText
      .replace(/```html\s*/gi, "")
      .replace(/```\s*/gi, "")
      .replace(/^html\s*/i, "")
      .trim();

    return generatedText;
  } catch (error) {
    console.error("AI email generation error:", error);
    return `Hi ${firstName},\n\nThanks for signing up as ${headline}...`; // fallback message
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { firstName, lastName, email, headline } = req.body;

  if (!firstName || !lastName || !email || !headline) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const personalizedMessage = await generatePersonalizedEmail(
      firstName,
      headline
    );

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Priyanshu @Repleaf" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Personalized Repleaf Guide",
      html: personalizedMessage,
      text: personalizedMessage.replace(/<[^>]*>/g, ""),
    });

    console.log("✅ Email sent successfully");

    // Send user data to Google Sheet
    const sheetResponse = await fetch(GOOGLE_SHEET_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        firstname: firstName,
        lastname: lastName,
        email,
        domain: headline, // assuming headline == domain
      }),
    });

    const sheetData = await sheetResponse.json();
    if (sheetData.result !== "success") {
      console.warn("⚠️ Google Sheet did not return success:", sheetData);
    } else {
      console.log("✅ User data saved to Google Sheet");
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Error:", err);
    return res.status(500).json({ error: "Failed to send email or save data" });
  }
}
