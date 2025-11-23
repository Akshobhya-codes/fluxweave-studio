import { useState, useEffect } from "react";
import ActionButtons from "./ActionButtons";

export default function AestheticMode() {
  const [prompt, setPrompt] = useState(
    "cinematic product composition with soft studio lighting, subtle reflections, modern minimal background"
  );
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [resultUrls, setResultUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [enhancing, setEnhancing] = useState(false);

  // --- Enable image paste support ---
  useEffect(() => {
    const handlePaste = (event) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      const pastedFiles = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf("image") === 0) {
          const file = item.getAsFile();
          pastedFiles.push(file);
        }
      }

      if (pastedFiles.length > 0) {
        setFiles((prev) => [...prev, ...pastedFiles]);
        const newPreviews = pastedFiles.map((f) => URL.createObjectURL(f));
        setPreviews((prev) => [...prev, ...newPreviews]);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  // --- Handle manual file uploads ---
  const onFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
    const localPreviews = selected.map((f) => URL.createObjectURL(f));
    setPreviews(localPreviews);
  };

  // --- Convert files to data URIs ---
  const readFilesAsDataUris = (fileList) =>
    Promise.all(
      fileList.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result); // data URI
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    );

  // --- Call backend to generate composition ---
  const generateAesthetic = async () => {
    if (!prompt || files.length === 0) return;
    setLoading(true);
    setResultUrls([]);
    setError("");

    try {
      const dataUris = await readFilesAsDataUris(files);

      const res = await fetch("/api/aesthetic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, images: dataUris }),
      });

      const data = await res.json();

      if (data?.images) {
        setResultUrls(data.images.map((i) => i.url));
      } else {
        setError(data?.error || "Failed to generate aesthetic composition");
      }
    } catch (e) {
      console.error(e);
      setError("Unexpected error while generating composition");
    }

    setLoading(false);
  };

  // --- Scene Enhancer (FLUX Edit endpoint) ---
  const enhanceScene = async (url, style) => {
    setEnhancing(true);
    try {
      const res = await fetch("/api/enhance-scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url, style }),
      });

      const data = await res.json();
      if (data?.enhancedUrl) {
        setResultUrls((prev) =>
          prev.map((old) => (old === url ? data.enhancedUrl : old))
        );
      } else {
        alert("Enhancement failed. Try again.");
      }
    } catch (err) {
      console.error("Enhance scene error:", err);
    }
    setEnhancing(false);
  };

  return (
    <div className="p-6 border border-gray-700 rounded-2xl bg-gray-800">
      <h2 className="text-2xl font-semibold mb-4">Aesthetic Mode</h2>
      <p className="text-gray-400 mb-4">
        Combine multiple images into a single photorealistic composition using
        FLUX 2 Edit. You can upload or paste images (Ctrl+V), and then enhance
        the final result with cinematic or artistic effects.
      </p>

      <label className="block text-gray-300 mb-2">Prompt (composition vibe):</label>
      <input
        className="w-full bg-gray-700 text-white rounded-lg p-3 mb-4"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <label className="block text-gray-300 mb-2">
        Upload 1–4 images or paste them here:
      </label>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={onFileChange}
        className="w-full mb-4"
      />

      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {previews.map((src, i) => (
            <div
              key={i}
              className="rounded-lg overflow-hidden border border-gray-700"
            >
              <img src={src} alt={`upload-${i}`} className="w-full h-auto" />
            </div>
          ))}
        </div>
      )}

      <button
        onClick={generateAesthetic}
        disabled={loading || files.length === 0}
        className={`px-5 py-3 rounded-lg font-semibold ${
          loading ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Blending…" : "Create Aesthetic Composition"}
      </button>

      {error && (
        <p className="text-red-400 mt-4 text-center">⚠️ {error}</p>
      )}

      {resultUrls.length > 0 && (
        <>
          <h3 className="text-xl font-semibold mt-8 mb-3">Result</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {resultUrls.map((url, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden border border-gray-700 bg-gray-900 p-2"
              >
                <img src={url} alt={`result-${i}`} className="w-full h-auto" />
                <ActionButtons imageUrl={url} promptText={prompt} />

                <div className="flex gap-2 mt-3">
                  {["cinematic", "soft glow", "vibrant"].map((style) => (
                    <button
                      key={style}
                      onClick={() => enhanceScene(url, style)}
                      disabled={enhancing}
                      className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg text-sm text-white"
                    >
                      {enhancing
                        ? "Enhancing..."
                        : `Make it ${style}`}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
