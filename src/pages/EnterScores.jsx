import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate, useParams, Link } from "react-router-dom";
import { SUBJECTS_BY_LEVEL, TERMS, ACADEMIC_YEARS, getGrade } from "../utils/grading";

export default function EnterScores() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [term, setTerm] = useState("First Term");
  const [year, setYear] = useState("2025/2026");
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDoc(doc(db, "students", id));
      if (snap.exists()) setStudent({ id: snap.id, ...snap.data() });
      setLoading(false);
    };
    fetch();
  }, [id]);

  useEffect(() => {
    const fetchScores = async () => {
      if (!student) return;
      const key = `${year}_${term}`.replace(/\//g, "-").replace(/ /g, "_");
      const snap = await getDoc(doc(db, "scores", `${id}_${key}`));
      setScores(snap.exists() ? snap.data().scores || {} : {});
    };
    fetchScores();
  }, [student, term, year, id]);

  const handleScoreChange = (subject, value) => {
    if (value === "" || (parseFloat(value) >= 0 && parseFloat(value) <= 20)) {
      setScores((prev) => ({ ...prev, [subject]: value }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const key = `${year}_${term}`.replace(/\//g, "-").replace(/ /g, "_");
    await setDoc(doc(db, "scores", `${id}_${key}`), { studentId: id, term, year, scores, updatedAt: serverTimestamp() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading...</div>;
  if (!student) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Student not found.</div>;

  const subjects = SUBJECTS_BY_LEVEL[student.level] || [];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">← Back</Link>
          <div>
            <p className="font-bold text-white">{student.name}</p>
            <p className="text-slate-400 text-xs">{student.level} · {student.classSection}</p>
          </div>
        </div>
        <Link to={`/report/${id}`} className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors">View Report →</Link>
      </nav>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8 flex-wrap">
          <div className="flex-1 min-w-40">
            <label className="block text-xs text-slate-400 mb-1.5">Academic Year</label>
            <select value={year} onChange={(e) => setYear(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors">
              {ACADEMIC_YEARS.map((y) => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-40">
            <label className="block text-xs text-slate-400 mb-1.5">Term</label>
            <select value={term} onChange={(e) => setTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors">
              {TERMS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="font-bold text-white">Enter Scores (out of 20)</h2>
            <p className="text-slate-400 text-xs mt-1">{year} · {term}</p>
          </div>
          <div className="divide-y divide-slate-800">
            {subjects.map((subject) => {
              const score = scores[subject] ?? "";
              const { grade, remark, color } = getGrade(score);
              return (
                <div key={subject} className="px-6 py-3.5 flex items-center gap-4">
                  <div className="flex-1"><p className="text-sm font-medium text-white">{subject}</p></div>
                  <input type="number" min="0" max="20" step="0.5" value={score}
                    onChange={(e) => handleScoreChange(subject, e.target.value)}
                    className="w-20 bg-slate-800 border border-slate-700 text-white text-center rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="—" />
                  <div className="w-24 text-right">
                    {score !== "" && (<><span className={`text-sm font-bold ${color}`}>{grade}</span><span className="text-slate-500 text-xs ml-2">{remark}</span></>)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-lg text-sm transition-colors disabled:opacity-60">
          {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Scores"}
        </button>
      </div>
    </div>
  );
}
