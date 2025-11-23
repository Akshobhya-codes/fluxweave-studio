// pages/api/ad-variation.js
import { fal } from "@fal-ai/client";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { platform, product, style = "vibrant" } = req.body || {};

  if (!product || !platform)
    return res.status(400).json({ error: "Missing product or platform" });

  fal.config({ credentials: process.env.FAL_KEY });

  try {
    const variationPrompt = `
You are an advertising creative director.
Rewrite the visual style for a ${platform} ad of this product: ${product}.
Apply the following creative direction: "${style}".
Describe a new, fresh ad scene (composition, lighting, background, and mood).
Keep it in ${platform}'s visual tone (e.g. Instagram = bold/trendy, LinkedIn = clean/premium, etc.).
Return a single vivid description sentence.`;

    const claudeResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 200,
        messages: [{ role: "user", content: variationPrompt }],
      }),
    });

    const claudeData = await claudeResp.json();
    const newPrompt =
      claudeData?.content?.[0]?.text ||
      `A ${style} reinterpretation of ${product} ad for ${platform}.`;

    const sizeMap = {
      instagram: "square_hd",
      linkedin: "landscape_16_9",
      snapchat: "portrait_16_9",
      pinterest: "portrait_4_3",
      x: "landscape_16_9",
    };

    const result = await fal.subscribe("fal-ai/alpha-image-232/text-to-image", {
      input: {
        prompt: `${newPrompt}. Include brand text and tone suitable for ${platform}.`,
        image_size: sizeMap[platform],
        output_format: "png",
      },
    });

    res.status(200).json({
      variationPrompt: newPrompt,
      image: result.data?.images?.[0]?.url || "",
    });
  } catch (err) {
    console.error("Variation error:", err);
    res.status(500).json({ error: "Failed to generate variation" });
  }
}
