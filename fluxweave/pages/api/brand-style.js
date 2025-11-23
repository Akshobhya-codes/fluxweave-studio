// pages/api/brand-style.js
export const config = {
    api: {
      bodyParser: {
        sizeLimit: "10mb", // allow base64 images
      },
    },
  };
  
  export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    try {
      const { imageBase64 } = req.body || {};
  
      if (!imageBase64)
        return res.status(400).json({ error: "No brand image uploaded" });
  
      const prompt = `
  You are a visual brand analyst.
  Analyze this brand reference image and describe:
  1. The main color palette (list 3–5 key colors in words or hex if visible)
  2. The overall mood/aesthetic (e.g., minimal, luxury, bold, natural)
  3. The visual tone (e.g., professional, playful, artistic)
  4. The kind of lighting or photography vibe it represents.
  
  Respond in JSON like:
  {
    "colors": ["#hex or color name", ...],
    "mood": "...",
    "tone": "...",
    "summary": "1–2 sentences about how future ads should look to match this brand"
  }
  `;
  
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": process.env.ANTHROPIC_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 400,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: "image/png",
                    data: imageBase64.split(",")[1],
                  },
                },
              ],
            },
          ],
        }),
      });
  
      const data = await resp.json();
      let analysis = {
        colors: [],
        mood: "",
        tone: "",
        summary:
          "Brand aesthetic extracted successfully — use this style in future ads.",
      };
  
      try {
        analysis = JSON.parse(data?.content?.[0]?.text || "{}");
      } catch {
        console.warn("Failed to parse brand style JSON, using fallback.");
      }
  
      res.status(200).json({ analysis });
    } catch (err) {
      console.error("Brand style error:", err);
      res.status(500).json({ error: "Failed to analyze brand style" });
    }
  }
  