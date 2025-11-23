import { fal } from "@fal-ai/client";
console.log("FAL_KEY loaded:", !!process.env.FAL_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, images } = req.body;
    if (!prompt || !images?.length)
      return res.status(400).json({ error: "Missing prompt or images" });

    fal.config({ credentials: process.env.FAL_KEY });

    const result = await fal.subscribe("fal-ai/alpha-image-232/edit-image", {
      input: {
        prompt,
        image_urls: images, // <-- fal SDK auto-uploads base64 data
        output_format: "png",
      },
      logs: true,
    });

    if (!result?.data?.images) {
      console.error("Bad result:", result);
      return res.status(500).json({ error: "Model did not return images" });
    }

    res.status(200).json({ images: result.data.images });
  } catch (err) {
    console.error("Edit API error:", err);
    res.status(500).json({ error: "Failed to generate aesthetic composition" });
  }
}
