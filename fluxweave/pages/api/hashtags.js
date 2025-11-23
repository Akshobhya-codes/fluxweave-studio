// pages/api/hashtags.js
export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    const { platform, product } = req.body || {};
  
    try {
      const prompt = `
  Generate 2–4 optimized, catchy hashtags for a ${platform} ad.
  The product is: ${product}.
  Keep them short, platform-appropriate, and relevant.
  Return STRICT JSON array, e.g. ["#innovation", "#techstyle", "#newdrop"]
  `;
  
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": process.env.ANTHROPIC_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 100,
          messages: [{ role: "user", content: prompt }],
        }),
      });
  
      const data = await resp.json();
      let hashtags = [];
  
      try {
        hashtags = JSON.parse(data?.content?.[0]?.text || "[]");
      } catch {
        hashtags = (data?.content?.[0]?.text || "")
          .split("#")
          .filter(Boolean)
          .map((tag) => "#" + tag.trim().split(" ")[0])
          .slice(0, 4);
      }
  
      res.status(200).json({ hashtags });
    } catch (err) {
      console.error("Hashtag generation error:", err);
      res.status(500).json({ error: "Failed to generate hashtags" });
    }
  }
  