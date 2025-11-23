import { fal } from "@fal-ai/client";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    // Configure fal client with key from .env.local
    fal.config({ credentials: process.env.FAL_KEY });

    const result = await fal.subscribe("fal-ai/alpha-image-232/text-to-image", {
      input: {
        prompt,
        image_size: "landscape_4_3",
        output_format: "png",
      },
      logs: true,
    });

    // Make sure result.data exists and has images
    if (!result?.data?.images) {
      console.error("Invalid result from FAL:", result);
      return res.status(500).json({ error: "Invalid response from FAL API" });
    } 

    res.status(200).json({ images: result.data.images });
  } catch (err) {
    console.error("FAL API error:", err);
    res.status(500).json({ error: "Failed to generate image" });
  }
}
