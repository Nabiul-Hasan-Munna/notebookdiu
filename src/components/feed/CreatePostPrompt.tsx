import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FolderDown, HelpCircle, Code, Link2, Image, Video } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const CreatePostPrompt: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
        <img
          src={user?.avatar_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80'}
          alt="Avatar"
          className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
        />
        <input
          type="text"
          readOnly
          onClick={() => navigate('/compose')}
          placeholder="What would you like to contribute to the universe?"
          className="w-full bg-slate-50 hover:bg-slate-100/80 px-4 py-2.5 rounded-xl text-xs text-slate-700 placeholder-slate-400 border border-slate-200/80 cursor-pointer transition-all"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/compose?type=Knowledge')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Knowledge</span>
          </button>

          <button
            onClick={() => navigate('/compose?type=Resource')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold transition-colors"
          >
            <FolderDown className="w-3.5 h-3.5 text-sky-600" />
            <span>Resource</span>
          </button>

          <button
            onClick={() => navigate('/ask')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Question</span>
          </button>

          <button
            onClick={() => navigate('/compose?type=Project')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-colors"
          >
            <Code className="w-3.5 h-3.5 text-emerald-600" />
            <span>Project</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <button onClick={() => navigate('/compose?type=Link')} className="hover:text-blue-600 p-1" title="Link">
              <Link2 className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/compose?type=Media')} className="hover:text-blue-600 p-1" title="Image">
              <Image className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/compose?type=Media')} className="hover:text-blue-600 p-1" title="Video">
              <Video className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => navigate('/compose')}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};
