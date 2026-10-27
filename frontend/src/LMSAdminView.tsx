import React, { useState, useEffect } from 'react';
import { Assignment, AssignmentSubmission, ExamSession } from './types';

export function LMSAdminView() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [examSessions, setExamSessions] = useState<ExamSession[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<AssignmentSubmission | null>(null);

  // Form state for creating assignment
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classroomId: 'cls_10_mipa_1',
    subjectId: 'sbj_math_10',
    facultyId: 'fac_budi',
    examSessionId: '',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    maxScore: 100,
    weightage: 10,
  });

  // Grading form state
  const [gradeData, setGradeData] = useState({
    score: 90,
    grade: 'A',
    feedback: 'Kerja bagus!',
    syncToExam: true,
  });

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/lms/assignments?schoolId=sch_smp_01');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAssignments(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch assignments', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExamSessions = async () => {
    try {
      const res = await fetch('/api/exams/sessions');
      const data = await res.json();
      if (Array.isArray(data)) {
        setExamSessions(data);
      }
    } catch (err) {
      console.error('Failed to fetch exam sessions', err);
    }
  };

  const fetchSubmissions = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    try {
      const res = await fetch(`/api/lms/assignments/${assignment.id}/submissions`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSubmissions(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch submissions', err);
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchExamSessions();
  }, []);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/lms/assignments?schoolId=sch_smp_01', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          schoolId: 'sch_smp_01',
          examSessionId: formData.examSessionId || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        fetchAssignments();
      } else {
        alert(data.error || 'Gagal membuat tugas');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan');
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;
    try {
      const res = await fetch(`/api/lms/submissions/${gradingSubmission.id}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeData),
      });
      const data = await res.json();
      if (data.success) {
        setGradingSubmission(null);
        if (selectedAssignment) fetchSubmissions(selectedAssignment);
      } else {
        alert(data.error || 'Gagal menyimpan nilai');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Assignment & LMS (Manajemen Tugas Guru)</h1>
          <p className="text-xs text-slate-600 mt-1">
            Terbitkan tugas mandiri ke kelas, periksa pengumpulan tugas siswa, dan input penilaian/rapor formatif.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded bg-[#714B67] text-white hover:bg-[#583950] transition shadow-sm"
        >
          <i className="fa-solid fa-plus mr-2"></i> Terbitkan Tugas Baru
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignment List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Daftar Tugas Aktif</h2>
          {loading ? (
            <div className="text-xs text-slate-600 p-4 bg-white rounded border border-slate-200">Memuat data tugas...</div>
          ) : assignments.length === 0 ? (
            <div className="text-xs text-slate-600 p-4 bg-white rounded border border-slate-200">Belum ada tugas yang diterbitkan.</div>
          ) : (
            assignments.map((item) => (
              <div
                key={item.id}
                onClick={() => fetchSubmissions(item)}
                className={`p-4 rounded border cursor-pointer transition ${
                  selectedAssignment?.id === item.id
                    ? 'border-[#714B67] bg-purple-50/30 ring-1 ring-[#714B67]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{item.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                    {item.status}
                  </span>
                </div>
                <div className="text-xs text-slate-600 mt-1 line-clamp-2">{item.description}</div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600 border-t border-slate-100 pt-2">
                  <span>Tenggat: <strong className="text-slate-800">{item.dueDate}</strong></span>
                  <span>Maks: <strong className="text-slate-800">{item.maxScore} Poin</strong></span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Submissions & Grading Panel */}
        <div className="lg:col-span-2">
          {selectedAssignment ? (
            <div className="bg-white rounded border border-slate-200 p-5 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">{selectedAssignment.title}</h3>
                  <span className="text-xs text-slate-600">Bobot Nilai: {selectedAssignment.weightage}%</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{selectedAssignment.description}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Pengumpulan Siswa ({submissions.length})
                </h4>
                {submissions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-600 border border-dashed border-slate-200 rounded">
                    Belum ada siswa yang mengumpulkan tugas ini.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded">
                    <table className="w-full text-left text-xs text-slate-800">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                        <tr>
                          <th className="py-2.5 px-3">Siswa</th>
                          <th className="py-2.5 px-3">Tgl Serah</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Skor / Nilai</th>
                          <th className="py-2.5 px-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {submissions.map((sub) => (
                          <tr key={sub.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-medium text-slate-900">{sub.studentName || sub.studentId}</td>
                            <td className="py-2.5 px-3 text-slate-600">{sub.submissionDate}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                sub.status === 'graded'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-blue-50 text-blue-800 border border-blue-200'
                              }`}>
                                {sub.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">
                              {sub.score !== null && sub.score !== undefined ? `${sub.score} (${sub.grade || '-'})` : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => {
                                  setGradingSubmission(sub);
                                  setGradeData({
                                    score: sub.score || 90,
                                    grade: sub.grade || 'A',
                                    feedback: sub.feedback || 'Bagus',
                                    syncToExam: true,
                                  });
                                }}
                                className="px-2.5 py-1 text-[11px] font-semibold text-[#714B67] hover:bg-purple-50 rounded border border-[#714B67] transition"
                              >
                                Beri Nilai
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded p-12 text-center text-xs text-slate-600">
              Pilih salah satu tugas di sebelah kiri untuk melihat daftar pengumpulan siswa dan menginput nilai.
            </div>
          )}
        </div>
      </div>

      {/* Modal Create Assignment */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Terbitkan Tugas Baru</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-600 hover:text-slate-800">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleCreateAssignment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">Judul Tugas</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded focus:border-[#714B67] focus:outline-hidden"
                  placeholder="Misal: Latihan Soal Persamaan Kuadrat"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">Instruksi / Deskripsi</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded focus:border-[#714B67] focus:outline-hidden"
                  placeholder="Jelaskan instruksi pengerjaan tugas bagi siswa..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Tenggat Waktu (Due Date)</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded focus:border-[#714B67] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Tautkan ke Ujian/Rapor (Opsional)</label>
                  <select
                    value={formData.examSessionId}
                    onChange={(e) => setFormData({ ...formData, examSessionId: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded focus:border-[#714B67] focus:outline-hidden"
                  >
                    <option value="">-- Murni Tugas Mandiri --</option>
                    {examSessions.map((session) => (
                      <option key={session.id} value={session.id}>{session.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Skor Maksimum</label>
                  <input
                    type="number"
                    value={formData.maxScore}
                    onChange={(e) => setFormData({ ...formData, maxScore: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded focus:border-[#714B67] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Bobot Nilai (%)</label>
                  <input
                    type="number"
                    value={formData.weightage}
                    onChange={(e) => setFormData({ ...formData, weightage: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded focus:border-[#714B67] focus:outline-hidden"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded bg-[#714B67] text-white hover:bg-[#583950] transition"
                >
                  Terbitkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Grading */}
      {gradingSubmission && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Beri Nilai Tugas Siswa</h3>
              <button onClick={() => setGradingSubmission(null)} className="text-slate-600 hover:text-slate-800">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleGradeSubmission} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">Skor Numerik (0-100)</label>
                <input
                  type="number"
                  required
                  min={0}
                  max={100}
                  value={gradeData.score}
                  onChange={(e) => setGradeData({ ...gradeData, score: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded focus:border-[#714B67] focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">Predikat / Grade (A, B, C, D)</label>
                <input
                  type="text"
                  required
                  value={gradeData.grade}
                  onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded focus:border-[#714B67] focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">Catatan Umpan Balik (Feedback)</label>
                <textarea
                  rows={3}
                  value={gradeData.feedback}
                  onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded focus:border-[#714B67] focus:outline-hidden"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={gradeData.syncToExam}
                  onChange={(e) => setGradeData({ ...gradeData, syncToExam: e.target.checked })}
                  className="rounded text-[#714B67]"
                />
                <span>Sinkronisasi nilai ke sesi ujian terkait (jika ada)</span>
              </label>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded bg-[#714B67] text-white hover:bg-[#583950] transition"
                >
                  Simpan Nilai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
