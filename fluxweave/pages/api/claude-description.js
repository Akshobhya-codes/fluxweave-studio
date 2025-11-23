// pages/api/claude-description.js
export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    const { platform, product } = req.body || {};
  
    try {
      const prompt = `
  You are a professional creative copywriter writing long-form social captions. 
  Create a rich product description (6–10 sentences) tailored for the platform "${platform}".
  It should sound like a full ad caption — long enough for a social post — persuasive, storytelling, and emotionally engaging. 
  Use the tone appropriate to each platform:
  
  - Instagram → warm, expressive, emoji-friendly, trendy, conversational.
  - LinkedIn → confident, professional, emphasizing quality, innovation, and trust.
  - Snapchat → youthful, slang-filled, playful, short sentences, emoji-heavy.
  - Pinterest → aesthetic, descriptive, sensory language, focus on beauty and lifestyle appeal.
  - X (Twitter) → bold, opinionated, quick phrases, witty hashtags.
  
  Product: ${product}
  
  Write one full paragraph that blends brand values, emotional appeal, and reasons to buy, with personality and vivid imagery. 
  Avoid generic lines like "this product is great" — make it feel alive and specific.
  `;
  
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": process.env.ANTHROPIC_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 600,
          messages: [{ role: "user", content: prompt }],
        }),
      });
  
      const data = await resp.json();
      const text =
        data?.content?.[0]?.text ||
        "Discover the future of design and performance — where craftsmanship meets emotion, and technology becomes art.";
  
      res.status(200).json({ description: text.trim() });
    } catch (err) {
      console.error("Description API error:", err);
      res.status(500).json({ error: "Failed to generate long-form product description" });
    }
  }
  