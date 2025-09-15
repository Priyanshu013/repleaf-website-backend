// Main entry point for Vercel
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  console.log("Index handler called:", req.method, req.url);

  res.status(200).json({
    message: "✅ Repleaf Backend Running",
    status: "active",
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    endpoints: {
      "GET /": "This endpoint - shows backend status",
      "POST /api/send-email": "Send personalized emails using AI",
    },
  });
}
