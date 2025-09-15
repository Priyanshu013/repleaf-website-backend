// Main entry point for Vercel
export default function handler(req, res) {
  res.status(200).json({
    message: "✅ Repleaf Backend Running",
    status: "active",
    endpoints: {
      "POST /api/send-email": "Send personalized emails using AI",
    },
  });
}
