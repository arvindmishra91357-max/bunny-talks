import React from 'react';

export const ChatListSkeleton: React.FC = () => {
  return (
    <div className="space-y-2 p-3 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white/40 dark:bg-white/5 border border-bunny-border">
          <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex justify-between items-center">
              <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-24" />
              <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded w-10" />
            </div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const MessagesSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 p-4 animate-pulse">
      <div className="flex items-start gap-2.5 max-w-[70%]">
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
        <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl rounded-tl-sm w-48" />
      </div>
      <div className="flex items-start gap-2.5 max-w-[70%] ml-auto flex-row-reverse">
        <div className="h-10 bg-slate-300 dark:bg-slate-700 rounded-2xl rounded-tr-sm w-56" />
      </div>
      <div className="flex items-start gap-2.5 max-w-[70%]">
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl rounded-tl-sm w-64" />
      </div>
    </div>
  );
};

export const SparksSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-3 p-3 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="aspect-[9/14] rounded-2xl bg-slate-200 dark:bg-slate-800 flex flex-col justify-between p-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-16" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-3/4" />
            <div className="h-2.5 bg-slate-300 dark:bg-slate-700 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};
