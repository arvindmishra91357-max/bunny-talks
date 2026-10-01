import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { X, Heart, MessageCircle, Send, Headphones, Sparkles, Share2 } from 'lucide-react';

export const SparkViewerModal: React.FC = () => {
  const { viewingSpark, setViewingSpark, reactToSpark, showToast } = useChat();
  const { currentUser } = useAuth();

  const [commentInput, setCommentInput] = useState('');
  const [localComments, setLocalComments] = useState<string[]>([
    'Sophie: Love this aesthetic! ✨',
    'Liam: That lighting is pure perfection 🎧',
  ]);

  if (!viewingSpark) return null;

  const handleAddComment = () => {
    if (!commentInput.trim() || !currentUser) return;
    setLocalComments((prev) => [...prev, `${currentUser.name}: ${commentInput.trim()}`]);
    setCommentInput('');
    showToast('Comment added to Spark! 💬');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-lg animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm aspect-[9/16] max-h-[88vh] rounded-3xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.6)] flex flex-col justify-between select-none border border-white/20">
        {/* Background Visual */}
        {viewingSpark.media_url ? (
          <img
            src={viewingSpark.media_url}
            alt={viewingSpark.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            style={{ background: viewingSpark.bg_gradient || 'linear-gradient(135deg, #ff607d, #7b5cf5)' }}
            className="absolute inset-0"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90 pointer-events-none" />

        {/* Top Header / Progress Indicator */}
        <div className="relative z-10 p-4 space-y-3">
          <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full w-2/3 animate-pulse" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={viewingSpark.user_avatar}
                alt={viewingSpark.user_name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-white"
              />
              <div>
                <p className="text-xs font-bold text-white leading-tight drop-shadow-md">
                  {viewingSpark.user_name}
                </p>
                <p className="text-[10px] text-white/80 drop-shadow-md">
                  {viewingSpark.expires_in || '24h'} • {viewingSpark.mood_badge || 'Spark'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setViewingSpark(null)}
              className="w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Details & Comments Overlay */}
        <div className="relative z-10 p-4 text-white space-y-3">
          {viewingSpark.type === 'music' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold">
              <Headphones className="w-3.5 h-3.5 text-secondary" />
              <span>{viewingSpark.track_title || 'Ambient Track'}</span>
            </div>
          )}

          <div>
            <h3 className="text-base font-extrabold drop-shadow-md">{viewingSpark.title}</h3>
            <p className="text-xs text-white/90 leading-relaxed mt-1 drop-shadow-md">
              {viewingSpark.caption}
            </p>
          </div>

          {/* Mini Comments Feed */}
          <div className="space-y-1 max-h-24 overflow-y-auto no-scrollbar py-1">
            {localComments.map((c, i) => (
              <p key={i} className="text-[11px] text-white/80 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-xl">
                {c}
              </p>
            ))}
          </div>

          {/* Comment & Reaction Bar */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              placeholder="Reply to this spark..."
              className="flex-1 bg-white/20 backdrop-blur-md placeholder:text-white/60 text-white text-xs px-3.5 py-2.5 rounded-full border border-white/30 outline-none"
            />

            <button
              onClick={() => reactToSpark(viewingSpark.id)}
              className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 transition-transform active:scale-125 ${
                viewingSpark.has_reacted ? 'bg-[#ff607d] text-white' : 'bg-white/20 text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${viewingSpark.has_reacted ? 'fill-white' : ''}`} />
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://bunnytalks.app/s/${viewingSpark.id}`);
                showToast('Spark link copied! ⚡');
              }}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
