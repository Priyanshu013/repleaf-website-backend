// api/test-google-sheets.js
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight OPTIONS request
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
    const scriptUrl =
      "https://script.google.com/macros/s/AKfycby0KXgyotCFs3gE674tyKu8lXhnLTgAOBXufrazuB5aZZJCe4a34f4Tg8yQjD8JqFIqjg/exec";

    const formData = new URLSearchParams({
      firstname: firstName,
      lastname: lastName,
      email: email,
      domain: headline,
    });

    console.log("=== GOOGLE SHEETS TEST ===");
    console.log("URL:", scriptUrl);
    console.log("Data being sent:", {
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

    const result = await response.text();
    console.log("Raw response:", result);
    console.log("Response length:", result.length);
    console.log("=== END TEST ===");

    return res.status(200).json({
      success: true,
      status: response.status,
      response: result,
      dataSent: {
        firstname: firstName,
        lastname: lastName,
        email: email,
        domain: headline,
      },
    });
  } catch (error) {
    console.error("Test error:", error);
    return res.status(500).json({
      error: "Test failed",
      message: error.message,
      stack: error.stack,
    });
  }
}
