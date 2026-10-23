const express = require('express');
const router = express.Router();

router.post('/analyze-media', async (req, res) => {
  try {
    const { text, imageBase64 } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    const prompt = `
      Analyze the provided image and text. 
      Generate exactly 5 highly relevant tech or hackathon related hashtags based on the content. 
      Do not include generic words like 'love', 'want', 'team'. Focus on technologies, domains (e.g., Cybersecurity, Web3, AI), and core themes.
      Return ONLY a comma-separated list of tags without the '#' symbol.
      Text provided by user: "${text || ''}"
    `;

    // Format data for direct API call
    const parts = [{ text: prompt }];

    if (imageBase64) {
      const mimeType = imageBase64.substring(imageBase64.indexOf(":") + 1, imageBase64.indexOf(";"));
      const base64Data = imageBase64.split(",")[1];
      
      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: base64Data
        }
      });
    }

    // Direct fetch call (Bypasses the buggy @google/generative-ai package completely)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error details:", data);
      return res.status(500).json({ error: "API connection failed" });
    }

    // Extract text from API response
    const aiText = data.candidates[0].content.parts[0].text;
    const tagsArray = aiText.split(',').map(tag => tag.trim().replace(/[^a-zA-Z0-9]/g, ''));

    res.json({ tags: tagsArray });

  } catch (error) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({ error: "Failed to analyze media" });
  }
});

module.exports = router;