// api/send-email.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fetch from "node-fetch";

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

Repleaf is the world's first platform where people's professional reputation is built on skills, not just words.
Take smart, domain-specific challenges, get peer-reviewed ratings, and grow your Repleaf Score — a measure employers actually understand.

Create a warm, personalized welcome email for a new user named ${firstName} who works as "${headline}". Make sure to format the email really well in HTML.
If the user has entered some random headline which does not make sense, then simply explain what is Repleaf and how it can help them in general. Just Know
that Repleaf is not launched yet, and will soon be going live on Play Store and App store.

The email should:
- Be welcoming and personal
- Inform the user that Repleaf is not launched yet, and will soon be going live on Play Store and App store.
- Use appropriate font sizing and colors. Use Montserrat font family.Mail text should look super pretty.
- Reference their specific headline/role
- Explain what Repleaf offers with clear benefits
- Be encouraging and motivating
- Use proper HTML formatting with:
  * <h2> for section headers
  * <strong> for important points   
  * <ul> and <li> for bullet points
  * <p> for paragraphs
  * <em> for emphasis
- Keep it concise (4-5 paragraphs max)
- End with a warm sign-off

Make it feel like it was written specifically for ${firstName} based on their "${headline}" background. 
Talk more about how Repleaf can specifically help them in their work, based on their headline. Also, somewhere mention that this is an automated email, and that they can still reply to it if they have any questions.

Use the following signature in the email: 

Signature start here -

Best Regards,
Priyanshu Jain, Founder @Repleaf - Build Credibility, Unlock Opportunities
Website - https://repleaf.com/

Signature end here -


Return the complete HTML email body with proper formatting, just the way google sends its automated emails (All text within a beautiful container, and left aligned text.)`;

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
      let generatedText = data.candidates[0].content.parts[0].text;

      // Clean up any markdown code blocks or unwanted formatting
      generatedText = generatedText
        .replace(/```html\s*/gi, "") // Remove ```html
        .replace(/```\s*/gi, "") // Remove ```
        .replace(/^html\s*/i, "") // Remove "html" at the start
        .trim(); // Remove extra whitespace

      console.log("Cleaned AI response:", generatedText);
      return generatedText;
    } else {
      throw new Error("Invalid response format from Gemini API");
    }
  } catch (error) {
    console.error("AI email generation error:", error);
    // Fallback to static message if AI fails
    return `Hi ${firstName},

Thanks for signing up as ${headline}.
We're thrilled to have you join us. Repleaf is the world’s first platform where your professional reputation is built on skills, not just words.
Take smart, domain-specific challenges, get peer-reviewed ratings, and grow your Repleaf Score — a measure employers actually understand.

Best Regards,
Priyanshu Jain, Founder @Repleaf

Repleaf - Build Credibility, Unlock Opportunities
Website - https://repleaf.com/
`;
  }
}

// Function to save user details to Google Sheets
async function saveToGoogleSheets(firstName, lastName, email, headline) {
  try {
    const scriptUrl =
      "https://script.google.com/macros/s/AKfycbxYAeMEl8PIh50DkFvznMAEv7k1-MsUq7IOlwdeLQngEyMfcAa5PGbrPmcGvOSuBylOpw/exec";

    const formData = new URLSearchParams({
      firstname: firstName,
      lastname: lastName,
      email: email,
      domain: headline, // Using headline as domain parameter
    });

    console.log("Sending data to Google Sheets:", {
      firstname: firstName,
      lastname: lastName,
      email: email,
      domain: headline,
    });

    console.log("Form data string:", formData.toString());

    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response body:", errorText);
      throw new Error(
        `Google Sheets API error: ${response.status} - ${errorText}`
      );
    }

    // Google Apps Script returns text, not JSON
    const result = await response.text();
    console.log("Google Sheets raw response:", result);
    console.log("Response length:", result.length);

    // Check if the response indicates success
    if (result.includes("success") || result.includes("Success")) {
      console.log("Google Sheets operation successful");
      return { success: true };
    } else {
      console.error("Google Sheets response does not contain success:", result);
      throw new Error(
        `Google Sheets did not return success response: ${result}`
      );
    }
  } catch (error) {
    console.error("Google Sheets save error:", error);
    console.error("Error stack:", error.stack);
    throw error;
  }
}

export default async function handler(req, res) {
  try {
    console.log("=== API HANDLER START ===");
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    console.log("Headers:", req.headers);

    // ✅ Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // ✅ Handle preflight OPTIONS request
    if (req.method === "OPTIONS") {
      console.log("Handling OPTIONS request");
      return res.status(200).end();
    }

    if (req.method !== "POST") {
      console.log("Method not allowed:", req.method);
      return res.status(405).json({ error: "Method not allowed" });
    }

    console.log("Request body:", req.body);
    console.log("Environment check:");
    console.log("GEMINI_API_KEY exists:", !!process.env.GEMINI_API_KEY);
    console.log("GEMINI_API_URL exists:", !!process.env.GEMINI_API_URL);
    console.log("SMTP_USER exists:", !!process.env.SMTP_USER);
    console.log("SMTP_PASS exists:", !!process.env.SMTP_PASS);

    const { firstName, lastName, email, headline } = req.body;

    if (!firstName || !lastName || !email || !headline) {
      console.log("Missing required fields:", {
        firstName,
        lastName,
        email,
        headline,
      });
      return res.status(400).json({ error: "Missing fields" });
    }

    try {
      // Generate personalized email using AI
      console.log(
        "About to generate personalized email for:",
        firstName,
        "as",
        headline
      );
      const personalizedMessage = await generatePersonalizedEmail(
        firstName,
        headline
      );

      console.log("Final personalized message:", personalizedMessage);
      console.log("Message length:", personalizedMessage.length);

      // Save user details to Google Sheets
      console.log("Saving user details to Google Sheets...");
      try {
        await saveToGoogleSheets(firstName, lastName, email, headline);
        console.log("User details saved to Google Sheets successfully");
      } catch (sheetsError) {
        console.error("Failed to save to Google Sheets:", sheetsError);
        // Continue with email sending even if Google Sheets fails
        console.log(
          "Continuing with email sending despite Google Sheets error"
        );
      }

      // Gmail SMTP configuration
      console.log("SMTP Configuration:");
      console.log("SMTP_USER:", process.env.SMTP_USER);
      console.log("SMTP_PASS length:", process.env.SMTP_PASS?.length);
      console.log(
        "SMTP_PASS starts with:",
        process.env.SMTP_PASS?.substring(0, 4)
      );

      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS, // This should be an App Password
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      await transporter.sendMail({
        from: `"Priyanshu @Repleaf" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Your Personalized Repleaf Guide",
        html: personalizedMessage,
        text: personalizedMessage.replace(/<[^>]*>/g, ""), // Fallback plain text version
      });

      console.log("Email sent successfully");
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("Error in send-email API:", err);
      console.error("Error stack:", err.stack);
      return res.status(500).json({
        error: "Failed to process request",
        details: err.message,
        success: false,
      });
    }
  } catch (handlerError) {
    console.error("=== HANDLER ERROR ===");
    console.error("Handler error:", handlerError);
    console.error("Handler error stack:", handlerError.stack);
    return res.status(500).json({
      error: "Handler error",
      details: handlerError.message,
      success: false,
    });
  }
}
