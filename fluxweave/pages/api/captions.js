export default async function handler(req, res) {
    try {
      const { prompt } = req.body;
  
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": process.env.ANTHROPIC_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 100,
          messages: [
            {
              role: "user",
              content: `You are an expert creative copywriter. Write a short, catchy marketing caption (1–2 sentences max) for a product described as: "${prompt}". The caption should sound natural and appealing, like a brand tagline.`,
            },
          ],
        }),
      });
  
      const data = await response.json();
      const caption = data.content?.[0]?.text || "Your next big idea.";
      res.status(200).json({ caption });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to generate caption" });
    }
  }
  