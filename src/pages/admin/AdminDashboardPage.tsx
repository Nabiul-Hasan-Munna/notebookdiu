import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { AdminKPIs, AdminReport } from '../../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Users, FileText, MessageSquare, BookOpen, AlertTriangle, ArrowUpRight, Loader2 } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const AdminDashboardPage: React.FC = () => {
  const [kpis, setKpis] = useState<AdminKPIs>({
  totalStudents: 0,
  totalResources: 0,
  totalDiscussions: 0,
  totalCourses: 0,
  reportedContent: 0
});
  const [chartDataState, setChartDataState] = useState<any[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const loadData = async () => {
    try {
      const [statsData, reportsData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminReports()
      ]);
      setKpis(statsData.kpis);
      setChartDataState(statsData.chartData);
      setReports(reportsData);
    } catch (err) {
      console.error('Failed to load admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickResolve = async (reportId: number) => {
    try {
      await api.resolveReport(reportId, 'RESOLVED');
      setReports(reports.filter(r => r.id !== reportId));
      showToast('Report reviewed and resolved! âœ…');
    } catch (err: any) {
      showToast(err.message || 'Action failed');
    }
  };

  const barChartData = {
    labels: chartDataState.map(d => d.month) || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Resource Uploads',
        data: chartDataState.map(d => d.uploads) || [180, 240, 210, 390, 480, 320],
        backgroundColor: '#3b82f6',
        hoverBackgroundColor: '#2563eb',
        borderRadius: 6,
        barThickness: 28
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0b1a3c',
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#f1f5f9' }, beginAtZero: true }
    }
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-2xl">
          {toastMessage}
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-xs text-slate-500">UniverseDIU platform analytics and moderation center</p>
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
            Spring 2026 Live
          </span>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <p className="text-xs text-slate-500 font-semibold">Loading dashboard metrics...</p>
        </div>
      ) : (
        <>
          {/* 5 KPI Metric Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400">Total Students</span>
              <h3 className="text-2xl font-black text-slate-900">{(kpis.totalStudents ?? 0).toLocaleString()}</h3>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center">
                â†‘ +12% this term
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400">Total Resources</span>
              <h3 className="text-2xl font-black text-slate-900">{(kpis.totalResources ?? 0).toLocaleString()}</h3>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center">
                â†‘ +8.5%
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400">Total Discussions</span>
              <h3 className="text-2xl font-black text-slate-900">{(kpis.totalDiscussions ?? 0).toLocaleString()}</h3>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center">
                â†‘ +15.2%
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400">Total Courses</span>
              <h3 className="text-2xl font-black text-slate-900">{(kpis.totalCourses ?? 0).toLocaleString()}</h3>
              <span className="text-[10px] text-blue-600 font-bold">
                12 Departments
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400">Reported Content</span>
              <h3 className="text-2xl font-black text-rose-600">{kpis.reportedContent}</h3>
              <span className="text-[10px] text-rose-500 font-bold">
                {reports.length} pending review
              </span>
            </div>
          </div>

          {/* Analytics Chart & Moderation Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Monthly Bar Chart */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Resource Uploads</h3>
                  <span className="text-xs text-slate-400 font-medium">Monthly Statistics</span>
                </div>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">
                  Jan - Jun 2026
                </span>
              </div>
              <div className="h-64 w-full">
                <Bar data={barChartData} options={chartOptions} />
              </div>
            </div>

            {/* Quick Reports Moderation List */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">Recent Reports</h3>
                <Link to="/admin/moderation" className="text-xs font-semibold text-blue-600 hover:underline">
                  View All
                </Link>
              </div>

              {reports.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No pending content reports ðŸŽ‰
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.slice(0, 4).map((r) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs hover:border-slate-200 transition-colors"
                    >
                      <div>
                        <h4 className="font-bold text-slate-800">{r.reason}</h4>
                        <p className="text-[11px] text-slate-400">
                          {r.post_title ? `Post: ${r.post_title.substring(0, 22)}...` : 'Reported 2h ago'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleQuickResolve(r.id)}
                        className="px-3 py-1 rounded-lg bg-rose-50 text-rose-600 font-bold border border-rose-200 hover:bg-rose-100 transition-colors"
                      >
                        Review
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

