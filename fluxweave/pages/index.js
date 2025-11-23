import { useState } from "react";
import AestheticMode from "../components/AestheticMode";
import AdvertisementMode from "../components/AdvertisementMode";

export default function Home() {
  const [activeTab, setActiveTab] = useState("advertisement");

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-6 text-center">FluxWeave Studio</h1>
      <p className="text-gray-400 mb-8 text-center max-w-xl">
        Choose your creative mode — generate beautiful aesthetic photos or
        design platform-specific advertisements with AI.
      </p>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab("aesthetic")}
          className={`px-5 py-2 rounded-lg font-semibold transition ${
            activeTab === "aesthetic"
              ? "bg-blue-600"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          Aesthetic Mode
        </button>
        <button
          onClick={() => setActiveTab("advertisement")}
          className={`px-5 py-2 rounded-lg font-semibold transition ${
            activeTab === "advertisement"
              ? "bg-blue-600"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          Advertisement Mode
        </button>
      </div>

      <div className="w-full max-w-4xl">
        {activeTab === "aesthetic" ? <AestheticMode /> : <AdvertisementMode />}
      </div>
    </main>
  );
}
