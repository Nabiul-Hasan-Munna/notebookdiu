import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { AdminReport } from '../../types';
import { ShieldAlert, Check, X, Trash2, Loader2, AlertCircle } from 'lucide-react';

export const AdminModerationPage: React.FC = () => {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminReports();
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleAction = async (reportId: number, status: 'RESOLVED' | 'DISMISSED', action?: 'DELETE_POST') => {
    try {
      await api.resolveReport(reportId, status, action);
      setReports(reports.map(r => r.id === reportId ? { ...r, status } : r));
      showToast(action === 'DELETE_POST' ? 'Post deleted and report resolved! 🗑️' : `Report marked as ${status}!`);
    } catch (err: any) {
      showToast(err.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-2xl">
          {toastMessage}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Content Moderation Queue</h1>
        <p className="text-xs text-slate-500">Review reported academic posts, spam flags, and user safety reports</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <p className="text-xs text-slate-500 font-semibold">Loading moderation queue...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <p className="text-sm font-bold text-slate-800">Clean Queue! 🎉</p>
          <p className="text-xs text-slate-400 mt-1">There are no flagged posts or pending reports at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {report.reason}
                  </span>
                  <span className="text-xs text-slate-400">
                    Reported by <strong className="text-slate-700">{report.reporter_name}</strong> ({report.reporter_email})
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  report.status === 'PENDING'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : report.status === 'RESOLVED'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  STATUS: {report.status}
                </span>
              </div>

              {/* Reported Post Preview */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reported Post Content:</p>
                <h4 className="text-sm font-bold text-slate-900">{report.post_title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{report.post_content}</p>
              </div>

              {/* Action Buttons */}
              {report.status === 'PENDING' && (
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => handleAction(report.id, 'DISMISSED')}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Dismiss Flag</span>
                  </button>

                  <button
                    onClick={() => handleAction(report.id, 'RESOLVED')}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Keep Post & Resolve</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this reported post from UniverseDIU?')) {
                        handleAction(report.id, 'RESOLVED', 'DELETE_POST');
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Reported Post</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
