// api/send-email.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Gemini AI API configuration from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = process.env.GEMINI_API_URL;

// Function to generate personalized email using AI
async function generatePersonalizedEmail(firstName, headline) {
  try {
    // Check if API credentials are configured
    if (!GEMINI_API_KEY || !GEMINI_API_URL) {
      throw new Error(
        "Gemini API credentials not configured in environment variables"
      );
    }

    const prompt = `You are a professional email writer for Repleaf, a company that helps people build professional credibility.

WorkLynk is the world’s first platform where people's professional reputation is built on skills, not just words.
Take smart, domain-specific challenges, get peer-reviewed ratings, and grow your Trust Score — a measure employers actually understand.

Create a warm, personalized welcome email for a new user named ${firstName} who signed up as "${headline}".

The email should:
- Be welcoming and personal
- Reference their specific headline/role
- Explain what Repleaf offers
- Be encouraging and motivating
- Keep it concise (2-3 paragraphs max)
- End with a warm sign-off

Make it feel like it was written specifically for ${firstName} based on their "${headline}" background.

Return only the email body text, no subject line or formatting.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Invalid response format from Gemini API");
    }
  } catch (error) {
    console.error("AI email generation error:", error);
    // Fallback to static message if AI fails
    return `Hi ${firstName},

Thanks for signing up as ${headline}.
This is your personalized Repleaf guide.

Best,
Repleaf Team`;
  }
}

export default async function handler(req, res) {
  // ✅ Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { firstName, lastName, email, headline } = req.body;

  if (!firstName || !lastName || !email || !headline) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    // Generate personalized email using AI
    const personalizedMessage = await generatePersonalizedEmail(
      firstName,
      headline
    );

    // Example Gmail SMTP (replace with SendGrid, Mailgun, etc. if needed)
    let transporter = nodemailer.createTransport({
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
      text: personalizedMessage,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Email error:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
