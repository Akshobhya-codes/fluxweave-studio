// pages/api/adkit.js
import { fal } from "@fal-ai/client";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    product = "",
    brand = "FluxWeave",
    palette = "charcoal and electric blue",
    vibe = "sleek, futuristic, premium aesthetic",
    ctaHint = "Shop Now",
    logo = "",
  } = req.body || {};

  if (!product)
    return res.status(400).json({ error: "Missing 'product' in body" });

  const platforms = ["instagram", "linkedin", "snapchat", "pinterest", "x"];
  fal.config({ credentials: process.env.FAL_KEY });

  try {
    const ads = await Promise.all(
      platforms.map(async (platform) => {
        // ---------- STEP 1: Claude for unique copy + visual ----------
        const copyPrompt = `
You are a senior creative director crafting a ${platform} ad.

Platform tone guide:
- Instagram → trendy, vibrant, emoji-rich, lifestyle-focused
- LinkedIn → elegant, professional, performance-driven
- Snapchat → youthful, fun, slangy, bold visuals
- Pinterest → cozy, artistic, aspirational, pastel tones
- X (Twitter) → short, witty, impactful, hashtag-friendly

Product: ${product}
Brand: ${brand}
Palette: ${palette}
Vibe: ${vibe}
CTA: ${ctaHint}

Return STRICT JSON:
{
  "headline": "catchy short headline for ad image",
  "caption": "long persuasive ad copy (6–8 sentences) that sells the product emotionally and factually for ${platform}",
  "visual_prompt": "vivid visual scene describing composition, lighting, mood, background and elements that fit ${platform} style"
}`;

        const copyResp = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": process.env.ANTHROPIC_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 700,
            messages: [{ role: "user", content: copyPrompt }],
          }),
        });

        const copyJson = await copyResp.json();
        let headline = "New Arrival";
        let caption = "Discover the innovation that defines tomorrow.";
        let visualPrompt = `Ad for ${product}`;

        try {
          const parsed = JSON.parse(copyJson?.content?.[0]?.text || "{}");
          headline = parsed.headline || headline;
          caption = parsed.caption || caption;
          visualPrompt = parsed.visual_prompt || visualPrompt;
        } catch (err) {
          console.warn("Failed to parse Claude JSON, using fallback values.", err);
        }

        // ---------- STEP 2: Platform-specific style ----------
        const sizeMap = {
          instagram: "square_hd",
          linkedin: "landscape_16_9",
          snapchat: "portrait_16_9",
          pinterest: "portrait_4_3",
          x: "landscape_16_9",
        };

        const styleHints = {
          instagram:
            "vibrant lighting, lifestyle background, bold colors, modern typography",
          linkedin:
            "clean minimal photography, professional lighting, corporate tone",
          snapchat:
            "bright colors, emojis, fun graphics, playful vibe",
          pinterest:
            "soft light, natural aesthetic, cozy composition",
          x: "dark high-contrast, cinematic composition, minimalist layout",
        };

        // ---------- STEP 3: Generate image with FLUX ----------
        const result = await fal.subscribe(
          "fal-ai/alpha-image-232/text-to-image",
          {
            input: {
              prompt: `${visualPrompt}. Include overlay text "${headline}" and "${caption}". Platform tone: ${styleHints[platform]}. Brand tone: ${vibe}. Use color palette: ${palette}. ${
                logo
                  ? "Include the uploaded brand logo in the top-right corner of the image for visual consistency."
                  : ""
              }`,
              image_size: sizeMap[platform],
              output_format: "png",
            },
            logs: true,
          }
        );

        return {
          platform,
          headline,
          caption,
          image: result.data?.images?.[0]?.url || "",
        };
      })
    );

    res.status(200).json({ ads });
  } catch (err) {
    console.error("AdKit generation error:", err);
    res.status(500).json({ error: "Failed to generate ad kit" });
  }
}
