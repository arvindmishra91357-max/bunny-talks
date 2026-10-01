import React from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { Plus } from 'lucide-react';

interface ActiveSparksRailProps {
  showTitle?: boolean;
}

export const ActiveSparksRail: React.FC<ActiveSparksRailProps> = ({ showTitle = true }) => {
  const { sparks, setViewingSpark, setIsCreateSparkOpen, setActiveTab } = useChat();
  const { currentUser } = useAuth();

  return (
    <div className="w-full py-2">
      {showTitle && (
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">⚡</span>
            <h3 className="text-xs font-extrabold text-bunny-ink">Active Sparks</h3>
          </div>
          <button
            onClick={() => setActiveTab('sparks')}
            className="section-action-btn"
          >
            <span>View All ({sparks.length})</span>
          </button>
        </div>
      )}

      {/* Horizontal Rail */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 px-1">
        {/* Add Spark / My Story */}
        <div
          onClick={() => setIsCreateSparkOpen(true)}
          className="flex flex-col items-center flex-shrink-0 space-y-1.5 cursor-pointer group"
        >
          <div className="relative w-14 h-14 rounded-full bg-bunny-border/50 dark:bg-white/10 flex items-center justify-center transition-transform group-hover:scale-105 active:scale-95 shadow-sm">
            <img
              src={currentUser?.avatar_url || '/assets/maya.png'}
              alt="My Avatar"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white rounded-full flex items-center justify-center shadow-md ring-2 ring-white dark:ring-[#181524]">
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>
          <span className="text-[10px] font-bold text-bunny-ink max-w-[62px] truncate text-center">
            My Spark
          </span>
        </div>

        {/* Existing Sparks from Network */}
        {sparks.map((spark) => (
          <div
            key={spark.id}
            onClick={() => setViewingSpark(spark)}
            className="flex flex-col items-center flex-shrink-0 space-y-1.5 cursor-pointer group"
          >
            <div className="relative w-14 h-14 rounded-full p-[2.5px] bg-gradient-to-tr from-[#ff607d] via-[#7b5cf5] to-[#10b981] shadow-sm transition-transform group-hover:scale-105 active:scale-95">
              <div className="w-full h-full rounded-full bg-white dark:bg-[#181524] p-[2px]">
                <img
                  src={spark.user_avatar}
                  alt={spark.user_name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              {/* Online ping or mood icon */}
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#181524] shadow-[0_0_8px_rgba(16,185,129,0.7)] flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              </div>
            </div>

            <div className="flex flex-col items-center max-w-[64px]">
              <span className="text-[10px] font-bold text-bunny-ink truncate">
                {spark.user_name.split(' ')[0]}
              </span>
              <span className="text-[9px] font-semibold text-bunny-muted truncate">
                {spark.mood_badge || 'Active'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
