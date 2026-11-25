import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { api } from '../services/api';
import { ArrowLeft, Send } from 'lucide-react';

export const AskQuestionPage: React.FC = () => {
  const navigate = useNavigate();

  const [question, setQuestion] = useState('How does JWT authentication actually work in Express?');
  const [details, setDetails] = useState(`I understand that JWT has three parts (Header.Payload.Signature), but how does verify() ensure the token wasn't tampered with if anyone can decode base64? 

Here is my middleware snippet:
jwt.verify(token, process.env.JWT_SECRET, (err, user) => { ... })`);
  const [department, setDepartment] = useState('Software Engineering');
  const [courseCode, setCourseCode] = useState('SE-322');
  const [tags, setTags] = useState<string[]>(['JWT', 'Express', 'Node.js']);
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      setError('Please state your question clearly.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.createPost({
        title: question.trim(),
        content: details.trim() || question.trim(),
        type: 'Question',
        courseCode,
        tags
      });
      navigate('/feed');
    } catch (err: any) {
      setError(err.message || 'Failed to submit question');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        {/* Back Link */}
        <Link
          to="/feed"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ask a Question</h1>
            <p className="text-xs text-slate-500 mt-1">Get help from your fellow DIU students & course seniors</p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">What's your question?</label>
              <input
                type="text"
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. How does JWT authentication actually work in Express?"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs text-slate-800 transition-all outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Provide details or code snippet</label>
              <textarea
                rows={6}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain what you are trying to achieve, what error you received, or paste relevant code..."
                className="w-full p-4 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs text-slate-800 transition-all outline-none resize-none font-mono leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                >
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Electrical & Electronic Engineering">Electrical & Electronic Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Course</label>
                <select
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                >
                  <option value="SE-322">SE-322 (Web Application Lab)</option>
                  <option value="SE-213">SE-213 (OOP)</option>
                  <option value="CSE-311">CSE-311 (DBMS)</option>
                  <option value="MAT-111">MAT-111 (Calculus)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tags</label>
              <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-blue-400 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type tag & press Enter..."
                  className="text-xs text-slate-700 outline-none flex-1 min-w-[120px]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{submitting ? 'Posting Question...' : 'Post Question'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
