import { fal } from "@fal-ai/client";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    platform = "instagram",
    product = "",
    brand = "FluxWeave",
    palette = "charcoal and electric blue",
    vibe = "sleek, futuristic, premium aesthetic",
    ctaHint = "Shop Now",
  } = req.body || {};

  if (!product)
    return res.status(400).json({ error: "Missing 'product' in body" });

  fal.config({ credentials: process.env.FAL_KEY });

  try {
    // Ask Claude for ad concept
    const copyPrompt = `
You are a senior creative strategist creating a ${platform} ad.
Platform tone:
- Instagram → trendy, bold, emoji-filled.
- LinkedIn → elegant, professional, innovation-focused.
- Snapchat → fun, playful, slangy.
- Pinterest → cozy, aesthetic, lifestyle.
- X (Twitter) → witty, bold, short.

Product: ${product}
Brand: ${brand}
Palette: ${palette}
Vibe: ${vibe}
CTA hint: ${ctaHint}

Return STRICT JSON:
{
  "headline": "short headline",
  "caption": "long detailed marketing paragraph (5–8 sentences) describing benefits and emotional appeal",
  "visual_prompt": "visual scene, lighting, composition"
}
`;

    const claudeResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 600,
        messages: [{ role: "user", content: copyPrompt }],
      }),
    });

    const claudeData = await claudeResp.json();
    let headline = "New Arrival";
    let caption = "Discover innovation reimagined.";
    let visualPrompt = `High-quality product ad for ${product}`;

    try {
      const parsed = JSON.parse(claudeData?.content?.[0]?.text || "{}");
      headline = parsed.headline || headline;
      caption = parsed.caption || caption;
      visualPrompt = parsed.visual_prompt || visualPrompt;
    } catch {
      console.warn("Claude JSON parse failed — using defaults.");
    }

    // Generate image via FLUX
    const sizeMap = {
      instagram: "square_hd",
      linkedin: "landscape_16_9",
      snapchat: "portrait_16_9",
      pinterest: "portrait_4_3",
      x: "landscape_16_9",
    };

    const result = await fal.subscribe("fal-ai/alpha-image-232/text-to-image", {
      input: {
        prompt: `${visualPrompt}. Include overlay text "${headline}" and "${caption}". Match ${platform} tone and style.`,
        image_size: sizeMap[platform],
        output_format: "png",
      },
    });

    if (!result?.data?.images?.length)
      return res.status(500).json({ error: "No image returned from FLUX." });

    res.status(200).json({
      platform,
      images: result.data.images,
      headline,
      caption,
      promptUsed: visualPrompt,
    });
  } catch (err) {
    console.error("Ad generation error:", err);
    res.status(500).json({ error: "Failed to generate ad" });
  }
}
