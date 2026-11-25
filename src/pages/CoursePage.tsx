
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Course } from '../types';
import { api } from '../services/api';
import {
  BookOpen, FileText, MessageSquare, Users,
  ChevronRight, Loader2, GraduationCap
} from 'lucide-react';

export const CoursePage: React.FC = () => {
  const { code = 'SE-322' } = useParams<{ code: string }>();

  const [course, setCourse] = useState<Course | null>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'discussions' | 'members'>('overview');
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [message, setMessage] = useState('');
    const [resourceTitle, setResourceTitle] = useState('');
  const [resourceContent, setResourceContent] = useState('');
  const [resourceCategory, setResourceCategory] = useState('Notes');
  const [resourceFiles, setResourceFiles] = useState<File[]>([]);
  const [uploadingResource, setUploadingResource] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  const loadCourse = async () => {
    setLoading(true);
    try {
      const data = await api.getCourseByCode(code);
      setCourse(data.course);
      setResources(data.resources || []);

      try {
        const enrolledCourses = await api.getEnrolledCourses();
        setEnrolled(enrolledCourses.some(c => c.id === data.course.id));
      } catch {
        setEnrolled(false);
      }
    } catch (err) {
      console.error('Failed to load course', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourse();
  }, [code]);

  const handleEnrollment = async () => {
    if (!course || enrollmentLoading) return;

    setEnrollmentLoading(true);
    setMessage('');

    try {
      if (enrolled) {
        await api.unenrollFromCourse(course.id);
        setEnrolled(false);
        setMessage('You have successfully unenrolled from this course.');
      } else {
        await api.enrollInCourse(course.id);
        setEnrolled(true);
        setMessage('You have successfully enrolled in this course.');
      }
    } catch (err: any) {
      setMessage(err.message || 'Something went wrong.');
    } finally {
      setEnrollmentLoading(false);
    }
  };

    const handleResourceUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!course || !enrolled || uploadingResource) return;

    if (!resourceTitle.trim() || !resourceContent.trim()) {
      setUploadMessage('Please enter a title and description.');
      return;
    }

    if (resourceFiles.length === 0) {
      setUploadMessage('Please select at least one file.');
      return;
    }

    setUploadingResource(true);
    setUploadMessage('');

    try {
      await api.createPost({
        title: resourceTitle.trim(),
        content: resourceContent.trim(),
        type: 'Resource',
        courseCode: course.code,
        tags: [resourceCategory],
        files: resourceFiles
      });

      setResourceTitle('');
      setResourceContent('');
      setResourceCategory('Notes');
      setResourceFiles([]);

      setUploadMessage('Resource uploaded successfully!');

      await loadCourse();
      setActiveTab('resources');
    } catch (err: any) {
      setUploadMessage(err.message || 'Resource upload failed.');
    } finally {
      setUploadingResource(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link to="/feed" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/explore" className="hover:text-blue-600">Courses</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-bold">{code}</span>
        </nav>

        {loading || !course ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <p className="text-xs text-slate-500 font-semibold">Loading course details...</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold mb-2">
                  COURSE CODE: {course.code}
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {course.name}
                </h1>
                <p className="text-xs md:text-sm text-slate-500 mt-1">
                  Department: <span className="font-semibold text-slate-700">{course.department_name || 'Not specified'}</span>
                  {' '}• Semester: <span className="font-semibold text-slate-700">{course.semester || 'Not specified'}</span>
                </p>
              </div>

              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 p-1 flex items-center justify-center text-white shadow-lg shrink-0">
                <div className="w-full h-full bg-slate-900/20 rounded-[14px] flex items-center justify-center text-2xl font-mono font-bold">
                  &lt;/&gt;
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {enrolled ? 'You are enrolled' : 'Join this course'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {enrolled
                      ? 'You can access this course through My Courses.'
                      : 'Enroll to become a member of this course.'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleEnrollment}
                disabled={enrollmentLoading}
                className={`px-6 py-3 rounded-xl text-xs font-bold transition-colors disabled:opacity-60 ${
                  enrolled
                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {enrollmentLoading
                  ? 'Please wait...'
                  : enrolled ? 'Unenroll from Course' : 'Enroll in Course'}
              </button>
            </div>

            {message && (
              <p className="text-sm text-slate-600 px-1">{message}</p>
            )}

            <div className="border-b border-slate-200 flex items-center gap-8 text-xs font-bold text-slate-500 overflow-x-auto">
              {([
                ['overview', BookOpen, 'Overview'],
                ['resources', FileText, `Resources (${resources.length})`],
                ['discussions', MessageSquare, 'Discussions'],
                ['members', Users, 'Members'],
              ] as const).map(([tab, Icon, label]) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-6">
                {activeTab === 'overview' && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-sm text-slate-900">Course Description</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {course.description || 'No course description has been added yet.'}
                    </p>
                  </div>
                )}

               
                {activeTab === 'resources' && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">

                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        Course Materials
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Share notes, slides, assignments and study resources.
                      </p>
                    </div>

                    {enrolled && (
                      <form
                        onSubmit={handleResourceUpload}
                        className="border border-slate-200 rounded-xl p-4 space-y-3"
                      >
                        <h4 className="font-bold text-sm text-slate-800">
                          Upload Learning Material
                        </h4>

                        <input
                          type="text"
                          placeholder="Material title"
                          value={resourceTitle}
                          onChange={e => setResourceTitle(e.target.value)}
                          className="w-full border rounded-lg p-3 text-sm"
                          required
                        />

                        <textarea
                          placeholder="Describe this material..."
                          value={resourceContent}
                          onChange={e => setResourceContent(e.target.value)}
                          className="w-full border rounded-lg p-3 text-sm"
                          rows={3}
                          required
                        />

                        <select
                          value={resourceCategory}
                          onChange={e => setResourceCategory(e.target.value)}
                          className="w-full border rounded-lg p-3 text-sm"
                        >
                          <option value="Notes">Notes</option>
                          <option value="Slides">Slides</option>
                          <option value="Assignments">Assignments</option>
                          <option value="Books">Books</option>
                          <option value="Others">Others</option>
                        </select>

                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm"
                          onChange={e =>
                            setResourceFiles(Array.from(e.target.files || []))
                          }
                          className="w-full text-xs"
                        />

                        {resourceFiles.length > 0 && (
                          <p className="text-xs text-slate-500">
                            {resourceFiles.length} file(s) selected
                          </p>
                        )}

                        <button
                          type="submit"
                          disabled={uploadingResource}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 text-xs font-bold disabled:opacity-50"
                        >
                          {uploadingResource ? 'Uploading...' : 'Upload Material'}
                        </button>

                        {uploadMessage && (
                          <p className="text-xs text-slate-600">
                            {uploadMessage}
                          </p>
                        )}
                      </form>
                    )}

                    {!enrolled && (
                      <p className="text-xs text-slate-500">
                        Enroll in this course to upload learning materials.
                      </p>
                    )}

                    <div className="space-y-3">
                      <h4 className="font-bold text-sm text-slate-800">
                        Shared Materials ({resources.length})
                      </h4>

                      {resources.length === 0 ? (
                        <p className="text-xs text-slate-500">
                          No materials have been shared yet.
                        </p>
                      ) : (
                        resources.map(item => (
                          <Link
                            key={item.id}
                            to={`/post/${item.id}`}
                            className="block p-4 rounded-xl border border-slate-100 hover:bg-slate-50"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <h4 className="text-sm font-bold text-slate-800">
                                  {item.title}
                                </h4>

                                <p className="text-xs text-slate-500 mt-1">
                                  {item.author} · {new Date(item.createdAt).toLocaleDateString()}
                                </p>

                                <p className="text-xs text-blue-600 mt-2">
                                  {item.attachments?.length || 0} attachment(s)
                                </p>
                              </div>

                              <span className="text-xs font-semibold text-blue-600">
                                Open →
                              </span>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}


                {activeTab === 'discussions' && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h3 className="font-bold text-sm text-slate-900">Course Discussions</h3>
                    <p className="text-xs text-slate-500 mt-2">Course discussions will appear here.</p>
                  </div>
                )}

                {activeTab === 'members' && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h3 className="font-bold text-sm text-slate-900">Course Members</h3>
                    <p className="text-xs text-slate-500 mt-2">Course members will appear here.</p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-4 space-y-4">
                <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 space-y-2">
                  <h4 className="font-bold text-xs text-blue-900">Have a Question About {course.code}?</h4>
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    Ask fellow students taking this course or share lab solution approaches.
                  </p>
                  <Link
                    to="/ask"
                    className="block text-center w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs mt-1"
                  >
                    Ask Question in {course.code}
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
