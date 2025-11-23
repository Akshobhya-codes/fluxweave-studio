// components/ActionButtons.js
export default function ActionButtons({ imageUrl, promptText, descriptionText }) {
    const copyImage = async () => {
      try {
        const blob = await fetch(imageUrl).then((r) => r.blob());
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ]);
        alert("✅ Image copied to clipboard!");
      } catch (err) {
        console.error("Copy image failed:", err);
        alert("⚠️ Your browser doesn't allow direct image copy.");
      }
    };
  
    const downloadImage = () => {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = "fluxweave-generated.png";
      link.click();
    };
  
    const copyText = (text, label) => {
      navigator.clipboard.writeText(text);
      alert(`✅ ${label} copied!`);
    };
  
    return (
      <div className="flex flex-wrap gap-3 mt-4">
        {imageUrl && (
          <>
            <button
              onClick={downloadImage}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white"
            >
              Download Image
            </button>
            <button
              onClick={copyImage}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white"
            >
              Copy Image
            </button>
          </>
        )}
        {promptText && (
          <button
            onClick={() => copyText(promptText, "Prompt")}
            className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg text-white"
          >
            Copy Prompt
          </button>
        )}
        {descriptionText && (
          <button
            onClick={() => copyText(descriptionText, "Description")}
            className="bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded-lg text-white"
          >
            Copy Description
          </button>
        )}
      </div>
    );
  }
  