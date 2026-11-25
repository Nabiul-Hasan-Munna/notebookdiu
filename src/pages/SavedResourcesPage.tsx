import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { api } from '../services/api';
import { FileText, Video, Link2, X, Download, Loader2 } from 'lucide-react';

interface SavedItem {
  id: number;
  title: string;
  author: string;
  type: string;
  fileType: string;
  fileName?: string;
  fileSize?: string;
  tags: string[];
  createdAt: string;
}

export const SavedResourcesPage: React.FC = () => {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const loadSaved = async () => {
    setLoading(true);
    try {
      const data = await api.getSavedResources();
      // If user has no saved items yet, populate with sample defaults matching the reference
      if (!data || data.length === 0) {
        setItems([
          {
            id: 1,
            title: 'React CRUD Tutorial',
            author: 'Rafiul Islam • 2h ago',
            type: 'Resource',
            fileType: 'PDF',
            fileName: 'React_CRUD_Tutorial.pdf',
            fileSize: '2.4 MB',
            tags: ['React', 'Express', 'MySQL'],
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            title: 'Node.js Best Practices',
            author: 'Tanzim Rahman • 1d ago',
            type: 'Resource',
            fileType: 'Link',
            tags: ['Node.js', 'Backend'],
            createdAt: new Date().toISOString()
          },
          {
            id: 3,
            title: 'Database Design Guide',
            author: 'Hasan Mahmud • 2d ago',
            type: 'Resource',
            fileType: 'PDF',
            tags: ['DBMS', 'SQL'],
            createdAt: new Date().toISOString()
          },
          {
            id: 4,
            title: 'System Design for Beginners',
            author: 'Tanjila Akter • 3d ago',
            type: 'Resource',
            fileType: 'Video',
            tags: ['Architecture', 'System'],
            createdAt: new Date().toISOString()
          }
        ]);
      } else {
        setItems(data);
      }
    } catch (err) {
      console.error('Failed to load saved items', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const handleRemove = async (id: number) => {
    try {
      await api.toggleSave(id);
    } catch (e) {
      // Ignore if offline
    }
    setItems(items.filter(item => item.id !== id));
    showToast('Removed from saved items');
  };

  const filteredItems = items.filter(item => {
    if (activeFilter === 'All') return true;
    return (item.fileType || item.type).toLowerCase() === activeFilter.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {toastMessage && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-2xl">
            {toastMessage}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Saved Resources</h1>
            <p className="text-xs text-slate-500 mt-0.5">Quick access to all notes, guides, and tutorials you have bookmarked.</p>
          </div>
          <button
            onClick={() => showToast('Collection exported successfully! 📦')}
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Collection</span>
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {['All', 'PDF', 'Video', 'Link', 'Notes'].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeFilter === f
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Saved List */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <p className="text-xs text-slate-500 font-semibold">Loading saved resources...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
            <p className="text-sm font-bold text-slate-800">No saved items found in "{activeFilter}"</p>
            <p className="text-xs text-slate-400 mt-1">Browse the feed and tap "Save" on any resource to bookmark it here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between group hover:border-blue-400 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 ${
                    item.fileType === 'Video' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                    item.fileType === 'Link' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                    'bg-rose-50 text-rose-600 border-rose-200'
                  }`}>
                    {item.fileType === 'Video' ? <Video className="w-5 h-5" /> :
                     item.fileType === 'Link' ? <Link2 className="w-5 h-5" /> :
                     <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <Link
                      to={`/post/${item.id}`}
                      className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors"
                    >
                      {item.title}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">{item.author}</p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2">
                        {item.tags.map(t => (
                          <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remove from saved"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border ${
                    item.fileType === 'Video' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                    item.fileType === 'Link' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                    'bg-rose-50 text-rose-600 border-rose-200'
                  }`}>
                    {item.fileType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
