const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Apna API key .env file se lo
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/analyze-media', async (req, res) => {
  try {
    const { text, imageBase64 } = req.body;

    // Gemini 1.5 Flash fast aur multimodal tasks ke liye best hai
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Analyze the provided image and text. 
      Generate exactly 5 highly relevant tech or hackathon related hashtags based on the content. 
      Do not include generic words like 'love', 'want', 'team'. Focus on technologies, domains (e.g., Cybersecurity, Web3, AI), and core themes.
      Return ONLY a comma-separated list of tags without the '#' symbol.
      Text provided by user: "${text}"
    `;

    const imageParts = [];
    if (imageBase64) {
      // Frontend se data:image/png;base64,... aayega, usko split karna padega
      const mimeType = imageBase64.substring(imageBase64.indexOf(":") + 1, imageBase64.indexOf(";"));
      const base64Data = imageBase64.split(",")[1];
      
      imageParts.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
    }

    // Call Gemini API
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const aiText = response.text();

    // Comma separated string ko array mein convert karo
    const tagsArray = aiText.split(',').map(tag => tag.trim().replace(/[^a-zA-Z0-9]/g, ''));

    res.json({ tags: tagsArray });

  } catch (error) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({ error: "Failed to analyze media" });
  }
});

module.exports = router;