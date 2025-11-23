// pages/api/enhance-scene.js
import { fal } from "@fal-ai/client";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { imageUrl, style } = req.body || {};

  try {
    fal.config({ credentials: process.env.FAL_KEY });

    const result = await fal.subscribe("fal-ai/alpha-image-232/edit-image", {
      input: {
        image_urls: [imageUrl],
        prompt: `Enhance this image with ${style} lighting and aesthetic — maintain realistic detail.`,
        output_format: "png",
      },
      logs: true,
    });

    const enhancedUrl = result?.data?.images?.[0]?.url || "";
    res.status(200).json({ enhancedUrl });
  } catch (err) {
    console.error("Enhance scene error:", err);
    res.status(500).json({ error: "Failed to enhance image" });
  }
}
