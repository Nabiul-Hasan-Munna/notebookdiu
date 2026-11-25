
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { api } from '../services/api';
import {
  BookOpen, FolderDown, HelpCircle, Code, Link2, Image,
  X, Bold, Italic, Strikethrough, Code2, List, ListOrdered,
  Link as LinkIcon, Paperclip, Upload, FileText, Trash2
} from 'lucide-react';

const MAX_FILES = 10;

const ALLOWED_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'ppt', 'pptx',
  'jpg', 'jpeg', 'png', 'webp'
];

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const PostComposerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [type, setType] = useState(searchParams.get('type') || 'Knowledge');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [department, setDepartment] = useState('Software Engineering');
  const [courseCode, setCourseCode] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
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

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (!selectedFiles.length) return;

    const invalidFiles = selectedFiles.filter((file) => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      return !extension || !ALLOWED_EXTENSIONS.includes(extension);
    });

    if (invalidFiles.length) {
      setError(
        `Unsupported file format: ${invalidFiles.map(f => f.name).join(', ')}`
      );
      e.target.value = '';
      return;
    }

    if (files.length + selectedFiles.length > MAX_FILES) {
      setError(`You can upload a maximum of ${MAX_FILES} files.`);
      e.target.value = '';
      return;
    }

    setError(null);
    setFiles((previous) => [...previous, ...selectedFiles]);

    // Allow selecting the same file again after removing it.
    e.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setFiles((previous) => previous.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError('Please provide title and content for your post.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.createPost({
        title: title.trim(),
        content: content.trim(),
        type,
        courseCode,
        tags,
        files
      });

      navigate('/feed');
    } catch (err: any) {
      setError(err.message || 'Failed to publish post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">

          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Create a Post
            </h2>

            <button
              type="button"
              onClick={() => navigate('/feed')}
              className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">

            {/* Contribution Type */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Contribution Type
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { name: 'Knowledge', icon: BookOpen },
                  { name: 'Resource', icon: FolderDown },
                  { name: 'Question', icon: HelpCircle },
                  { name: 'Project', icon: Code },
                  { name: 'Link', icon: Link2 },
                  { name: 'Media', icon: Image }
                ].map((item) => {
                  const Icon = item.icon;
                  const selected = type === item.name;

                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setType(item.name)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-xs font-semibold ${
                        selected
                          ? 'border-2 border-blue-600 bg-blue-50/70 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-1 ${selected ? 'text-blue-600' : 'text-slate-400'}`} />
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-xs text-slate-500 italic">
              Share your knowledge, explanation, tutorial or idea...
            </p>

            {/* Content Editor */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-1.5 text-slate-600 text-xs">
                <button type="button" className="p-1.5 rounded hover:bg-slate-200 font-bold" title="Bold">
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button type="button" className="p-1.5 rounded hover:bg-slate-200 italic" title="Italic">
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button type="button" className="p-1.5 rounded hover:bg-slate-200 line-through" title="Strikethrough">
                  <Strikethrough className="w-3.5 h-3.5" />
                </button>
                <span className="w-px h-4 bg-slate-300 mx-1" />
                <button type="button" className="p-1.5 rounded hover:bg-slate-200" title="Code">
                  <Code2 className="w-3.5 h-3.5" />
                </button>
                <button type="button" className="p-1.5 rounded hover:bg-slate-200" title="Bullet List">
                  <List className="w-3.5 h-3.5" />
                </button>
                <button type="button" className="p-1.5 rounded hover:bg-slate-200" title="Numbered List">
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button type="button" className="p-1.5 rounded hover:bg-slate-200" title="Link">
                  <LinkIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              <textarea
                rows={5}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your knowledge post, insights, code explanations or tips here..."
                className="w-full p-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Department & Course */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Department
                </label>

                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                >
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Electrical & Electronic Engineering">Electrical & Electronic Engineering</option>
                </select>
              </div>

           
            </div>

            {/* Topic */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Topic
              </label>

              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your post title..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tags
              </label>

              <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-500 hover:text-blue-800"
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
                  className="text-xs outline-none flex-1 min-w-[120px]"
                />
              </div>
            </div>

            {/* Multiple File Upload */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700">
                  Attach Files
                </label>
                <span className="text-xs text-slate-400">
                  {files.length}/{MAX_FILES} files
                </span>
              </div>

              <label
                className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${
                  files.length >= MAX_FILES
                    ? 'border-slate-200 bg-slate-100 cursor-not-allowed'
                    : 'border-blue-200 bg-blue-50/40 hover:bg-blue-50 hover:border-blue-400'
                }`}
              >
                <Upload className="w-8 h-8 text-blue-500 mb-3" />

                <span className="text-sm font-bold text-slate-700">
                  Click to select files
                </span>

                <span className="text-xs text-slate-500 mt-1">
                  PDF, DOC, DOCX, PPT, PPTX, JPG, PNG, WEBP
                </span>

                <span className="text-xs text-slate-400 mt-1">
                  Select multiple files (maximum 10)
                </span>

                <input
                  type="file"
                  multiple
                  disabled={files.length >= MAX_FILES || submitting}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {/* Selected File List */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-600">
                    Selected Files
                  </h4>

                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleRemoveFile(index)}
                        className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 disabled:opacity-50"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate('/feed')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-7 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md disabled:opacity-50"
              >
                {submitting ? 'Publishing...' : 'Publish'}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
};
