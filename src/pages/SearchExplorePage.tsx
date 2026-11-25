import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Search, FileText, Video, Link2, HelpCircle, BookOpen, Loader2 } from 'lucide-react';
import { Post } from '../types';
import { api } from '../services/api';

export const SearchExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('search') || 'react CRUD');
  const [activeFilter, setActiveFilter] = useState(searchParams.get('type') || 'all');
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const posts = await api.getPosts({ search: keyword, type: activeFilter });
      setResults(posts);
    } catch (err) {
      console.error('Failed to search explore', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [activeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResults();
  };

  const getBadgeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
        return <Video className="w-5 h-5 text-blue-600" />;
      case 'link':
        return <Link2 className="w-5 h-5 text-emerald-600" />;
      case 'question':
        return <HelpCircle className="w-5 h-5 text-amber-600" />;
      default:
        return <FileText className="w-5 h-5 text-rose-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Search Header Banner Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by topic, course code, instructor or keyword..."
              className="w-full pl-11 pr-24 py-3 rounded-2xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-800 transition-all outline-none font-medium"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Search
            </button>
          </form>

          {/* Filter Tabs / Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            {['All', 'PDF', 'Video', 'Link', 'Question', 'Notes'].map((filter) => {
              const isActive = activeFilter.toLowerCase() === filter.toLowerCase();
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results List */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <p className="text-xs text-slate-500 font-semibold">Filtering resources...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
            <p className="text-sm font-bold text-slate-800">No resources found for "{keyword}"</p>
            <p className="text-xs text-slate-400 mt-1">Try searching with broader terms like 'React', 'SE-322' or 'SQL'.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between group cursor-pointer"
              >
                <Link to={`/post/${item.id}`} className="flex items-start gap-3.5 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    item.attachment?.type === 'Video' ? 'bg-blue-50 border-blue-200' :
                    item.attachment?.type === 'Link' ? 'bg-emerald-50 border-emerald-200' :
                    'bg-rose-50 border-rose-200'
                  }`}>
                    {getBadgeIcon(item.attachment?.type || item.type)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.author.name} • {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      {item.tags.map((t) => (
                        <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>

                <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border ${
                  item.attachment?.type === 'Video' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                  item.attachment?.type === 'Link' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                  'bg-rose-50 text-rose-600 border-rose-200'
                }`}>
                  {item.attachment?.type || item.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
