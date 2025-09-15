// Simple test API that just returns success without any complex operations
export default function handler(req, res) {
  console.log("=== SIMPLE TEST API ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    console.log("Simple test API working");
    res.status(200).json({
      success: true,
      message: "Simple test API is working",
      timestamp: new Date().toISOString(),
      method: req.method,
    });
  } catch (error) {
    console.error("Simple test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
