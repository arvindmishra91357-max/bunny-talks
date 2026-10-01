import React from 'react';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';

interface MediaLightboxProps {
  url: string;
  type: 'image' | 'video';
  onClose: () => void;
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({ url, type, onClose }) => {
  const [zoom, setZoom] = React.useState(1);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 flex flex-col items-center justify-between p-4 md:p-8 animate-fade-in select-none">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between text-white z-20">
        <div className="text-xs font-semibold text-slate-400">
          {type === 'image' ? 'Image Viewer' : 'Video Player'}
        </div>
        <div className="flex items-center gap-2">
          {type === 'image' && (
            <>
              <button
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                className="p-2 rounded-full hover:bg-white/10 text-white cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                className="p-2 rounded-full hover:bg-white/10 text-white cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </>
          )}

          <a
            href={url}
            download="nexus_media"
            className="p-2 rounded-full hover:bg-white/10 text-white cursor-pointer"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </a>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Center Media Display */}
      <div className="flex-1 flex items-center justify-center w-full max-h-[85vh] overflow-hidden my-auto">
        {type === 'image' ? (
          <img
            src={url}
            alt=""
            style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s ease-out' }}
            className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
          />
        ) : (
          <video
            src={url}
            controls
            autoPlay
            className="max-w-full max-h-[80vh] rounded-xl shadow-2xl"
          />
        )}
      </div>

      <div className="text-[11px] text-slate-500 pb-2">
        Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">ESC</kbd> to exit
      </div>
    </div>
  );
};
