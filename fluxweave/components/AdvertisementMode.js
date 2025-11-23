import { useState } from "react";
import ActionButtons from "./ActionButtons";

export default function AdvertisementMode() {
  const [platform, setPlatform] = useState("instagram");
  const [product, setProduct] = useState(
    "FluxWatch Zenith — a premium matte black smartwatch inspired by sci-fi minimalism, luxury engineering, and futuristic design cues."
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [adKit, setAdKit] = useState([]);
  const [error, setError] = useState("");
  const [brandImage, setBrandImage] = useState(null);
  const [brandStyle, setBrandStyle] = useState(null);

  // -------- Brand Consistency Engine --------
  const handleBrandUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      setBrandImage(base64);

      const res = await fetch("/api/brand-style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      const data = await res.json();
      setBrandStyle(data.analysis || {});
    };
    reader.readAsDataURL(file);
  };

  // -------- Single Ad Generation --------
  const generateAd = async () => {
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          product,
          brand: "FluxWeave",
          palette: brandStyle?.colors?.join(", ") || "charcoal and electric blue",
          vibe:
            brandStyle?.mood ||
            "sleek, futuristic, premium aesthetic",
          ctaHint: "Shop Now",
        }),
      });

      const data = await res.json();
      if (!data?.images?.length)
        throw new Error(data?.error || "Ad generation failed");

      const descRes = await fetch("/api/claude-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, product }),
      });

      const descData = await descRes.json();

      setResult({
        ...data,
        description:
          descData.description || "Experience innovation reimagined.",
      });
    } catch (e) {
      console.error(e);
      setError(e.message || "Unexpected error while generating ad");
    }

    setLoading(false);
  };

  // -------- Ad Kit Generator --------
  const generateAdKit = async () => {
    setLoading(true);
    setAdKit([]);
    setError("");

    try {
      const res = await fetch("/api/adkit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product,
          brand: "FluxWeave",
          palette: brandStyle?.colors?.join(", ") || "charcoal and electric blue",
          vibe:
            brandStyle?.mood ||
            "sleek, futuristic, premium aesthetic",
          ctaHint: "Shop Now",
        }),
      });
      const data = await res.json();

      const adsWithHistory = (data.ads || []).map((ad) => ({
        ...ad,
        variations: [ad.image],
      }));

      setAdKit(adsWithHistory);
    } catch (err) {
      console.error(err);
      setError("Failed to generate ad kit");
    }

    setLoading(false);
  };

  // -------- Smart Variation Generator --------
  const generateVariation = async (platform, style, index) => {
    setLoading(true);
    try {
      const res = await fetch("/api/ad-variation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, product, style }),
      });
      const data = await res.json();

      setAdKit((prev) =>
        prev.map((ad, i) =>
          i === index
            ? {
                ...ad,
                image: data.image,
                caption: ad.caption + ` (${style} style)`,
                variations: [...(ad.variations || []), data.image],
              }
            : ad
        )
      );
    } catch (err) {
      console.error("Variation failed:", err);
    }
    setLoading(false);
  };

  // -------- Restore a previous variation --------
  const restoreVariation = (index, variationUrl) => {
    setAdKit((prev) =>
      prev.map((ad, i) =>
        i === index ? { ...ad, image: variationUrl } : ad
      )
    );
  };

  return (
    <div className="p-6 border border-gray-700 rounded-2xl bg-gray-800 fade-in">
      <h2 className="text-2xl font-semibold mb-4">Advertisement Mode</h2>
      <p className="text-gray-400 mb-4">
        Generate platform-specific ad visuals, copy, and descriptions tailored to
        each platform’s vibe — now enhanced with the Brand Consistency Engine.
      </p>

      {/* ---------- Brand Consistency Engine ---------- */}
      <div className="mb-6 p-4 rounded-xl bg-gray-900 border border-gray-700">
        <h3 className="text-lg font-semibold mb-2">
          Brand Consistency Engine
        </h3>
        <p className="text-gray-400 text-sm mb-3">
          Upload your logo or brand style image. Claude will analyze it to
          extract your color palette, mood, and tone — ensuring every ad you
          generate stays visually consistent with your brand identity.
        </p>

        <input
          type="file"
          accept="image/*"
          onChange={handleBrandUpload}
          className="block w-full text-sm text-gray-300 mb-3"
        />

        {brandImage && (
          <img
            src={brandImage}
            alt="Brand reference"
            className="rounded-lg border border-gray-700 mb-3 w-32 h-32 object-cover"
          />
        )}

        {brandStyle && (
          <div className="bg-gray-800 p-3 rounded-lg text-sm text-gray-300">
            <p>
              <strong>Colors:</strong>{" "}
              {brandStyle.colors?.join(", ") || "Detected automatically"}
            </p>
            <p>
              <strong>Mood:</strong> {brandStyle.mood || "—"}
            </p>
            <p>
              <strong>Tone:</strong> {brandStyle.tone || "—"}
            </p>
            <p className="italic text-gray-400 mt-2">
              {brandStyle.summary ||
                "Brand aesthetic extracted successfully — ads will match this style."}
            </p>
          </div>
        )}
      </div>

      {/* ---------- Main Ad Generator ---------- */}
      <label className="block text-gray-300 mb-2">Choose Platform:</label>
      <select
        className="bg-gray-700 text-white rounded-lg p-2 mb-4 w-full"
        value={platform}
        onChange={(e) => setPlatform(e.target.value)}
      >
        <option value="instagram">Instagram</option>
        <option value="linkedin">LinkedIn</option>
        <option value="snapchat">Snapchat</option>
        <option value="pinterest">Pinterest</option>
        <option value="x">X (Twitter)</option>
      </select>

      <label className="block text-gray-300 mb-2">Product Description:</label>
      <textarea
        className="w-full bg-gray-700 text-white rounded-lg p-3 mb-4 min-h-[100px]"
        value={product}
        onChange={(e) => setProduct(e.target.value)}
      />

      <div className="flex flex-wrap gap-3">
        <button
          onClick={generateAd}
          disabled={loading}
          className={`px-5 py-3 rounded-lg font-semibold ${
            loading ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Generating Ad..." : "Generate Ad"}
        </button>

        <button
          onClick={generateAdKit}
          disabled={loading}
          className="px-5 py-3 rounded-lg font-semibold bg-green-600 hover:bg-green-700"
        >
          {loading ? "Working..." : "Generate Ad Kit"}
        </button>
      </div>

      {error && <p className="text-red-400 mt-4 text-center">⚠️ {error}</p>}

      {/* ---------- Single Ad ---------- */}
      {result && result.images && result.images.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3 capitalize">
            {platform} Ad Preview
          </h3>

          <div className="rounded-xl overflow-hidden border border-gray-700 bg-gray-900 mb-4">
            <img
              src={result.images[0].url}
              alt="Generated ad"
              className="w-full h-auto"
            />
          </div>

          <div className="text-lg font-bold">{result.headline}</div>
          <p className="text-gray-300">{result.caption}</p>

          {result.description && (
            <p className="mt-4 text-sm text-gray-400 italic border-t border-gray-700 pt-4">
              {result.description}
            </p>
          )}

          <ActionButtons
            imageUrl={result.images[0].url}
            promptText={result.promptUsed}
            descriptionText={result.description}
          />
        </div>
      )}

      {/* ---------- Multi-Platform Ad Kit ---------- */}
      {adKit.length > 0 && (
        <div className="mt-10">
          <h3 className="text-2xl font-semibold mb-4">Multi-Platform Ad Kit</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adKit.map((ad, i) => (
              <div
                key={i}
                className="bg-gray-800 p-4 rounded-xl border border-gray-700"
              >
                <p className="text-sm text-gray-400 mb-2 capitalize">
                  {ad.platform}
                </p>

                {ad.image && (
                  <img
                    src={ad.image}
                    alt={`${ad.platform} ad`}
                    className="rounded-lg mb-3"
                  />
                )}

                <h4 className="font-semibold">{ad.headline}</h4>
                <p className="text-gray-300 mb-3">{ad.caption}</p>

                <ActionButtons imageUrl={ad.image} promptText={ad.caption} />

                {/* Smart Variations */}
                <div className="flex gap-2 mt-3">
                  {["vibrant", "minimalist", "outdoor"].map((style) => (
                    <button
                      key={style}
                      onClick={() => generateVariation(ad.platform, style, i)}
                      className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg text-sm text-white"
                    >
                      {`Make it ${style}`}
                    </button>
                  ))}
                </div>

                {/* Variation History Gallery */}
                {Array.isArray(ad.variations) && ad.variations.length > 1 && (
                  <div className="mt-4">
                    <p className="text-gray-400 text-sm mb-2">
                      Previous Variations:
                    </p>
                    <div className="flex gap-2 overflow-x-auto">
                      {ad.variations.map((vUrl, idx) => (
                        <img
                          key={idx}
                          src={vUrl}
                          alt={`variation-${idx}`}
                          onClick={() => restoreVariation(i, vUrl)}
                          className="w-16 h-16 rounded-md border border-gray-600 cursor-pointer hover:opacity-80"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
