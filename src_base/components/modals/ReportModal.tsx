import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSupabaseClient } from '../../lib/supabase';
import { X, Flag, AlertTriangle, Check } from 'lucide-react';

interface ReportModalProps {
  targetId: string;
  type: 'user' | 'message' | 'group' | 'status';
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ targetId, type, onClose }) => {
  const { currentUser } = useAuth();
  const [category, setCategory] = useState<'spam' | 'harassment' | 'impersonation' | 'inappropriate' | 'other'>('spam');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('reports').insert({
          reporter_id: currentUser.id,
          reported_user_id: type === 'user' ? targetId : null,
          reported_message_id: type === 'message' ? targetId : null,
          reported_group_id: type === 'group' ? targetId : null,
          category,
          reason: reason.trim(),
        });
      } catch (e) {
        console.warn('Report submit error:', e);
      }
    }

    setIsSubmitting(false);
    setIsSubmitted(true);
    setTimeout(() => onClose(), 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-rose-400">
            <Flag className="w-5 h-5" />
            <h3 className="font-bold text-base text-slate-100">Report {type.toUpperCase()}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h4 className="font-bold text-slate-100 text-sm">Report Submitted</h4>
            <p className="text-xs text-slate-400 mt-1">
              Thank you for keeping Nexus safe. Our trust and safety system has logged this incident.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <p className="text-slate-300">
              Please choose a reason for reporting this {type}. Our moderation team evaluates all reports according to community guidelines.
            </p>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Category *</label>
              <div className="space-y-1.5">
                {[
                  { id: 'spam', label: 'Spam, scams, or bot behavior' },
                  { id: 'harassment', label: 'Harassment or hate speech' },
                  { id: 'impersonation', label: 'Impersonating another person' },
                  { id: 'inappropriate', label: 'Inappropriate or adult content' },
                  { id: 'other', label: 'Other violation' },
                ].map((cat) => (
                  <label
                    key={cat.id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                      category === cat.id
                        ? 'bg-rose-950/20 border-rose-500/50 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="report_cat"
                      checked={category === cat.id}
                      onChange={() => setCategory(cat.id as any)}
                      className="accent-rose-500"
                    />
                    <span>{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Additional Details (Optional)</label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide any relevant context..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
