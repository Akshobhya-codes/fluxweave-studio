// pages/_app.js
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 🎥 Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/mnt/data/41217a67-e040-45b9-b963-49a58edc9167.mp4" type="video/mp4" />
      </video>

      {/* App foreground */}
      <div className="relative z-10">
        <Component {...pageProps} />
      </div>

      {/* Optional dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/40 z-5"></div>
    </div>
  );
}
