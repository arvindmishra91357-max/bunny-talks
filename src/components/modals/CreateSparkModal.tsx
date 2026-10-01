import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { X, Sparkles, Camera, Headphones, Type, Send } from 'lucide-react';

const GRADIENT_PRESETS = [
  'linear-gradient(135deg, #ff607d 0%, #ff7b5f 100%)',
  'linear-gradient(135deg, #7b5cf5 0%, #a855f7 100%)',
  'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
];

export const CreateSparkModal: React.FC = () => {
  const { isCreateSparkOpen, setIsCreateSparkOpen, createSpark } = useChat();
  const { currentUser } = useAuth();

  const [type, setType] = useState<'text' | 'photo' | 'music'>('text');
  const [caption, setCaption] = useState('');
  const [title, setTitle] = useState('');
  const [moodBadge, setMoodBadge] = useState('✨ Spark');
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_PRESETS[0]);
  const [imageUrl, setImageUrl] = useState('');

  if (!isCreateSparkOpen) return null;

  const handlePost = () => {
    if (!caption.trim() && !title.trim() && !imageUrl) return;

    createSpark({
      type,
      title: title.trim() || 'Instant Spark',
      caption: caption.trim(),
      bg_gradient: selectedGradient,
      mood_badge: moodBadge,
      media_url: type === 'photo' ? imageUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80' : undefined,
      track_title: type === 'music' ? 'Lo-Fi Chill Hop' : undefined,
    });

    setCaption('');
    setTitle('');
    setImageUrl('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#201c2e] border border-bunny-border shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden p-6 select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-bunny-border">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <h3 className="text-sm font-extrabold text-bunny-ink">Create an Instant Spark</h3>
          </div>
          <button
            onClick={() => setIsCreateSparkOpen(false)}
            className="p-1.5 rounded-full text-bunny-muted hover:text-bunny-ink hover:bg-bunny-border/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Type Switcher */}
        <div className="flex items-center gap-2 my-4">
          <button
            onClick={() => setType('text')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              type === 'text'
                ? 'bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white shadow-sm'
                : 'bg-bunny-border/40 text-bunny-muted hover:text-bunny-ink'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Text</span>
          </button>
          <button
            onClick={() => setType('photo')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              type === 'photo'
                ? 'bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white shadow-sm'
                : 'bg-bunny-border/40 text-bunny-muted hover:text-bunny-ink'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Photo</span>
          </button>
          <button
            onClick={() => setType('music')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              type === 'music'
                ? 'bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white shadow-sm'
                : 'bg-bunny-border/40 text-bunny-muted hover:text-bunny-ink'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Music</span>
          </button>
        </div>

        {/* Preview Container */}
        <div
          style={{
            background: type === 'text' ? selectedGradient : undefined,
          }}
          className={`w-full aspect-[16/10] rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden mb-4 ${
            type !== 'text' ? 'bg-slate-800' : ''
          }`}
        >
          {type === 'photo' && (
            <img
              src={imageUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80'}
              alt="Spark Preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          <div className="absolute inset-0 bg-black/25 pointer-events-none" />

          {/* User badge */}
          <div className="relative z-10 flex items-center gap-2">
            <img src={currentUser?.avatar_url} className="w-7 h-7 rounded-full object-cover ring-1 ring-white" />
            <span className="text-xs font-bold text-white drop-shadow-sm">{currentUser?.name}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-white backdrop-blur-md">
              {moodBadge}
            </span>
          </div>

          <div className="relative z-10 text-white">
            <h4 className="text-sm font-extrabold line-clamp-1">{title || 'Your Spark Title'}</h4>
            <p className="text-xs text-white/90 line-clamp-2 mt-0.5">
              {caption || 'What’s happening on your side right now? ✨'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Spark Title (e.g. Soft Sunday, Cozy Coffee...)"
            className="w-full bg-bunny-border/30 text-xs px-3.5 py-2.5 rounded-xl border border-bunny-border outline-none text-bunny-ink placeholder:text-bunny-muted"
          />

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Share something spontaneous with your people..."
            rows={2}
            className="w-full bg-bunny-border/30 text-xs px-3.5 py-2.5 rounded-xl border border-bunny-border outline-none text-bunny-ink placeholder:text-bunny-muted resize-none"
          />

          {type === 'text' && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-bunny-muted">Color:</span>
              <div className="flex items-center gap-1.5">
                {GRADIENT_PRESETS.map((grad, i) => (
                  <button
                    key={i}
                    style={{ background: grad }}
                    onClick={() => setSelectedGradient(grad)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      selectedGradient === grad ? 'scale-120 ring-2 ring-[#ff607d]' : ''
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {type === 'photo' && (
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste Image URL (or use default camera sample)"
              className="w-full bg-bunny-border/30 text-xs px-3.5 py-2.5 rounded-xl border border-bunny-border outline-none text-bunny-ink placeholder:text-bunny-muted"
            />
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setIsCreateSparkOpen(false)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-bunny-border/50 text-bunny-ink hover:bg-bunny-border"
            >
              Cancel
            </button>
            <button
              onClick={handlePost}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Spark</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
