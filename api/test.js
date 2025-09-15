// Simple test endpoint to verify API is working
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  console.log("Test API called with method:", req.method);
  console.log("Environment variables check:");
  console.log("GEMINI_API_KEY exists:", !!process.env.GEMINI_API_KEY);
  console.log("SMTP_USER exists:", !!process.env.SMTP_USER);
  console.log("SMTP_PASS exists:", !!process.env.SMTP_PASS);

  res.status(200).json({
    success: true,
    message: "Test API is working",
    timestamp: new Date().toISOString(),
    environment: {
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
      SMTP_USER: !!process.env.SMTP_USER,
      SMTP_PASS: !!process.env.SMTP_PASS,
    },
  });
}
