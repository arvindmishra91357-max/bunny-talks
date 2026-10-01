import React from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface MediaLightboxProps {
  url: string | null;
  type?: 'image' | 'video';
  caption?: string;
  onClose: () => void;
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({
  url,
  type = 'image',
  caption,
  onClose,
}) => {
  const [scale, setScale] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);

  if (!url) return null;

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Media Preview"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-4 select-none"
      onClick={onClose}
    >
      {/* Top controls */}
      <div
        className="absolute top-4 right-4 flex items-center gap-2 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleZoomOut}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all"
          title="Zoom out"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomIn}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all"
          title="Zoom in"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={handleRotate}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all"
          title="Rotate"
          aria-label="Rotate"
        >
          <RotateCw className="w-5 h-5" />
        </button>
        <a
          href={url}
          download="bunny-talks-media"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all inline-flex items-center justify-center"
          title="Download"
          aria-label="Download media"
        >
          <Download className="w-5 h-5" />
        </a>
        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-bunny-coral text-white hover:opacity-90 transition-all ml-2"
          title="Close"
          aria-label="Close media preview"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Media Canvas */}
      <div
        className="max-w-[90vw] max-h-[85vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {type === 'video' ? (
          <video
            src={url}
            controls
            autoPlay
            className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl object-contain"
          />
        ) : (
          <img
            src={url}
            alt={caption || 'Preview'}
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl object-contain cursor-grab active:cursor-grabbing"
          />
        )}

        {caption && (
          <div className="mt-4 px-6 py-2.5 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-sm max-w-xl text-center">
            {caption}
          </div>
        )}
      </div>
    </div>
  );
};
