export default function ImageCard({ url, caption }) {
    return (
      <div className="rounded-xl overflow-hidden border border-gray-700 bg-gray-800">
        <img src={url} alt="Generated" className="w-full h-auto" />
        <p className="p-3 text-center text-gray-300 text-sm italic">{caption}</p>
      </div>
    );
  }
  