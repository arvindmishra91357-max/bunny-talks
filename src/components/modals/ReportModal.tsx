import React, { useState } from 'react';
import { ShieldAlert, X, CheckCircle2 } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'message' | 'user' | 'spark' | 'group' | 'channel';
  targetId: string;
  targetName?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId: _targetId,
  targetName,
}) => {
  const { addToast } = useChat();
  const [reason, setReason] = useState('spam');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      addToast('Thank you. Your report has been submitted to the Bunny Safety Team.', 'success');
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  const reportReasons = [
    { id: 'spam', label: 'Spam or malicious links' },
    { id: 'harassment', label: 'Harassment, hate speech, or bullying' },
    { id: 'inappropriate', label: 'Inappropriate or explicit content' },
    { id: 'impersonation', label: 'Impersonation or fake account' },
    { id: 'scam', label: 'Scam or fraud attempt' },
    { id: 'other', label: 'Other violation' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-bunny-card rounded-3xl p-6 shadow-2xl border border-bunny-border/50 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-bunny-border/30">
          <div className="flex items-center gap-2.5 text-rose-500 font-bold">
            <ShieldAlert className="w-6 h-6" />
            <h2 id="report-modal-title" className="text-lg text-bunny-text">
              Report {targetType.charAt(0).toUpperCase() + targetType.slice(1)}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-bunny-surface text-bunny-muted hover:text-bunny-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-10 text-center flex flex-col items-center justify-center">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 animate-bounce mb-3" />
            <h3 className="font-bold text-lg text-bunny-text">Report Received</h3>
            <p className="text-sm text-bunny-muted mt-1 max-w-xs">
              We take safety seriously. Our community team will review this shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <p className="text-xs text-bunny-muted">
              Reporting: <span className="font-semibold text-bunny-text">{targetName || targetType}</span>
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-bunny-muted uppercase tracking-wider">
                Select Reason
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {reportReasons.map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border text-sm cursor-pointer transition-all ${
                      reason === item.id
                        ? 'border-bunny-coral bg-bunny-coral/5 text-bunny-text font-semibold'
                        : 'border-bunny-border/40 hover:bg-bunny-surface text-bunny-muted'
                    }`}
                  >
                    <input
                      type="radio"
                      name="report-reason"
                      checked={reason === item.id}
                      onChange={() => setReason(item.id)}
                      className="text-bunny-coral focus:ring-bunny-coral/30"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-bunny-muted uppercase tracking-wider block mb-1">
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Help us understand the context..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-bunny-surface border border-bunny-border/50 text-bunny-text text-sm focus:outline-none focus:ring-2 focus:ring-bunny-coral/30 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-bunny-muted hover:bg-bunny-surface transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 transition-all"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
