
import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  BookOpen,
  Pencil,
  Trash2,
  X,
  Loader2,
  RefreshCw,
  GraduationCap,
  Building2,
  AlertCircle
} from 'lucide-react';

import {
  api,
  AdminCourse,
  AdminDepartment,
  CoursePayload
} from '../../services/api';

const initialForm: CoursePayload = {
  code: '',
  name: '',
  department_id: 0,
  semester: '',
  description: ''
};

export const AdminCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [departments, setDepartments] = useState<AdminDepartment[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<AdminCourse | null>(null);
  const [form, setForm] = useState<CoursePayload>(initialForm);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [courseData, departmentData] = await Promise.all([
        api.getAdminCourses(),
        api.getAdminDepartments()
      ]);

      setCourses(courseData);
      setDepartments(departmentData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const term = search.toLowerCase();

      const matchesSearch =
        course.code.toLowerCase().includes(term) ||
        course.name.toLowerCase().includes(term) ||
        (course.department_name || '').toLowerCase().includes(term);

      const matchesDepartment =
        departmentFilter === 'ALL' ||
        String(course.department_id) === departmentFilter;

      return matchesSearch && matchesDepartment;
    });
  }, [courses, search, departmentFilter]);

  const openCreateModal = () => {
    setEditingCourse(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (course: AdminCourse) => {
    setEditingCourse(course);

    setForm({
      code: course.code,
      name: course.name,
      department_id: course.department_id || 0,
      semester: course.semester || '',
      description: course.description || ''
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingCourse(null);
    setForm(initialForm);
  };

  const updateField = (
    field: keyof CoursePayload,
    value: string | number
  ) => {
    setForm(previous => ({
      ...previous,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.code.trim() || !form.name.trim()) {
      notify('Course code and name are required.');
      return;
    }

    if (!form.department_id || !form.semester.trim()) {
      notify('Please select a department and semester.');
      return;
    }

    setSaving(true);

    try {
      const payload: CoursePayload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        semester: form.semester.trim(),
        description: form.description.trim()
      };

      if (editingCourse) {
        await api.updateAdminCourse(editingCourse.id, payload);
        notify('Course updated successfully.');
      } else {
        await api.createAdminCourse(payload);
        notify('Course created successfully.');
      }

      setModalOpen(false);
      setEditingCourse(null);
      setForm(initialForm);

      await loadData();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (course: AdminCourse) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${course.code} - ${course.name}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(course.id);

    try {
      await api.deleteAdminCourse(course.id);

      setCourses(previous =>
        previous.filter(item => item.id !== course.id)
      );

      notify('Course deleted successfully.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to delete course.');
    } finally {
      setDeletingId(null);
    }
  };

  const inputClass =
    'w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all';

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-5 py-3 rounded-xl text-xs font-semibold shadow-2xl max-w-[90%]">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Course Management
            </h1>
          </div>

          <p className="text-xs text-slate-500">
            Create, organize and manage university courses.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create New Course
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold">
                Total Courses
              </p>
              <h2 className="text-3xl font-black text-slate-900 mt-2">
                {courses.length}
              </h2>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold">
                Total Departments
              </p>
              <h2 className="text-3xl font-black text-slate-900 mt-2">
                {departments.length}
              </h2>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search course code, name or department..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white outline-none focus:border-blue-500"
          >
            <option value="ALL">All Departments</option>

            {departments.map(department => (
              <option key={department.id} value={String(department.id)}>
                {department.code} - {department.name}
              </option>
            ))}
          </select>

          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="flex-1 text-xs text-rose-700">{error}</div>
          <button
            onClick={loadData}
            className="text-xs font-bold text-rose-700 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Course Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-black text-sm text-slate-900">
              University Courses
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">
              {filteredCourses.length} courses found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center gap-3">
            <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
            <p className="text-xs font-semibold text-slate-500">
              Loading courses...
            </p>
          </div>
        ) : !error && filteredCourses.length === 0 ? (
          <div className="p-16 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />

            <h3 className="text-sm font-bold text-slate-700">
              No courses found
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              Try changing your search or create a new course.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[750px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4 font-bold">Course</th>
                  <th className="px-5 py-4 font-bold">Department</th>
                  <th className="px-5 py-4 font-bold">Semester</th>
                  <th className="px-5 py-4 font-bold">Resources</th>
                  <th className="px-5 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredCourses.map(course => (
                  <tr
                    key={course.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                          <BookOpen className="w-5 h-5" />
                        </div>

                        <div>
                          <p className="font-black text-slate-900">
                            {course.code}
                          </p>
                          <p className="text-slate-500 mt-1">
                            {course.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-700">
                        {course.department_code || 'N/A'}
                      </p>
                      <p className="text-slate-400 mt-1">
                        {course.department_name || 'Unknown'}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {course.semester || 'Not specified'}
                    </td>

                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold">
                        {Number(course.resources_count || 0)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(course)}
                          title="Edit course"
                          className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 flex items-center justify-center"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(course)}
                          disabled={deletingId === course.id}
                          title="Delete course"
                          className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center disabled:opacity-50"
                        >
                          {deletingId === course.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[90] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">

            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {editingCourse ? 'Edit Course' : 'Create New Course'}
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Enter the academic course information.
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Course Code *
                  </label>

                  <input
                    required
                    maxLength={50}
                    value={form.code}
                    onChange={e => updateField('code', e.target.value)}
                    placeholder="e.g. SE-322"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Semester *
                  </label>

                  <input
                    required
                    maxLength={100}
                    value={form.semester}
                    onChange={e => updateField('semester', e.target.value)}
                    placeholder="e.g. Fall 2026"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Course Name *
                </label>

                <input
                  required
                  maxLength={255}
                  value={form.name}
                  onChange={e => updateField('name', e.target.value)}
                  placeholder="Enter full course name"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Department *
                </label>

                <select
                  required
                  value={form.department_id || ''}
                  onChange={e =>
                    updateField('department_id', Number(e.target.value))
                  }
                  className={inputClass}
                >
                  <option value="">Select department</option>

                  {departments.map(department => (
                    <option key={department.id} value={department.id}>
                      {department.code} - {department.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Course Description
                </label>

                <textarea
                  rows={4}
                  maxLength={5000}
                  value={form.description}
                  onChange={e => updateField('description', e.target.value)}
                  placeholder="Describe the course..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || departments.length === 0}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      {editingCourse ? 'Save Changes' : 'Create Course'}
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
